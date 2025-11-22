using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Data;
using SharedFutureApp.Dtos.WishlistDtos;
using SharedFutureApp.Models;

namespace SharedFutureApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WishlistController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WishlistController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WishlistItem>>> GetAll()
    {
        return await _context.WishlistItems.OrderBy(x => x.CreatedAt).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<WishlistItem>> Create([FromBody] WishlistCreateDto dto)
    {
        var item = new WishlistItem
        {
            Title = dto.Title,
            EventDate = dto.EventDate,
            CreatedAt = DateTimeOffset.Now,
            IsDone = false
        };

        _context.WishlistItems.Add(item);
        await _context.SaveChangesAsync();

        return new JsonResult(new
        {
            id = item.Id,
            title = item.Title,
            eventDate = item.EventDate,
            isDone = item.IsDone
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] WishlistUpdateDto dto)
    {
        var item = await _context.WishlistItems.FindAsync(id);
        if (item == null) return NotFound();

        item.Title = dto.Title;
        item.EventDate = dto.EventDate;

        if (dto.IsDone && !item.IsDone)
        {
            item.IsDone = true;
            item.CompletedAt = DateTimeOffset.Now;
        }
        else if (!dto.IsDone)
        {
            item.IsDone = false;
            item.CompletedAt = null;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.WishlistItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
