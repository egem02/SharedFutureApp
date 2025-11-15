using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Backend.Dtos;

public class PhotoUploadDto
{
    [Required]
    public IFormFile Photo { get; set; }
}