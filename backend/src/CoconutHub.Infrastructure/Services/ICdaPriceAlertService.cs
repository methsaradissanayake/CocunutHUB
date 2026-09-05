using CoconutHub.Core.DTOs;

namespace CoconutHub.Infrastructure.Services;

public interface ICdaPriceAlertService
{
    Task<CdaPriceAlertResponse> GetLatestCdaPriceAlertAsync();
    Task<CdaPriceAlertResponse> SyncCdaPricesAsync();
}
