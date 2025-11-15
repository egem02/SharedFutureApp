using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Backend.Dtos.WishlistDtos;

public class WishlistCreateDto
{
    [Required]
    public string Title { get; set; }
    public DateTime? EventDate { get; set; }
    public bool IsDone { get; set; }
    public int? PhotoId { get; set; }
}