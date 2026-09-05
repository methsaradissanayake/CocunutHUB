using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Core.Enums;
using CoconutHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using CoconutHub.Infrastructure.Services;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricesController : ControllerBase
{
    private readonly CoconutHubDbContext _context;
    private readonly ICdaPriceAlertService _cdaPriceAlertService;

    public PricesController(CoconutHubDbContext context, ICdaPriceAlertService cdaPriceAlertService)
    {
        _context = context;
        _cdaPriceAlertService = cdaPriceAlertService;
    }

    [HttpGet]
    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<CommodityPriceDto>>> GetTodayPrices()
    {
        var alert = await _cdaPriceAlertService.GetLatestCdaPriceAlertAsync();
        return Ok(alert.Commodities);
    }

    [HttpGet("cda-alert")]
    public async Task<ActionResult<CdaPriceAlertResponse>> GetCdaPriceAlert()
    {
        var alert = await _cdaPriceAlertService.GetLatestCdaPriceAlertAsync();
        return Ok(alert);
    }

    [HttpPost("sync-cda")]
    public async Task<ActionResult<CdaPriceAlertResponse>> SyncCdaPrices()
    {
        var result = await _cdaPriceAlertService.SyncCdaPricesAsync();
        return Ok(result);
    }

    [HttpGet("trend")]
    public async Task<ActionResult<IEnumerable<TrendPointDto>>> GetTrend([FromQuery] string commodity = "coconut", [FromQuery] int weeks = 8)
    {
        if (!Enum.TryParse<CommodityType>(commodity, true, out var commType))
        {
            commType = CommodityType.Coconut;
        }

        var history = await _context.CommodityPrices
            .Where(p => p.Commodity == commType)
            .OrderBy(p => p.RecordedDate)
            .Take(weeks)
            .ToListAsync();

        var trendPoints = history.Select((p, idx) => new TrendPointDto(
            Week: $"W{idx + 1}",
            Price: p.PriceLkr
        )).ToList();

        return Ok(trendPoints);
    }

    [HttpPost]
    public async Task<ActionResult> UpdateDailyPrice([FromBody] CommodityPriceDto dto)
    {
        if (!Enum.TryParse<CommodityType>(dto.Commodity, true, out var commType))
        {
            return BadRequest("Invalid commodity type");
        }

        var entity = new CommodityPrice
        {
            Commodity = commType,
            PriceLkr = dto.Price,
            Unit = dto.UnitKey,
            ChangePercentage = dto.Change,
            RecordedDate = dto.Date == default ? DateOnly.FromDateTime(DateTime.UtcNow) : dto.Date,
            Source = dto.Source ?? "CDA Auction"
        };

        _context.CommodityPrices.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Price recorded successfully" });
    }

    private static string GetUnitKey(CommodityType c) => c switch
    {
        CommodityType.Coconut => "price_unit_per_nut",
        CommodityType.CoconutOil => "price_unit_per_litre",
        CommodityType.CoconutHusk => "price_unit_per_1000_husks",
        CommodityType.CoirFiber => "price_unit_per_kg",
        CommodityType.CoconutShell => "price_unit_per_100kg",
        _ => "per unit"
    };
}
