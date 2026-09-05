using CoconutHub.Core.Enums;

namespace CoconutHub.Core.Entities;

public class Listing
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public ListingType Type { get; set; } // Buyer or Supplier
    public CommodityType Commodity { get; set; }
    public string QuantityDescription { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string District { get; set; } = string.Empty;
    
    // SECURE: Kept private by default; revealed only after verified payment
    public string ContactPhone { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ContactUnlock> Unlocks { get; set; } = new List<ContactUnlock>();
}
