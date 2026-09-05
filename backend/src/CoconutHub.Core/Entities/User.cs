using CoconutHub.Core.Enums;

namespace CoconutHub.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public string? FullName { get; set; }
    public string? BusinessName { get; set; }
    public string BusinessType { get; set; } = "Supplier"; // "Supplier", "Buyer", "Both"
    public string? Bio { get; set; }
    public UserRole Role { get; set; } = UserRole.Trader;
    public string District { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "si"; // "si" or "en"
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    public ICollection<ContactUnlock> Unlocks { get; set; } = new List<ContactUnlock>();
}

