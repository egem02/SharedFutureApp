namespace SharedFutureApp.Models;

public class Album
{
    public int Id { get; set; }

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public List <Photo> Photos { get; set; } = new();

}