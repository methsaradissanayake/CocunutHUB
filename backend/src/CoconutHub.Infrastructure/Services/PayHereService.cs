using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using CoconutHub.Core.DTOs;
using Microsoft.Extensions.Configuration;

namespace CoconutHub.Infrastructure.Services;

public interface IPayHereService
{
    PayHereCheckoutParams GenerateCheckoutParams(string orderId, decimal amount, string currency, string items, string? returnUrl, string? cancelUrl, string? notifyUrl);
    bool ValidateIpnSignature(string merchantId, string orderId, string payhereAmount, string payhereCurrency, string statusCode, string md5sig);
    bool IsDemoMode { get; }
}

public class PayHereService : IPayHereService
{
    private readonly string _merchantId;
    private readonly string _merchantSecret;
    private readonly bool _isSandbox;
    private readonly bool _demoMode;

    public bool IsDemoMode => _demoMode;

    public PayHereService(IConfiguration configuration)
    {
        _merchantId = configuration["PayHere:MerchantId"] ?? "1220000"; // Test default
        _merchantSecret = configuration["PayHere:MerchantSecret"] ?? "4MzEyMzQ1Njc4OTAxMjM0NQ==";
        _isSandbox = bool.Parse(configuration["PayHere:Sandbox"] ?? "true");
        _demoMode = bool.Parse(configuration["PayHere:DemoMode"] ?? "true");
    }

    public PayHereCheckoutParams GenerateCheckoutParams(string orderId, decimal amount, string currency, string items, string? returnUrl, string? cancelUrl, string? notifyUrl)
    {
        string formattedAmount = amount.ToString("0.00", CultureInfo.InvariantCulture);
        string hash = GenerateCheckoutHash(_merchantId, orderId, formattedAmount, currency, _merchantSecret);

        return new PayHereCheckoutParams(
            Sandbox: _isSandbox ? "true" : "false",
            MerchantId: _merchantId,
            ReturnUrl: returnUrl ?? "",
            CancelUrl: cancelUrl ?? "",
            NotifyUrl: notifyUrl ?? "",
            OrderId: orderId,
            Items: items,
            Amount: formattedAmount,
            Currency: currency,
            Hash: hash,
            FirstName: "CoconutHub",
            LastName: "Trader",
            Email: "trader@coconuthub.lk",
            Phone: "+94770000000",
            Address: "Coconut Triangle",
            City: "Kurunegala",
            Country: "Sri Lanka"
        );
    }

    public bool ValidateIpnSignature(string merchantId, string orderId, string payhereAmount, string payhereCurrency, string statusCode, string md5sig)
    {
        if (_merchantId != merchantId) return false;

        string hashedSecret = GetMd5Hash(_merchantSecret).ToUpperInvariant();
        string rawSignature = $"{merchantId}{orderId}{payhereAmount}{payhereCurrency}{statusCode}{hashedSecret}";
        string computedHash = GetMd5Hash(rawSignature).ToUpperInvariant();

        return string.Equals(computedHash, md5sig, StringComparison.OrdinalIgnoreCase);
    }

    private static string GenerateCheckoutHash(string merchantId, string orderId, string amount, string currency, string secret)
    {
        string hashedSecret = GetMd5Hash(secret).ToUpperInvariant();
        string raw = $"{merchantId}{orderId}{amount}{currency}{hashedSecret}";
        return GetMd5Hash(raw).ToUpperInvariant();
    }

    private static string GetMd5Hash(string input)
    {
        byte[] inputBytes = Encoding.UTF8.GetBytes(input);
        byte[] hashBytes = MD5.HashData(inputBytes);
        return Convert.ToHexStringLower(hashBytes);
    }
}
