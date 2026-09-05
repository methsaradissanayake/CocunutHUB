using CoconutHub.Core.DTOs;
using CoconutHub.Core.Entities;
using CoconutHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController : ControllerBase
{
    private readonly CoconutHubDbContext _context;
    private readonly ILogger<ChatsController> _logger;

    public ChatsController(CoconutHubDbContext context, ILogger<ChatsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ChatMessageDto>>> GetMessages(
        [FromQuery] string? topic = "all",
        [FromQuery] string? district = "all",
        [FromQuery] string? search = null,
        [FromQuery] int limit = 60)
    {
        var query = _context.ChatMessages.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(topic) && topic.ToLower() != "all")
        {
            query = query.Where(m => m.Topic.ToLower() == topic.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(district) && district.ToLower() != "all")
        {
            query = query.Where(m => m.District.ToLower() == district.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(m =>
                m.Message.ToLower().Contains(q) ||
                m.AuthorName.ToLower().Contains(q) ||
                m.District.ToLower().Contains(q));
        }

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var dtos = messages.Select(ToDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetUserDiscussions(Guid userId)
    {
        // 1. User's own messages
        var myMessages = await _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(20)
            .ToListAsync();

        var myMessageIds = myMessages.Select(m => (Guid?)m.Id).ToList();

        // 2. Replies received to user's messages
        var receivedReplies = await _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.ParentMessageId != null && (m.RepliedToUserId == userId || myMessageIds.Contains(m.ParentMessageId)))
            .OrderByDescending(m => m.CreatedAt)
            .Take(30)
            .ToListAsync();

        return Ok(new
        {
            myPosts = myMessages.Select(ToDto).ToList(),
            receivedReplies = receivedReplies.Select(ToDto).ToList()
        });
    }

    [HttpPost]
    public async Task<ActionResult<ChatMessageDto>> CreateMessage([FromBody] CreateChatMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.AuthorName))
            return BadRequest("Author name is required.");
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message content is required.");
        if (string.IsNullOrWhiteSpace(request.District))
            return BadRequest("District is required.");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            AuthorName = request.AuthorName.Trim(),
            District = request.District.Trim(),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Trader / වෙළෙන්දා" : request.Role.Trim(),
            Topic = string.IsNullOrWhiteSpace(request.Topic) ? "prices" : request.Topic.Trim().ToLower(),
            Message = request.Message.Trim(),
            LikesCount = 0,
            RepliesCount = 0,
            Badge = "Active Trader",
            CreatedAt = DateTime.UtcNow,
            ParentMessageId = request.ParentMessageId,
            RepliedToUserId = request.RepliedToUserId,
            RepliedToAuthor = request.RepliedToAuthor
        };

        // If this is a reply to another message, update parent & create notification
        if (request.ParentMessageId.HasValue)
        {
            var parent = await _context.ChatMessages.FindAsync(request.ParentMessageId.Value);
            if (parent != null)
            {
                parent.RepliesCount++;
                message.RepliedToAuthor ??= parent.AuthorName;

                // Find recipient user ID
                Guid? recipientUserId = parent.UserId ?? request.RepliedToUserId;
                if (!recipientUserId.HasValue)
                {
                    var matchedUser = await _context.Users.AsNoTracking()
                        .FirstOrDefaultAsync(u => u.FullName == parent.AuthorName || u.BusinessName == parent.AuthorName);
                    if (matchedUser != null)
                    {
                        recipientUserId = matchedUser.Id;
                    }
                }

                if (recipientUserId.HasValue)
                {
                    message.RepliedToUserId = recipientUserId.Value;

                    // Avoid self-notification
                    if (!request.UserId.HasValue || request.UserId.Value != recipientUserId.Value)
                    {
                        var snippet = message.Message.Length > 85 ? message.Message.Substring(0, 85) + "..." : message.Message;
                        var notification = new Notification
                        {
                            Id = Guid.NewGuid(),
                            UserId = recipientUserId.Value,
                            Title = "New Reply Received / නව පිළිතුරක් ලැබුණි",
                            Message = $"{message.AuthorName} replied to your trade post: \"{snippet}\"",
                            Type = "chat_reply",
                            RelatedEntityId = message.Id,
                            SenderName = message.AuthorName,
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                        _logger.LogInformation("Notification dispatched to User {UserId} for reply from {Sender}", recipientUserId.Value, message.AuthorName);
                    }
                }
            }
        }

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New chat message posted by {Author} in {District} under {Topic}", message.AuthorName, message.District, message.Topic);

        return Ok(ToDto(message));
    }

    [HttpPost("{id}/like")]
    public async Task<ActionResult<int>> LikeMessage(Guid id)
    {
        var message = await _context.ChatMessages.FindAsync(id);
        if (message == null)
            return NotFound("Message not found.");

        message.LikesCount++;
        await _context.SaveChangesAsync();

        return Ok(message.LikesCount);
    }

    private static ChatMessageDto ToDto(ChatMessage m)
    {
        var diff = DateTime.UtcNow - m.CreatedAt;
        string timeAgo = diff.TotalMinutes < 1 ? "Just now" :
                         diff.TotalMinutes < 60 ? $"{(int)diff.TotalMinutes}m ago" :
                         diff.TotalHours < 24 ? $"{(int)diff.TotalHours}h ago" :
                         $"{(int)diff.TotalDays}d ago";

        return new ChatMessageDto(
            m.Id,
            m.UserId,
            m.AuthorName,
            m.District,
            m.Role,
            m.Topic,
            m.Message,
            m.LikesCount,
            m.RepliesCount,
            m.Badge,
            m.CreatedAt,
            timeAgo,
            m.ParentMessageId,
            m.RepliedToUserId,
            m.RepliedToAuthor
        );
    }
}
