using Microsoft.EntityFrameworkCore;
using SharedFutureApp.Models;
using System.Linq.Expressions;

namespace SharedFutureApp.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<BucketItem> BucketItems { get; set; }
    public DbSet<WishlistItem> WishlistItems { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Memorize> Memorizes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Eğer IEntityTypeConfiguration sınıfların varsa yükler
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<Album>()
        .HasMany(a => a.Photos)
        .WithOne(p => p.Album)
        .HasForeignKey(p => p.AlbumId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BucketItem>()
        .Property(b => b.Id)
        .ValueGeneratedOnAdd(); // <- Bu satır auto-increment yapıyor

        // WishlistItem Id auto-increment
        modelBuilder.Entity<WishlistItem>()
            .Property(w => w.Id)
            .ValueGeneratedOnAdd(); // <- Bu satır da auto-increment yapıyor

        // Tüm entity türlerini dön
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var prop = entity.FindProperty("IsDeleted");
            if (prop != null && prop.ClrType == typeof(bool))
            {
                // e => e.IsDeleted == false
                var parameter = Expression.Parameter(entity.ClrType, "e");
                var propertyExpression = Expression.Property(parameter, "IsDeleted");
                var compareExpression = Expression.Equal(
                    propertyExpression,
                    Expression.Constant(false)
                );

                var lambda = Expression.Lambda(compareExpression, parameter);

                modelBuilder.Entity(entity.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}
