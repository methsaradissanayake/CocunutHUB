using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly CoconutHubDbContext _context;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(CoconutHubDbContext context, ILogger<NotificationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] Guid? userId, [FromQuery] int limit = 30)
    {
        if (!userId.HasValue || userId.Value == Guid.Empty)
        {
            return Ok(new List<NotificationDto>());
        }

        var list = await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId.Value)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var dtos = list.Select(ToDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount([FromQuery] Guid? userId)
    {
        if (!userId.HasValue || userId.Value == Guid.Empty)
        {
            return Ok(0);
        }

        var count = await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId.Value && !n.IsRead);

        return Ok(count);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound("Notification not found.");

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id });
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead([FromQuery] Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var item in unread)
        {
            item.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, count = unread.Count });
    }

    private static NotificationDto ToDto(Notification n)
    {
        var diff = DateTime.UtcNow - n.CreatedAt;
        string timeAgo = diff.TotalMinutes < 1 ? "Just now" :
                         diff.TotalMinutes < 60 ? $"{(int)diff.TotalMinutes}m ago" :
                         diff.TotalHours < 24 ? $"{(int)diff.TotalHours}h ago" :
                         $"{(int)diff.TotalDays}d ago";

        return new NotificationDto(
            n.Id,
            n.UserId,
            n.Title,
            n.Message,
            n.Type,
            n.RelatedEntityId,
            n.SenderName,
            n.IsRead,
            n.CreatedAt,
            timeAgo
        );
    }
}
