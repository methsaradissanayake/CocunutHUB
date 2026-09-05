namespace CoconutHub.Core.DTOs;

public record ListingDto(
    string Id,
    string Category,
    string Type, // "buyer" or "supplier"
    string Name,
    string District,
    string Quantity,
    string? Notes,
    string? Phone, // Null unless unlocked
    bool IsUnlocked,
    string Posted
);

public record CreateListingRequest(
    string Category,
    string Type, // "buyer" or "supplier"
    string Name,
    string District,
    string Quantity,
    string? Notes,
    string Phone
);

public record ListingContactResponse(
    string ListingId,
    string Phone,
    bool Unlocked,
    DateTime? ExpiresAt
);
