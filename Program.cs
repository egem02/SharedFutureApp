using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using SharedFutureApp.Data;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Microsoft.AspNetCore.Http;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // --- 1. Servis Kayıtları (Services) ---

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddRazorPages();
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = null;
            });

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddDirectoryBrowser();

        var app = builder.Build();

        // --- 2. Middleware Yapılandırması ---

        if (app.Environment.IsDevelopment())
        {
            // app.UseSwagger(); 
            // app.UseSwaggerUI();
        }

        app.UseStaticFiles();

        // --- 2. Upload Klasörü Yapılandırması (DÜZELTİLDİ) ---

        var rootPath = app.Environment.ContentRootPath;

        // DÜZELTME: Klasör adı "uploads" (çoğul) olarak güncellendi.
        string uploadPath = Path.Combine(rootPath, "uploads");

        // Klasör yoksa oluştur (uploads)
        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        var uploadFileProvider = new PhysicalFileProvider(uploadPath);

        // A) Dosyaları sunmak için
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = uploadFileProvider,
            // Tarayıcı "/upload" isteyince fiziksel "uploads" klasörüne bakacak.
            RequestPath = "/upload",
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store");
                ctx.Context.Response.Headers.Append("Expires", "-1");
            }
        });

        // B) Klasör içeriğini tarayıcıda görmek için (/upload/)
        if (app.Environment.IsDevelopment())
        {
            app.UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = uploadFileProvider,
                RequestPath = "/upload"
            });
        }

        app.UseRouting();

        app.MapControllers();
        app.MapRazorPages();

        app.Run();
    }
}