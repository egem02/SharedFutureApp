using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;


namespace SharedFutureApp.Backend.Dtos.BucketDtos;
public class BucketCreateDto
{
    [Required]
    public string? Title { get; set; }

    public DateTime? TargetDate { get; set; }
}
