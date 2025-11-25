using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting; // KRİTİK: IHostEnvironment için ekleyin
using Microsoft.AspNetCore.Hosting; // IWebHostEnvironment hala tanımlı olabilir ama kullanmayacağız
using SharedFutureApp.Data;
using SharedFutureApp.Models;
using System.IO;
using SharedFutureApp.Dtos.AlbumDtos;

[Route("api/[controller]")]
[ApiController]
public partial class PhotoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    // KRİTİK: IWebHostEnvironment yerine IHostEnvironment kullanıyoruz
    private readonly IHostEnvironment _hostEnv;

    public PhotoController(ApplicationDbContext context, IHostEnvironment hostEnv)
    {
        _context = context;
        _hostEnv = hostEnv;
    }

    /// <summary>
    /// Yeni bir fotoğrafı yükler ve notuyla birlikte veritabanına kaydeder.
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] IFormFile photo, [FromForm] string? note)
    {
        if (photo is null || photo.Length == 0)
            return BadRequest(new { message = "Photo file is required." });

        // KRİTİK YOL: Proje kök dizinini (ContentRootPath) kullan
        var contentRootPath = _hostEnv.ContentRootPath;

        // Proje Kökündeki "uploads" klasörünü hedefle (Daha güvenli erişim)
        var uploadFolder = Path.Combine(contentRootPath, "uploads");

        if (!Directory.Exists(uploadFolder))
            Directory.CreateDirectory(uploadFolder);

        // Dosya adı ve yolu oluşturma
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
        var filePath = Path.Combine(uploadFolder, fileName);

        // Diske kaydetme
        try
        {
            await using var stream = new FileStream(filePath, FileMode.Create);
            await photo.CopyToAsync(stream);

            // Hata ayıklama logu (Eğer çalışırsa)
            Console.WriteLine($"DEBUG: File successfully saved to path: {filePath}");
        }
        catch (Exception ex)
        {
            // KRİTİK: Diske kaydetme hatasını tarayıcıya döndürerek kesin tanıyı koy
            Console.WriteLine($"KRİTİK HATA: File save FAILED. Path: {filePath}. Error: {ex.Message}");
            return StatusCode(500, new { message = $"File save FAILED. Error: {ex.Message}" });
        }

        // Model oluşturma ve veritabanına kaydetme
        var newPhoto = new Photo
        {
            FileName = fileName,
            // FilePath'i tarayıcının erişebileceği URL olarak kaydet
            FilePath = $"/upload/{fileName}",
            UploadedAt = DateTimeOffset.Now,
            Note = note
        };

        _context.Photos.Add(newPhoto);
        await _context.SaveChangesAsync();

        return Ok(newPhoto);
    }

    // ... (Kalan tüm metodlar aynı kalır)

    /// <summary>
    /// Albüme atanmamış tüm fotoğrafları döndürür.
    /// </summary>
    [HttpGet("unassigned")]
    public async Task<IActionResult> GetUnassigned()
    {
        // Yalnızca JS'in ihtiyacı olan alanları seçiyoruz.
        var photos = await _context.Photos
            .Where(p => p.AlbumId == null)
            .Select(p => new
            {
                p.Id,
                p.FileName,
                p.FilePath,
                p.UploadedAt,
                p.Note
            })
            .ToListAsync();

        return Ok(photos);
    }

    /// <summary>
    /// Belirtilen fotoğrafın notunu günceller.
    /// </summary>
    [HttpPut("{id}/note")]
    public async Task<IActionResult> UpdateNote(int id, [FromBody] string note)
    {
        var photo = await _context.Photos.FindAsync(id);

        if (photo is null)
            return NotFound(new { message = $"Photo with ID {id} not found." });

        photo.Note = note;

        _context.Photos.Update(photo);
        await _context.SaveChangesAsync();

        return Ok(new { photo.Id, photo.Note });
    }
    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetPhotoDetails(int id)
    {
    
        var currentPhoto = await _context.Photos.FindAsync(id);
        if (currentPhoto == null) return NotFound();

   
        var albums = await _context.Albums
            .Select(a => new { a.Id, a.Name })
            .ToListAsync();

        // 3. Önceki ve Sonraki Fotoğrafı Bulma Mantığı
        // Not: Bu basit bir ID sıralamasıdır. Tarihe göre sıralıyorsanız OrderBy kullanmalısınız.

        var nextPhotoId = await _context.Photos
            .Where(p => p.Id > id)
            .OrderBy(p => p.Id)
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        var prevPhotoId = await _context.Photos
            .Where(p => p.Id < id)
            .OrderByDescending(p => p.Id)
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        // 4. Sonucu Döndür
        return Ok(new
        {
            Photo = currentPhoto,
            NextId = nextPhotoId, // 0 gelirse sonraki yok demektir
            PrevId = prevPhotoId, // 0 gelirse önceki yok demektir
            Albums = albums
        });
    }

    // Albüme Fotoğraf Ekleme Endpoint'i
    [HttpPost("add-to-album")]
    public async Task<IActionResult> AddPhotoToAlbum([FromBody] AddToAlbumRequest request)
    {
        var photo = await _context.Photos.FindAsync(request.PhotoId);
        var album = await _context.Albums.Include(a => a.Photos).FirstOrDefaultAsync(a => a.Id == request.AlbumId);

        if (photo == null || album == null) return NotFound("Fotoğraf veya Albüm bulunamadı.");

        if (!album.Photos.Contains(photo))
        {
            album.Photos.Add(photo);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Fotoğraf albüme eklendi!" });
        }

        return BadRequest(new { message = "Bu fotoğraf zaten albümde mevcut." });
    }
}