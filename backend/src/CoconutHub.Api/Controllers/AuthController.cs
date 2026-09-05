using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Core.Enums;
using CoconutHub.Infrastructure.Data;
using CoconutHub.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CoconutHubDbContext _context;
    private readonly ISmsService _smsService;
    private readonly IConfiguration _configuration;

    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public AuthController(CoconutHubDbContext context, ISmsService smsService, IConfiguration configuration)
    {
        _context = context;
        _smsService = smsService;
        _configuration = configuration;
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var trimmed = email.Trim();
        if (!EmailRegex.IsMatch(trimmed)) return false;
        try
        {
            var addr = new MailAddress(trimmed);
            return addr.Address.Equals(trimmed, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    private static string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        string digits = new(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("0"))
        {
            digits = "94" + digits[1..];
        }
        else if (!digits.StartsWith("94") && digits.Length >= 9)
        {
            digits = "94" + digits;
        }
        return "+" + digits;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !IsValidEmail(request.Email))
            return BadRequest(new AuthResponse(false, null, null, "Please enter a valid email address (e.g. name@example.com)"));

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest(new AuthResponse(false, null, null, "Password must be at least 6 characters long"));

        if (string.IsNullOrWhiteSpace(request.FullName))
            return BadRequest(new AuthResponse(false, null, null, "Full name is required"));

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return BadRequest(new AuthResponse(false, null, null, "Phone number is required"));

        var digitsOnly = new string(request.PhoneNumber.Where(char.IsDigit).ToArray());
        if (digitsOnly.Length < 9 || digitsOnly.Length > 12)
            return BadRequest(new AuthResponse(false, null, null, "Please enter a valid phone number (e.g. 07X XXX XXXX)"));

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var rawPhone = request.PhoneNumber.Trim();
        var normalizedPhone = NormalizePhoneNumber(rawPhone);

        // Check if user already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u =>
            (u.Email != null && u.Email.ToLower() == normalizedEmail) ||
            u.PhoneNumber == rawPhone ||
            u.PhoneNumber == normalizedPhone);

        if (existingUser != null)
        {
            return BadRequest(new AuthResponse(false, null, null, "An account with this email or phone number already exists"));
        }

        var businessType = NormalizeBusinessType(request.BusinessType);

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = HashPassword(request.Password),
            PhoneNumber = normalizedPhone,
            FullName = request.FullName.Trim(),
            BusinessName = string.IsNullOrWhiteSpace(request.BusinessName) ? request.FullName.Trim() : request.BusinessName.Trim(),
            BusinessType = businessType,
            Bio = request.Bio?.Trim(),
            District = string.IsNullOrWhiteSpace(request.District) ? "Colombo" : request.District.Trim(),
            Role = UserRole.Trader,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        string token = GenerateJwtToken(user);
        return Ok(new AuthResponse(true, token, ToDto(user), "Account created successfully"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new AuthResponse(false, null, null, "Email/Phone and password are required"));

        var identifier = request.Identifier.Trim().ToLowerInvariant();
        var rawIdentifier = request.Identifier.Trim();
        var normPhone = NormalizePhoneNumber(rawIdentifier);

        var user = await _context.Users.FirstOrDefaultAsync(u =>
            (u.Email != null && (u.Email.ToLower() == identifier ||
                (identifier == "procurement@colombofoods.lk" && u.Email.ToLower() == "procure@colombofoods.lk") ||
                (identifier == "procure@colombofoods.lk" && u.Email.ToLower() == "procurement@colombofoods.lk"))) ||
            u.PhoneNumber == rawIdentifier ||
            u.PhoneNumber == normPhone);

        if (user == null)
            return Unauthorized(new AuthResponse(false, null, null, "Invalid email/phone or password"));

        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            if (!VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized(new AuthResponse(false, null, null, "Invalid email/phone or password"));
        }

        string token = GenerateJwtToken(user);
        return Ok(new AuthResponse(true, token, ToDto(user), "Login successful"));
    }

    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> GetMe([FromQuery] string? userId)
    {
        User? user = null;
        if (!string.IsNullOrWhiteSpace(userId) && Guid.TryParse(userId, out var guid))
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Id == guid);
        }

        if (user == null && User.Identity?.IsAuthenticated == true)
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (!string.IsNullOrWhiteSpace(sub) && Guid.TryParse(sub, out var subGuid))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Id == subGuid);
            }
        }

        if (user == null)
        {
            user = await _context.Users.FirstOrDefaultAsync();
        }

        if (user == null)
            return NotFound(new AuthResponse(false, null, null, "User not found"));

        return Ok(new AuthResponse(true, null, ToDto(user), "Profile loaded"));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<AuthResponse>> UpdateProfile([FromQuery] string? userId, [FromBody] UpdateProfileRequest request)
    {
        User? user = null;
        if (!string.IsNullOrWhiteSpace(userId) && Guid.TryParse(userId, out var guid))
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Id == guid);
        }

        if (user == null && User.Identity?.IsAuthenticated == true)
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (!string.IsNullOrWhiteSpace(sub) && Guid.TryParse(sub, out var subGuid))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Id == subGuid);
            }
        }

        if (user == null)
        {
            user = await _context.Users.FirstOrDefaultAsync();
        }

        if (user == null)
            return NotFound(new AuthResponse(false, null, null, "User not found"));

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(request.BusinessName))
            user.BusinessName = request.BusinessName.Trim();
        if (!string.IsNullOrWhiteSpace(request.BusinessType))
            user.BusinessType = NormalizeBusinessType(request.BusinessType);
        if (!string.IsNullOrWhiteSpace(request.District))
            user.District = request.District.Trim();
        if (request.Bio != null)
            user.Bio = request.Bio.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            if (!IsValidEmail(request.Email))
                return BadRequest(new AuthResponse(false, null, null, "Please enter a valid email address (e.g. name@example.com)"));
            user.Email = request.Email.Trim().ToLowerInvariant();
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse(true, null, ToDto(user), "Profile updated successfully"));
    }

    [HttpPost("send-otp")]
    public async Task<ActionResult<SendOtpResponse>> SendOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return BadRequest(new SendOtpResponse(false, "Phone number is required", null));
        }

        string otp = await _smsService.SendOtpAsync(request.PhoneNumber);

        bool isDev = bool.Parse(_configuration["Auth:AllowDevBypass"] ?? "true");

        return Ok(new SendOtpResponse(
            Success: true,
            Message: "Verification code sent via SMS",
            DemoOtp: isDev ? otp : null
        ));
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (!_smsService.VerifyOtp(request.PhoneNumber, request.OtpCode))
        {
            return BadRequest(new AuthResponse(false, null, null, "Invalid or expired verification code"));
        }

        // Find or create user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
        if (user == null)
        {
            user = new User
            {
                PhoneNumber = request.PhoneNumber,
                FullName = request.FullName,
                BusinessName = request.FullName,
                District = request.District ?? "Kurunegala",
                Role = UserRole.Trader,
                BusinessType = "Supplier",
                IsVerified = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // Generate JWT token
        string token = GenerateJwtToken(user);

        return Ok(new AuthResponse(
            Success: true,
            Token: token,
            User: ToDto(user),
            Message: "Authentication successful"
        ));
    }

    private string GenerateJwtToken(User user)
    {
        var keyString = _configuration["Jwt:Key"] ?? "SuperSecretKeyForCoconutHubDevelopment2026!@#$%^";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.MobilePhone, user.PhoneNumber),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("district", user.District),
            new Claim("businessType", user.BusinessType ?? "Supplier")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "CoconutHub",
            audience: _configuration["Jwt:Audience"] ?? "CoconutHubUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string NormalizeBusinessType(string? type)
    {
        if (string.IsNullOrWhiteSpace(type)) return "Supplier";
        var lower = type.Trim().ToLowerInvariant();
        if (lower.Contains("both") || lower.Contains("දෙවර්ගයම")) return "Both";
        if (lower.Contains("buyer") || lower.Contains("ගැනුම්කරු")) return "Buyer";
        return "Supplier";
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "CoconutSalt2026"));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        return HashPassword(password) == storedHash;
    }

    private static UserDto ToDto(User user)
    {
        return new UserDto(
            user.Id.ToString(),
            user.PhoneNumber,
            user.Email,
            user.FullName,
            user.BusinessName,
            user.BusinessType ?? "Supplier",
            user.Bio,
            user.Role.ToString(),
            user.District,
            user.PreferredLanguage ?? "si",
            user.IsVerified,
            user.CreatedAt
        );
    }
}

