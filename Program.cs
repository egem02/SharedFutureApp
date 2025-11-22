using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using SharedFutureApp.Data;
using System.Text.Json;


internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddRazorPages();
        // Add services to the container
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = null;
        });

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