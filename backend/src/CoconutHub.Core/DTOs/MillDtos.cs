namespace CoconutHub.Core.DTOs;

public record MillDto(
    string Id,
    string Name,
    string Category,
    string District,
    string Address,
    string Phone,
    bool Verified
);

public record CreateMillRequest(
    string Name,
    string Category,
    string District,
    string Address,
    string Phone
);
