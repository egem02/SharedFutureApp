using System;
using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Models;

public class BucketItem
{

    public int Id { get; set; }

    public string Title { get; set; } = default!;

    public DateTimeOffset? TargetDate { get; set; } // Etkinlik tarihi
    public DateTimeOffset CreatedAt { get; set; }

    public bool IsDone { get; set; } = false;
    public DateTimeOffset? CompletedAt { get; set; } // Tamamlanma tarihi

}