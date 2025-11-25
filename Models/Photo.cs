using System;
using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Models;

public class Photo
{

    public int Id { get; set; }

    public string FileName { get; set; } = default!; // Sunucuda kayıtlı dosya adı

    public string FilePath { get; set; } = default!; // Sunucuda kayıt yolu

    public DateTimeOffset UploadedAt { get; set; }

    public int? AlbumId { get; set; }
    public string? Note { get; internal set; }
    public Album? Album { get; internal set; }
}