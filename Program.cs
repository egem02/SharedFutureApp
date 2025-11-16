using Microsoft.OpenApi.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using SharedFutureApp.Data;


internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddRazorPages();
        // Add services to the container
        builder.Services.AddControllers();

        // ✅ Swagger servisini ekliyoruz
        builder.Services.AddEndpointsApiExplorer();


        var app = builder.Build();


        app.UseStaticFiles();
        app.UseRouting();
        app.MapControllers();
        app.MapRazorPages();
        app.Run();
    }
}