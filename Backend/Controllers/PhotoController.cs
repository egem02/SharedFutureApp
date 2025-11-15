using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Backend.Data;
using SharedFutureApp.Backend.Dtos;
using SharedFutureApp.Backend.Models;

namespace SharedFutureApp.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PhotoController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ApplicationDbContext _context;

    public PhotoController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // Tüm fotoğrafları getir (UI refresh için)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Photo>>> GetAll()
    {
        return await _context.Photos.ToListAsync();
    }

    // Fotoğraf yükleme endpoint
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<Photo>> Upload([FromForm] PhotoUploadDto dto)
    {
        if (dto.Photo == null)
            return BadRequest("Photo file is required.");

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
            UploadedAt = DateTime.Now
        };

        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();

        return Ok(photo);
    }

    // Fotoğraf sil
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var photo = await _context.Photos.FindAsync(id);
        if (photo == null) return NotFound();

        // Fiziksel dosyayı da sil
        var fullPath = Path.Combine(_env.WebRootPath, "uploads", photo.FileName);
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
