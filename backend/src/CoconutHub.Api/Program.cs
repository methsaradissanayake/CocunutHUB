using System.Text;
using CoconutHub.Infrastructure.Data;
using CoconutHub.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration with Cloud Auto-Detection
// Checks DATABASE_URL (Supabase / Neon / Render / Railway) or Postgres connection string, falls back to SQLite
string? databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string? postgresConn = builder.Configuration.GetConnectionString("PostgreSql");
bool forceSqlite = builder.Configuration.GetValue<bool>("UseSqliteFallback", false);

builder.Services.AddDbContext<CoconutHubDbContext>(options =>
{
    if (!forceSqlite && !string.IsNullOrWhiteSpace(databaseUrl))
    {
        string npgsqlConn = ConvertPostgresUrlToConnectionString(databaseUrl);
        options.UseNpgsql(npgsqlConn);
    }
    else if (!forceSqlite && !string.IsNullOrWhiteSpace(postgresConn))
    {
        options.UseNpgsql(postgresConn);
    }
    else
    {
        string sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=coconuthub_v2.db";
        options.UseSqlite(sqliteConn);
    }
});

// 2. Application Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IPayHereService, PayHereService>();
builder.Services.AddSingleton<ISmsService, SmsService>();
builder.Services.AddScoped<ICdaPriceAlertService, CdaPriceAlertService>();

// 3. Authentication & JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "CoconutHubSriLankaAgriculturalSecretKey2026!@#$%^&*()_+";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CoconutHub",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CoconutHubUsers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// 4. Controllers & JSON
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Dynamic Production CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Dynamic allow: localhost, Vercel (*.vercel.app), Render, custom domains
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// 6. Database Migration / Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CoconutHubDbContext>();
    await DbInitializer.SeedAsync(context);
}

// 7. Pipeline Configuration
app.UseCors("AllowFrontend");

// Serve static React files if wwwroot exists (for unified all-in-one container deployment)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Root API Health status matching preview format
app.MapGet("/api", () => Results.Ok(new
{
    message = "CoconutHub Production API (ASP.NET Core / .NET 10)",
    payhere_enabled = true,
    version = "1.0.0",
    server_time = DateTime.UtcNow
}));

app.MapControllers();

// SPA Fallback: Deep-link routes (/market, /prices, /chat) fallback to index.html if hosted together
app.MapFallbackToFile("index.html");

app.Run();

// Helper to convert URI database URL (postgres://user:pass@host:port/db) to standard Npgsql connection string
static string ConvertPostgresUrlToConnectionString(string databaseUrl)
{
    if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return databaseUrl;
    }

    try
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
    catch
    {
        return databaseUrl;
    }
}
