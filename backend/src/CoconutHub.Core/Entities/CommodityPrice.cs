using CoconutHub.Core.Enums;

namespace CoconutHub.Core.Entities;

public class CommodityPrice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public CommodityType Commodity { get; set; }
    public decimal PriceLkr { get; set; }
    public string Unit { get; set; } = string.Empty; // "per nut", "per litre", "per kg", etc.
    public decimal ChangePercentage { get; set; }
    public DateOnly RecordedDate { get; set; }
    public string Source { get; set; } = "CDA Auction";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
