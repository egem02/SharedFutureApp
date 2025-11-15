using System;
using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Backend.Models
{
    public class Photo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty; // Sunucuda kayıtlı dosya adı
        [Required]
        public string FilePath { get; set; } = string.Empty; // Sunucuda kayıt yolu

        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
