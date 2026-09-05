namespace CoconutHub.Core.DTOs;

public record CommodityPriceDto(
    string Id,
    string Commodity,
    string NameKey,
    string UnitKey,
    decimal Price,
    decimal Change,
    string Currency,
    string Source,
    DateOnly Date
);

public record TrendPointDto(
    string Week,
    decimal Price
);

public record CdaDistrictPriceDto(
    string District,
    decimal FarmgatePrice,
    decimal Change,
    string SupplyLevel
);

public record CdaAuctionLotDto(
    string AuctionNumber,
    DateOnly AuctionDate,
    int NutsOffered,
    int NutsSold,
    decimal ClearanceRate,
    decimal HighPrice,
    decimal LowPrice,
    decimal WeightedAveragePrice,
    string NextAuctionDate
);

public record CdaPriceAlertResponse(
    bool Success,
    string BulletinNumber,
    DateOnly BulletinDate,
    CdaAuctionLotDto AuctionLot,
    List<CommodityPriceDto> Commodities,
    List<CdaDistrictPriceDto> DistrictPrices,
    string Message,
    DateTime LastSyncedAt,
    string SourceUrl,
    bool IsLiveCdaScraped
);
