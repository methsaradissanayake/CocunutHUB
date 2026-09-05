using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using CoconutHub.Core.DTOs;
using Xunit;

namespace CoconutHub.UnitTests;

public class AuthValidationTests
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var trimmed = email.Trim();
        if (!EmailRegex.IsMatch(trimmed)) return false;
        try
        {
            var addr = new System.Net.Mail.MailAddress(trimmed);
            return addr.Address.Equals(trimmed, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    [Theory]
    [InlineData("invalidmail")]
    [InlineData("test@")]
    [InlineData("@example.com")]
    [InlineData("user@domain")]
    [InlineData("user@.com")]
    [InlineData("user@domain..com")]
    [InlineData("")]
    [InlineData("   ")]
    public void IsValidEmail_RejectsInvalidEmails(string email)
    {
        Assert.False(IsValidEmail(email));
    }

    [Theory]
    [InlineData("trader@coconuthub.lk")]
    [InlineData("sunil@silvaestate.lk")]
    [InlineData("procure@colombofoods.com")]
    [InlineData("farmer.kamal@gmail.com")]
    public void IsValidEmail_AcceptsValidEmails(string email)
    {
        Assert.True(IsValidEmail(email));
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

    [Theory]
    [InlineData("0771234567", "+94771234567")]
    [InlineData("077 123 4567", "+94771234567")]
    [InlineData("+94771234567", "+94771234567")]
    [InlineData("94771234567", "+94771234567")]
    [InlineData("071-224-3311", "+94712243311")]
    public void NormalizePhoneNumber_ProducesStandardizedE164(string input, string expected)
    {
        Assert.Equal(expected, NormalizePhoneNumber(input));
    }
}
