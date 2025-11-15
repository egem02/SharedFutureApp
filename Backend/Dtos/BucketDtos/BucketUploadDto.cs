// DTO
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Backend.Models;
using System.ComponentModel.DataAnnotations;

public class BucketUploadDto
{
    [Required]
    public string? Title { get; set; }
    public IFormFile? Photo { get; set; }
}

