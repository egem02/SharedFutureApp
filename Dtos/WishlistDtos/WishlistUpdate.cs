using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Dtos.WishlistDtos;

public class WishlistUpdateDto
{
  
    public string? Title { get; set; }
    public DateTimeOffset? EventDate { get; set; } 
    public bool IsDone { get; set; }        
    public int? PhotoId { get; set; }
}