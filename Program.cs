using Microsoft.OpenApi.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using SharedFutureApp.Backend.Data;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddRazorPages();
// Add services to the container
builder.Services.AddControllers();

// ✅ Swagger servisini ekliyoruz
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { Title = "SharedFutureApp API", 
        Version = "v1" });

    // Upload endpoint’i için filter ekleniyor
    c.OperationFilter<SwaggerFileOperationFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // ✅ Swagger arayüzünü etkinleştiriyoruz
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SharedFutureApp API v1");
    });
}

app.UseStaticFiles();
app.UseRouting();
app.MapControllers();
app.MapRazorPages();
app.Run();
