using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MillsController : ControllerBase
{
    private readonly CoconutHubDbContext _context;

    public MillsController(CoconutHubDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MillDto>>> GetMills([FromQuery] string? category, [FromQuery] string? district)
    {
        var query = _context.Mills.AsQueryable();

        if (!string.IsNullOrEmpty(category) && !category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(m => m.Category == category);
        }

        if (!string.IsNullOrEmpty(district) && !district.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(m => m.District == district);
        }

        var mills = await query
            .OrderByDescending(m => m.IsVerified)
            .ThenBy(m => m.Name)
            .Select(m => new MillDto(
                m.Id.ToString(),
                m.Name,
                m.Category,
                m.District,
                m.Address,
                m.PhoneNumber,
                m.IsVerified
            ))
            .ToListAsync();

        return Ok(mills);
    }

    [HttpPost]
    public async Task<ActionResult<MillDto>> CreateMill([FromBody] CreateMillRequest request)
    {
        var mill = new Mill
        {
            Name = request.Name,
            Category = request.Category,
            District = request.District,
            Address = request.Address,
            PhoneNumber = request.Phone,
            IsVerified = false // Needs staff verification
        };

        _context.Mills.Add(mill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMills), new { id = mill.Id }, new MillDto(
            mill.Id.ToString(),
            mill.Name,
            mill.Category,
            mill.District,
            mill.Address,
            mill.PhoneNumber,
            mill.IsVerified
        ));
    }
}
