using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Data;
using SharedFutureApp.Dtos;
using SharedFutureApp.Models;

namespace SharedFutureApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public partial class PhotoController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ApplicationDbContext _context;

    public PhotoController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // Tüm fotoğrafları getir (albüm bilgisi ile)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var photos = await _context.Photos
            .Include(p => p.Album)
            .Select(p => new
            {
                p.Id,
                p.FileName,
                p.FilePath,
                p.UploadedAt,
                p.AlbumId,            // PascalCase
                AlbumName = p.Album != null ? p.Album.Name : null // PascalCase
            })
            .ToListAsync();

        return Ok(photos);
    }

    // Fotoğraf yükleme endpoint (albüm desteği ile)
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<object>> Upload([FromForm] PhotoUploadDto dto)
    {
        if (dto.Photo == null)
            return BadRequest("Fotoğraf dosyası gereklidir.");

        // Albüm varsa kontrol et
        if (dto.AlbumId.HasValue)
        {
            var album = await _context.Albums.FindAsync(dto.AlbumId.Value);
            if (album == null)
                return BadRequest("Albüm bulunamadı");
        }

        // Kayıt klasörü
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid() + Path.GetExtension(dto.Photo.FileName);
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Photo.CopyToAsync(stream);
        }

        var photo = new Photo
        {
            FileName = fileName,
            FilePath = "/uploads/" + fileName,
            UploadedAt = DateTimeOffset.Now,
            AlbumId = dto.AlbumId
        };

        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();

        // Albüm adı ile döndür
        var albumName = dto.AlbumId.HasValue
            ? await _context.Albums
                .Where(a => a.Id == dto.AlbumId.Value)
                .Select(a => a.Name)
                .FirstOrDefaultAsync()
            : null;

        return Ok(new
        {
            photo.Id,
            photo.FileName,
            photo.FilePath,
            photo.UploadedAt,
            photo.AlbumId,   // PascalCase
            AlbumName = albumName       // PascalCase
        });
    }

    // Fotoğraf sil
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var photo = await _context.Photos.FindAsync(id);
        if (photo == null)
            return NotFound();

        // Fiziksel dosyayı da sil
        var fullPath = Path.Combine(_env.WebRootPath, "uploads", photo.FileName);
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
