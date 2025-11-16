using System;
using System.ComponentModel.DataAnnotations;


namespace SharedFutureApp.Models;

public class WishlistItem
{
    
    public int Id { get; set; }

    
    public string Title { get; set; } = default!;

    public DateTimeOffset? EventDate { get; set; } // Etkinlik tarihi
    public DateTimeOffset CreatedAt { get; set; } 

    public bool IsDone { get; set; } 
    public DateTimeOffset? CompletedAt { get; set; }

    // Fotoğraf ilişkisi (opsiyonel)
    public int? PhotoId { get; set; }
    public Photo? Photo { get; set; }
}
