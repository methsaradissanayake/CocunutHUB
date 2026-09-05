using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Core.Enums;
using CoconutHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly CoconutHubDbContext _context;

    public ListingsController(CoconutHubDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingDto>>> GetListings([FromQuery] string? category, [FromQuery] string? order_id)
    {
        var query = _context.Listings
            .Include(l => l.User)
            .Include(l => l.Unlocks)
            .Where(l => l.IsActive);

        if (!string.IsNullOrEmpty(category) && !category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            if (TryMapCategory(category, out var commType))
            {
                query = query.Where(l => l.Commodity == commType);
            }
        }

        var list = await query.OrderByDescending(l => l.CreatedAt).ToListAsync();

        var result = list.Select(l =>
        {
            // Check if this specific order_id unlocked this listing
            bool isUnlocked = !string.IsNullOrEmpty(order_id) && 
                              l.Unlocks.Any(u => u.OrderId == order_id && u.Status == PaymentStatus.Completed);

            return new ListingDto(
                Id: l.Id.ToString(),
                Category: MapCategoryToString(l.Commodity),
                Type: l.Type == ListingType.Buyer ? "buyer" : "supplier",
                Name: l.User?.BusinessName ?? l.User?.FullName ?? "Agro Trader",
                District: l.District,
                Quantity: l.QuantityDescription,
                Notes: l.Notes,
                // Open contact for direct industry trading
                Phone: l.ContactPhone,
                IsUnlocked: true,
                Posted: FormatRelativeTime(l.CreatedAt)
            );
        });

        return Ok(result);
    }

    [HttpGet("{id}/contact")]
    public async Task<ActionResult<ListingContactResponse>> GetUnlockedContact(Guid id, [FromQuery] string order_id)
    {
        var listing = await _context.Listings.FindAsync(id);
        if (listing == null) return NotFound("Listing not found");

        if (string.IsNullOrEmpty(order_id))
        {
            return Forbid();
        }

        // Verify that order_id exists, matches this listing, and is completed
        var unlock = await _context.ContactUnlocks
            .FirstOrDefaultAsync(u => u.OrderId == order_id && 
                                      u.ListingId == id && 
                                      u.Status == PaymentStatus.Completed);

        if (unlock == null)
        {
            return Unauthorized(new { message = "Valid payment required to unlock this contact" });
        }

        return Ok(new ListingContactResponse(
            ListingId: listing.Id.ToString(),
            Phone: listing.ContactPhone,
            Unlocked: true,
            ExpiresAt: unlock.ExpiresAt
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ListingDto>> CreateListing([FromBody] CreateListingRequest request)
    {
        if (!TryMapCategory(request.Category, out var commodity))
        {
            return BadRequest("Invalid commodity category");
        }

        var listingType = request.Type.Equals("supplier", StringComparison.OrdinalIgnoreCase) 
            ? ListingType.Supplier 
            : ListingType.Buyer;

        // Find or create user matching this specific trader's phone number
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.Phone);
        if (user == null)
        {
            user = new User
            {
                PhoneNumber = request.Phone,
                FullName = request.Name,
                BusinessName = request.Name,
                District = request.District
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            user.BusinessName = request.Name;
            user.FullName = request.Name;
            await _context.SaveChangesAsync();
        }

        var listing = new Listing
        {
            UserId = user.Id,
            Type = listingType,
            Commodity = commodity,
            QuantityDescription = request.Quantity,
            Notes = request.Notes,
            District = request.District,
            ContactPhone = request.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();

        return Ok(new ListingDto(
            Id: listing.Id.ToString(),
            Category: MapCategoryToString(listing.Commodity),
            Type: listing.Type == ListingType.Buyer ? "buyer" : "supplier",
            Name: user.BusinessName,
            District: listing.District,
            Quantity: listing.QuantityDescription,
            Notes: listing.Notes,
            Phone: listing.ContactPhone, // returned to creator
            IsUnlocked: true,
            Posted: "Just now"
        ));
    }

    private static bool TryMapCategory(string cat, out CommodityType type)
    {
        type = cat.ToLowerInvariant() switch
        {
            "coconut" => CommodityType.Coconut,
            "oil" or "coconut_oil" => CommodityType.CoconutOil,
            "husk" or "coconut_husk" => CommodityType.CoconutHusk,
            "coir" or "coir_fiber" => CommodityType.CoirFiber,
            "shell" or "coconut_shell" => CommodityType.CoconutShell,
            _ => CommodityType.Coconut
        };
        return true;
    }

    private static string MapCategoryToString(CommodityType type) => type switch
    {
        CommodityType.Coconut => "coconut",
        CommodityType.CoconutOil => "oil",
        CommodityType.CoconutHusk => "husk",
        CommodityType.CoirFiber => "coir",
        CommodityType.CoconutShell => "shell",
        _ => "coconut"
    };

    private static string FormatRelativeTime(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes}m ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours}h ago";
        return $"{(int)diff.TotalDays}d ago";
    }
}
