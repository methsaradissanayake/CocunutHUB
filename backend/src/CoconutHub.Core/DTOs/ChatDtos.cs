namespace CoconutHub.Core.DTOs;

public record ChatMessageDto(
    Guid Id,
    Guid? UserId,
    string AuthorName,
    string District,
    string Role,
    string Topic,
    string Message,
    int LikesCount,
    int RepliesCount,
    string? Badge,
    DateTime CreatedAt,
    string TimeAgo,
    Guid? ParentMessageId = null,
    Guid? RepliedToUserId = null,
    string? RepliedToAuthor = null
);

public class CreateChatMessageRequest
{
    public string AuthorName { get; set; } = string.Empty;
    public string District { get; set; } = "Kurunegala";
    public string? Role { get; set; } = "Trader";
    public string Topic { get; set; } = "prices";
    public string Message { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public Guid? ParentMessageId { get; set; }
    public Guid? RepliedToUserId { get; set; }
    public string? RepliedToAuthor { get; set; }
}

public record NotificationDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Message,
    string Type,
    Guid? RelatedEntityId,
    string? SenderName,
    bool IsRead,
    DateTime CreatedAt,
    string TimeAgo
);
