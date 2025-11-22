using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;


namespace SharedFutureApp.Dtos.BucketDtos;
public class BucketCreateDto
{
    public string Title { get; set; } = default!;

    public DateTime? TargetDate { get; set; }
}