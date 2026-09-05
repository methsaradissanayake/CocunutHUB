namespace CoconutHub.Core.DTOs;

public record CreatePaymentRequest(
    string ListingId,
    string? ListingTitle,
    string? OriginUrl
);

public record PayHereCheckoutParams(
    string Sandbox,
    string MerchantId,
    string ReturnUrl,
    string CancelUrl,
    string NotifyUrl,
    string OrderId,
    string Items,
    string Amount,
    string Currency,
    string Hash,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    string City,
    string Country
);

public record CreatePaymentResponse(
    string OrderId,
    string ListingId,
    decimal Amount,
    string Currency,
    bool DemoMode,
    PayHereCheckoutParams? Payhere
);

public record PaymentStatusResponse(
    string OrderId,
    string ListingId,
    string Status,
    bool Unlocked
);
