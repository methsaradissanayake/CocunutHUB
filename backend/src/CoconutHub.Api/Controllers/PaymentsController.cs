using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Core.Enums;
using CoconutHub.Infrastructure.Data;
using CoconutHub.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly CoconutHubDbContext _context;
    private readonly IPayHereService _payHereService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(CoconutHubDbContext context, IPayHereService payHereService, ILogger<PaymentsController> logger)
    {
        _context = context;
        _payHereService = payHereService;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<ActionResult<CreatePaymentResponse>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (!Guid.TryParse(request.ListingId, out var listingId))
        {
            // If listing ID was mock format like "L1", try to map to first listing
            var firstListing = await _context.Listings.FirstOrDefaultAsync();
            if (firstListing != null) listingId = firstListing.Id;
            else return BadRequest("Invalid listing ID");
        }

        var listing = await _context.Listings.FindAsync(listingId);
        if (listing == null) return NotFound("Listing not found");

        // Generate unique Order ID prefixed with "CH-"
        string orderId = $"CH-{Guid.NewGuid():N}"[..19].ToUpperInvariant();
        decimal amount = 150.00m;
        string currency = "LKR";

        var unlock = new ContactUnlock
        {
            OrderId = orderId,
            ListingId = listing.Id,
            Amount = amount,
            Currency = currency,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactUnlocks.Add(unlock);
        await _context.SaveChangesAsync();

        PayHereCheckoutParams? payhereParams = null;
        if (!_payHereService.IsDemoMode)
        {
            string origin = request.OriginUrl ?? "https://coconuthub.lk";
            payhereParams = _payHereService.GenerateCheckoutParams(
                orderId: orderId,
                amount: amount,
                currency: currency,
                items: $"Unlock Contact: {request.ListingTitle ?? listing.QuantityDescription}",
                returnUrl: $"{origin}/market?unlocked={orderId}",
                cancelUrl: $"{origin}/market",
                notifyUrl: $"{origin}/api/payments/notify"
            );
        }

        return Ok(new CreatePaymentResponse(
            OrderId: orderId,
            ListingId: listing.Id.ToString(),
            Amount: amount,
            Currency: currency,
            DemoMode: _payHereService.IsDemoMode,
            Payhere: payhereParams
        ));
    }

    [HttpPost("demo-complete/{orderId}")]
    public async Task<ActionResult> DemoComplete(string orderId)
    {
        var unlock = await _context.ContactUnlocks.FirstOrDefaultAsync(u => u.OrderId == orderId);
        if (unlock == null) return NotFound("Order not found");

        unlock.Status = PaymentStatus.Completed;
        unlock.UnlockedAt = DateTime.UtcNow;
        unlock.ExpiresAt = DateTime.UtcNow.AddDays(30);
        unlock.PayHereMethod = "DEMO_SIMULATION";

        await _context.SaveChangesAsync();

        return Ok(new { order_id = orderId, status = "success", unlocked = true });
    }

    [HttpGet("status/{orderId}")]
    public async Task<ActionResult<PaymentStatusResponse>> GetStatus(string orderId)
    {
        var unlock = await _context.ContactUnlocks.FirstOrDefaultAsync(u => u.OrderId == orderId);
        if (unlock == null) return NotFound("Order not found");

        return Ok(new PaymentStatusResponse(
            OrderId: unlock.OrderId,
            ListingId: unlock.ListingId.ToString(),
            Status: unlock.Status.ToString().ToLowerInvariant(),
            Unlocked: unlock.Status == PaymentStatus.Completed
        ));
    }

    [HttpPost("notify")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<ActionResult> PayHereNotify([FromForm] IFormCollection form)
    {
        string merchantId = form["merchant_id"].ToString();
        string orderId = form["order_id"].ToString();
        string payhereAmount = form["payhere_amount"].ToString();
        string payhereCurrency = form["payhere_currency"].ToString();
        string statusCode = form["status_code"].ToString();
        string md5sig = form["md5sig"].ToString();
        string paymentId = form["payment_id"].ToString();
        string method = form["method"].ToString();

        _logger.LogInformation(">>> PayHere IPN Received: Order={Order}, Status={Status}", orderId, statusCode);

        bool isValid = _payHereService.ValidateIpnSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig);
        if (!isValid)
        {
            _logger.LogWarning("Invalid PayHere IPN MD5 Signature for Order={Order}", orderId);
            return BadRequest("Invalid signature");
        }

        var unlock = await _context.ContactUnlocks.FirstOrDefaultAsync(u => u.OrderId == orderId);
        if (unlock == null) return NotFound("Order not found");

        // Status code 2 means payment success in PayHere
        if (statusCode == "2")
        {
            unlock.Status = PaymentStatus.Completed;
            unlock.PayHerePaymentId = paymentId;
            unlock.PayHereMethod = method;
            unlock.UnlockedAt = DateTime.UtcNow;
            unlock.ExpiresAt = DateTime.UtcNow.AddDays(30);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Order={Order} successfully marked COMPLETED & UNLOCKED", orderId);
        }
        else
        {
            unlock.Status = PaymentStatus.Failed;
            await _context.SaveChangesAsync();
        }

        return Ok();
    }
}
