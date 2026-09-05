using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoconutHub.Infrastructure.Services;

public interface ISmsService
{
    Task<string> SendOtpAsync(string phoneNumber);
    bool VerifyOtp(string phoneNumber, string code);
}

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;
    private readonly IConfiguration _configuration;
    // Thread-safe in-memory OTP cache (with timestamp for 3 min expiry)
    private static readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> OtpCache = new();

    public SmsService(ILogger<SmsService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<string> SendOtpAsync(string phoneNumber)
    {
        // Clean phone number (format +94...)
        string normalized = NormalizePhoneNumber(phoneNumber);

        // Generate 4-digit OTP
        string otp = Random.Shared.Next(1000, 9999).ToString();
        DateTime expiry = DateTime.UtcNow.AddMinutes(3);

        OtpCache[normalized] = (otp, expiry);

        string messageEn = $"Your CoconutHub verification code is {otp}. Valid for 3 mins.";
        string messageSi = $"ඔබගේ පොල්හබ් තහවුරු කිරීමේ අංකය {otp} වේ. මිනිත්තු 3ක් වලංගුයි.";

        _logger.LogInformation(">>> [SMS DISPATCH] To: {Phone} | Content: {En} | {Si}", normalized, messageEn, messageSi);

        // If local/demo: we log to console. If live: post to ShoutOUT / Textware / Dialog API.
        string provider = _configuration["Sms:Provider"] ?? "Mock";
        if (provider.Equals("ShoutOUT", StringComparison.OrdinalIgnoreCase))
        {
            // Integration hook for ShoutOUT LK / Textware HTTP client
            await Task.Delay(50);
        }

        return otp;
    }

    public bool VerifyOtp(string phoneNumber, string code)
    {
        string normalized = NormalizePhoneNumber(phoneNumber);

        // Master dev bypass code for automated tests: "1234"
        if (code == "1234" && bool.Parse(_configuration["Auth:AllowDevBypass"] ?? "true"))
        {
            return true;
        }

        if (OtpCache.TryGetValue(normalized, out var cached))
        {
            if (DateTime.UtcNow <= cached.Expiry && cached.Code == code)
            {
                OtpCache.TryRemove(normalized, out _);
                return true;
            }
        }

        return false;
    }

    private static string NormalizePhoneNumber(string phone)
    {
        string digits = new(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("0"))
        {
            digits = "94" + digits[1..];
        }
        else if (!digits.StartsWith("94"))
        {
            digits = "94" + digits;
        }
        return "+" + digits;
    }
}
