using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Data;
using SharedFutureApp.Models;

[Route("api/[controller]")]
[ApiController]
public partial class MemorizeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MemorizeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddNote([FromBody] Memorize note)
    {
        if (string.IsNullOrWhiteSpace(note.Note))
            return BadRequest("Note cannot be empty");

        _context.Memorizes.Add(note);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Note saved", note.Id });
    }


    [HttpGet]
    public async Task<IActionResult> GetAllNotes()
    {
        var notes = await _context.Memorizes
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
        return Ok(notes);
    }
}
