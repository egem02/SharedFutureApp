// DTO
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Models;
using System.ComponentModel.DataAnnotations;

public class BucketUploadDto
{
    
    public string? Title { get; set; }
    public IFormFile? Photo { get; set; }
}

