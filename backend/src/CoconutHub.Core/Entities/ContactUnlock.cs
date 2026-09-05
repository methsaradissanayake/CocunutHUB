using CoconutHub.Core.Enums;

namespace CoconutHub.Core.Entities;

public class ContactUnlock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderId { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid ListingId { get; set; }
    public Listing? Listing { get; set; }

    public decimal Amount { get; set; } = 150.00m;
    public string Currency { get; set; } = "LKR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? PayHerePaymentId { get; set; }
    public string? PayHereMethod { get; set; }

    public DateTime? UnlockedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
