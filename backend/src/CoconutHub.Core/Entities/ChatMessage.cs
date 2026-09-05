namespace CoconutHub.Core.Entities;

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Topic { get; set; } = "prices";
    public string Message { get; set; } = string.Empty;
    public int LikesCount { get; set; } = 0;
    public int RepliesCount { get; set; } = 0;
    public Guid? ParentMessageId { get; set; }
    public Guid? RepliedToUserId { get; set; }
    public string? RepliedToAuthor { get; set; }
    public string? Badge { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
