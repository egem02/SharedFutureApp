using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Dtos.PhotoDtos;

public class PhotoUploadDto
{
    public string? FileName { get; set; }
    public string? Note { get; set; }
    public int? AlbumId { get; set; }
    public IFormFile? Photo { get; set; }
}