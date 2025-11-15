using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Backend.Dtos.WishlistDtos;

public class WishlistUpdateDto
{
    [Required]
    public string Title { get; set; }
    public DateTime? EventDate { get; set; } // Eksikti, ekle
    public bool IsDone { get; set; }         // Eksikti, ekle
    public int? PhotoId { get; set; }
}