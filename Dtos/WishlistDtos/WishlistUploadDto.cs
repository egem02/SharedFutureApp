using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Dtos.WishlistDtos;

public class WishlistUploadDto
{
    [Required]
    public string? Title { get; set; }

    public IFormFile? Photo { get; set; }
    public int? PhotoId { get; set; }
}