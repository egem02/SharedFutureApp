using System.ComponentModel.DataAnnotations;

namespace SharedFutureApp.Dtos;

public class PhotoUploadDto
{
   
    public IFormFile? Photo { get; set; }
}