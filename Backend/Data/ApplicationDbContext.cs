using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Backend.Models;

namespace SharedFutureApp.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<BucketItem> BucketItems { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Photo> Photos { get; set; }
    }
}
