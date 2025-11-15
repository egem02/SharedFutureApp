using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Backend.Data;
using SharedFutureApp.Backend.Dtos.BucketDtos;
using SharedFutureApp.Backend.Models;

namespace BackendProject.Controllers
{
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
            var item = new BucketItem
            {
                Title = dto.Title,
                TargetDate = dto.TargetDate,
                CreatedAt = DateTime.Now,
                IsDone = false
            };

            _context.BucketItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Create), new { id = item.Id }, item);
        }

        // ---------------------------
        // UPDATE (Done + Edit)
        // ---------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BucketUpdateDto dto)
        {
            var item = await _context.BucketItems.FindAsync(id);
            if (item == null) return NotFound();

            item.Title = dto.Title;
            item.TargetDate = dto.TargetDate;

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
            var item = await _context.BucketItems.FindAsync(id);
            if (item == null) return NotFound();

            _context.BucketItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
