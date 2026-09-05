using System.Security.Cryptography;
using System.Text;
using CoconutHub.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace CoconutHub.UnitTests;

public class PayHereAndSmsTests
{
    private static IConfiguration CreateConfig(string merchantId, string secret, bool demo = false)
    {
        var dict = new Dictionary<string, string?>
        {
            {"PayHere:MerchantId", merchantId},
            {"PayHere:MerchantSecret", secret},
            {"PayHere:Sandbox", "true"},
            {"PayHere:DemoMode", demo ? "true" : "false"},
            {"Auth:AllowDevBypass", "true"}
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
    }

    [Fact]
    public void PayHereService_GeneratesValidHashAndCheckoutParams()
    {
        // Arrange
        var config = CreateConfig("1220000", "secret123");
        var service = new PayHereService(config);

        // Act
        var checkout = service.GenerateCheckoutParams(
            orderId: "CH-TEST001",
            amount: 150.00m,
            currency: "LKR",
            items: "Unlock Contact",
            returnUrl: "https://coconuthub.lk/return",
            cancelUrl: "https://coconuthub.lk/cancel",
            notifyUrl: "https://coconuthub.lk/api/payments/notify"
        );

        // Assert
        Assert.NotNull(checkout);
        Assert.Equal("1220000", checkout.MerchantId);
        Assert.Equal("CH-TEST001", checkout.OrderId);
        Assert.Equal("150.00", checkout.Amount);
        Assert.Equal("LKR", checkout.Currency);
        Assert.NotEmpty(checkout.Hash);
    }

    [Fact]
    public void PayHereService_ValidatesValidIpnSignature()
    {
        // Arrange
        var config = CreateConfig("1220000", "secret123");
        var service = new PayHereService(config);

        // Expected hash: md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret).ToUpper())
        byte[] secretBytes = Encoding.UTF8.GetBytes("secret123");
        string secretHex = Convert.ToHexStringLower(MD5.HashData(secretBytes)).ToUpperInvariant();
        string raw = $"1220000CH-TEST001150.00LKR2{secretHex}";
        string validMd5Sig = Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(raw))).ToUpperInvariant();

        // Act
        bool isValid = service.ValidateIpnSignature(
            merchantId: "1220000",
            orderId: "CH-TEST001",
            payhereAmount: "150.00",
            payhereCurrency: "LKR",
            statusCode: "2",
            md5sig: validMd5Sig
        );

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public async Task SmsService_SendsAndVerifiesOtp()
    {
        // Arrange
        var config = CreateConfig("1220000", "secret123");
        var sms = new SmsService(NullLogger<SmsService>.Instance, config);

        // Act
        string otp = await sms.SendOtpAsync("0771234567");

        // Assert
        Assert.NotNull(otp);
        Assert.Equal(4, otp.Length);

        // Verify valid OTP
        bool success = sms.VerifyOtp("0771234567", otp);
        Assert.True(success);

        // Verify wrong OTP fails
        bool fail = sms.VerifyOtp("0771234567", "9999");
        Assert.False(fail);
    }
}
