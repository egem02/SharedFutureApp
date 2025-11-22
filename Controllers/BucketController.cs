using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Data;
using SharedFutureApp.Dtos.BucketDtos;
using SharedFutureApp.Models;
using System.Net.Sockets;

namespace SharedFutureApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BucketController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public BucketController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // ---------------------------
    // GET ALL (Active + Done)
    // ---------------------------
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BucketItem>>> GetAll()
    {
        return await _context.BucketItems
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }

    // ---------------------------
    // GET ACTIVE ONLY
    // ---------------------------
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<BucketItem>>> GetActive()
    {
        return await _context.BucketItems
            .Where(x => x.IsDone == false)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }

    // ---------------------------
    // GET DONE (HISTORY)
    // ---------------------------
    [HttpGet("done")]
    public async Task<ActionResult<IEnumerable<BucketItem>>> GetDone()
    {
        return await _context.BucketItems
            .Where(x => x.IsDone == true)
            .OrderByDescending(x => x.CompletedAt)
            .ToListAsync();
    }

    // ---------------------------
    // CREATE
    // ---------------------------
    [HttpPost]
    public async Task<ActionResult<BucketItem>> Create([FromBody] BucketCreateDto dto)
    {
        var bucket = new BucketItem
        {
            Title = dto.Title,
            TargetDate = dto.TargetDate,
            CreatedAt = DateTimeOffset.Now,
            IsDone = false
        };

        _context.BucketItems.Add(bucket);
        await _context.SaveChangesAsync();

        // JSON’de id küçük harfli gelsin
        return new JsonResult(new
        {
            id = bucket.Id,
            title = bucket.Title,
            targetDate = bucket.TargetDate,
            isDone = bucket.IsDone
        });
    }

    // UPDATE (done/edit)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] BucketUpdateDto dto)
    {
        var bucket = await _context.BucketItems.FindAsync(id);
        if (bucket == null) return NotFound();

        bucket.Title = dto.Title ?? bucket.Title;
        bucket.TargetDate = dto.TargetDate ?? bucket.TargetDate;

        if (dto.IsDone && !bucket.IsDone)
        {
            bucket.IsDone = true;
            bucket.CompletedAt = DateTimeOffset.Now;
        }
        else if (!dto.IsDone)
        {
            bucket.IsDone = false;
            bucket.CompletedAt = null;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var bucket = await _context.BucketItems.FindAsync(id);
        if (bucket == null) return NotFound();

        _context.BucketItems.Remove(bucket);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
