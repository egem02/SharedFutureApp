using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Backend.Data;
using SharedFutureApp.Backend.Dtos.WishlistDtos;
using SharedFutureApp.Backend.Models;

namespace BackendProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WishlistController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ---------------------------
        // GET ALL (Active + Done)
        // ---------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItem>>> GetAll()
        {
            return await _context.WishlistItems
                .Include(x => x.Photo)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        // ---------------------------
        // GET ACTIVE ONLY
        // ---------------------------
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<WishlistItem>>> GetActive()
        {
            return await _context.WishlistItems
                .Where(x => x.IsDone == false)
                .Include(x => x.Photo)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        // ---------------------------
        // GET DONE (HISTORY)
        // ---------------------------
        [HttpGet("done")]
        public async Task<ActionResult<IEnumerable<WishlistItem>>> GetDone()
        {
            return await _context.WishlistItems
                .Where(x => x.IsDone == true)
                .Include(x => x.Photo)
                .OrderByDescending(x => x.CompletedAt)
                .ToListAsync();
        }

        // ---------------------------
        // CREATE
        // ---------------------------
        [HttpPost]
        public async Task<ActionResult<WishlistItem>> Create([FromBody] WishlistCreateDto dto)
        {
            var item = new WishlistItem
            {
                Title = dto.Title,
                EventDate = dto.EventDate,
                CreatedAt = DateTime.Now,
                IsDone = false,
                PhotoId = dto.PhotoId
            };

            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Create), new { id = item.Id }, item);
        }

        // ---------------------------
        // UPDATE (Done + Edit)
        // ---------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] WishlistUpdateDto dto)
        {
            var item = await _context.WishlistItems.FindAsync(id);
            if (item == null) return NotFound();

            item.Title = dto.Title;
            item.EventDate = dto.EventDate;
            item.PhotoId = dto.PhotoId;

            if (dto.IsDone && !item.IsDone)
            {
                item.IsDone = true;
                item.CompletedAt = DateTime.Now;
            }
            else if (!dto.IsDone)
            {
                item.IsDone = false;
                item.CompletedAt = null;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ---------------------------
        // DELETE
        // ---------------------------
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
}
