using System.ComponentModel.DataAnnotations;

namespace CoconutHub.Core.DTOs;

public record SendOtpRequest(
    string PhoneNumber
);

public record SendOtpResponse(
    bool Success,
    string Message,
    string? DemoOtp // Returned in development/demo mode for convenience
);

public record VerifyOtpRequest(
    string PhoneNumber,
    string OtpCode,
    string? FullName,
    string? District
);

public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string PhoneNumber,
    string District,
    string BusinessType, // "Supplier", "Buyer", "Both"
    string? BusinessName,
    string? Bio
);

public record LoginRequest(
    string Identifier, // Email or Phone Number
    string Password
);

public record UpdateProfileRequest(
    string? FullName,
    string? BusinessName,
    string? BusinessType,
    string? District,
    string? Bio,
    string? Email
);

public record AuthResponse(
    bool Success,
    string? Token,
    UserDto? User,
    string? Message
);

public record UserDto(
    string Id,
    string PhoneNumber,
    string? Email,
    string? FullName,
    string? BusinessName,
    string BusinessType,
    string? Bio,
    string Role,
    string District,
    string PreferredLanguage,
    bool IsVerified,
    DateTime CreatedAt
);

