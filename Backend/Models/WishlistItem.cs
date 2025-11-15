
using System;
using System.ComponentModel.DataAnnotations;


namespace SharedFutureApp.Backend.Models
{
    public class WishlistItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public DateTime? EventDate { get; set; } // Etkinlik tarihi
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsDone { get; set; } = false;
        public DateTime? CompletedAt { get; set; }

        // Fotoğraf ilişkisi (opsiyonel)
        public int? PhotoId { get; set; }
        public Photo? Photo { get; set; }
    }
}
