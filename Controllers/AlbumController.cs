using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Data;
using SharedFutureApp.Dtos.AlbumDtos;
using SharedFutureApp.Models;

namespace SharedFutureApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public partial class AlbumController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AlbumController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Tüm albümleri getir
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var albums = await _context.Albums
            .Include(a => a.Photos)
            .Select(a => new
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                PhotoCount = a.Photos.Count
            })
            .ToListAsync();

        return Ok(albums);
    }

    // Albüm getir (ID ile)
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetById(int id)
    {
        var album = await _context.Albums
            .Include(a => a.Photos)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (album == null)
            return NotFound();

        return Ok(new
        {
            Id = album.Id,
            Name = album.Name,
            Description = album.Description,
            PhotoCount = album.Photos.Count
        });
    }

    // Albüm oluştur
    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CreateAlbumDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var album = new Album
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Albums.Add(album);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Id = album.Id,
            Name = album.Name,
            Description = album.Description,
            PhotoCount = 0
        });
    }
    [HttpPut("/api/photo/{photoId}/assignAlbum")]
    public async Task<IActionResult> AssignPhotoToAlbum(int photoId, [FromBody] AssignAlbumDto dto)
    {
        var photo = await _context.Photos.FindAsync(photoId);
        if (photo == null)
            return NotFound();

        // Albüm ID atanıyor
        photo.AlbumId = dto.AlbumId;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Photo assigned to album successfully" });
    }
    // Albüm sil (fotoğraflarıyla birlikte)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var album = await _context.Albums
            .Include(a => a.Photos)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (album == null)
            return NotFound();

        _context.Albums.Remove(album);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Album deleted successfully" });
    }

    // /api/album/{id}/photos
    [HttpGet("{id}/photos")]
    public async Task<ActionResult<IEnumerable<object>>> GetPhotosByAlbum(int id)
    {
        var album = await _context.Albums
            .Include(a => a.Photos)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (album == null)
            return NotFound();

        var photos = album.Photos.Select(p => new
        {
            p.Id,
            p.FileName,
            p.FilePath,
            p.UploadedAt
        }).ToList();

        return Ok(photos);
    }

}
