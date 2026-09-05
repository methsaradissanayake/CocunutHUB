using CoconutHub.Core.Entities;
using CoconutHub.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(CoconutHubDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Ensure ChatMessages and Notifications tables exist for SQLite backward compatibility
        if (context.Database.IsSqlite())
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS ChatMessages (
                        Id TEXT PRIMARY KEY,
                        UserId TEXT NULL,
                        AuthorName TEXT NOT NULL,
                        District TEXT NOT NULL,
                        Role TEXT NULL,
                        Topic TEXT NOT NULL,
                        Message TEXT NOT NULL,
                        LikesCount INTEGER NOT NULL DEFAULT 0,
                        RepliesCount INTEGER NOT NULL DEFAULT 0,
                        Badge TEXT NULL,
                        CreatedAt TEXT NOT NULL,
                        ParentMessageId TEXT NULL,
                        RepliedToUserId TEXT NULL,
                        RepliedToAuthor TEXT NULL
                    );
                    CREATE INDEX IF NOT EXISTS IX_ChatMessages_Topic ON ChatMessages(Topic);
                    CREATE INDEX IF NOT EXISTS IX_ChatMessages_CreatedAt ON ChatMessages(CreatedAt);

                    CREATE TABLE IF NOT EXISTS Notifications (
                        Id TEXT PRIMARY KEY,
                        UserId TEXT NOT NULL,
                        Title TEXT NOT NULL,
                        Message TEXT NOT NULL,
                        Type TEXT NOT NULL,
                        RelatedEntityId TEXT NULL,
                        SenderName TEXT NULL,
                        IsRead INTEGER NOT NULL DEFAULT 0,
                        CreatedAt TEXT NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS IX_Notifications_UserId ON Notifications(UserId);
                    CREATE INDEX IF NOT EXISTS IX_Notifications_CreatedAt ON Notifications(CreatedAt);
                ");

                try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE ChatMessages ADD COLUMN ParentMessageId TEXT NULL;"); } catch { }
                try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE ChatMessages ADD COLUMN RepliedToUserId TEXT NULL;"); } catch { }
                try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE ChatMessages ADD COLUMN RepliedToAuthor TEXT NULL;"); } catch { }
            }
            catch
            {
                // Ignore if already configured
            }
        }

        // 1. Seed Demo Users
        if (!await context.Users.AnyAsync())
        {
            var demoUsers = new List<User>
            {
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    PhoneNumber = "+94774561122",
                    Email = "wickrama@coconuthub.lk",
                    FullName = "Wickrama Silva",
                    BusinessName = "Wickrama Traders",
                    BusinessType = "Both",
                    Bio = "Leading coconut and copra trader in Western and North-Western provinces with 15+ years experience.",
                    Role = UserRole.Trader,
                    District = "Colombo",
                    IsVerified = true
                },
                new()
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    PhoneNumber = "+94712243311",
                    Email = "sunil@silvaestate.lk",
                    FullName = "Sunil Perera",
                    BusinessName = "Silva Estate",
                    BusinessType = "Supplier",
                    Bio = "Coconut estate owner supplying premium fresh green coconuts, copra and dried husks in bulk.",
                    Role = UserRole.Farmer,
                    District = "Kurunegala",
                    IsVerified = true
                },
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    PhoneNumber = "+94768112200",
                    Email = "procure@colombofoods.lk",
                    FullName = "Colombo Foods PLC",
                    BusinessName = "Colombo Foods PLC",
                    BusinessType = "Buyer",
                    Bio = "Industrial manufacturer and exporter purchasing high grade coconut oil and virgin copra.",
                    Role = UserRole.Miller,
                    District = "Colombo",
                    IsVerified = true
                }
            };
            await context.Users.AddRangeAsync(demoUsers);
            await context.SaveChangesAsync();
        }

        // 2. Seed Commodity Benchmark Prices
        if (!await context.CommodityPrices.AnyAsync())
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var prices = new List<CommodityPrice>
            {
                new() { Commodity = CommodityType.Coconut, PriceLkr = 117.58m, Unit = "per nut", ChangePercentage = 1.18m, RecordedDate = today, Source = "Official CDA Live Auction" },
                new() { Commodity = CommodityType.CoconutOil, PriceLkr = 875.00m, Unit = "per litre", ChangePercentage = -1.69m, RecordedDate = today, Source = "Official CDA Live Auction" },
                new() { Commodity = CommodityType.CoconutHusk, PriceLkr = 13227.75m, Unit = "per 1,000 husks", ChangePercentage = 1.64m, RecordedDate = today, Source = "Official CDA Live Auction" },
                new() { Commodity = CommodityType.CoirFiber, PriceLkr = 168.00m, Unit = "per kg", ChangePercentage = 0.90m, RecordedDate = today, Source = "Official CDA Live Auction" },
                new() { Commodity = CommodityType.CoconutShell, PriceLkr = 4150.00m, Unit = "per 100 kg", ChangePercentage = -0.48m, RecordedDate = today, Source = "Official CDA Live Auction" }
            };

            // Seed 8-week history for Coconut from official CDA Colombo Auction reports
            var trendPrices = new[] { 95.9m, 104.6m, 112.5m, 117.3m, 114.4m, 116.7m, 116.2m, 117.58m };
            for (int i = 0; i < trendPrices.Length; i++)
            {
                prices.Add(new CommodityPrice
                {
                    Commodity = CommodityType.Coconut,
                    PriceLkr = trendPrices[i],
                    Unit = "per nut",
                    ChangePercentage = 1.18m,
                    RecordedDate = today.AddDays(-7 * (trendPrices.Length - 1 - i)),
                    Source = "CDA Colombo Auction"
                });
            }

            await context.CommodityPrices.AddRangeAsync(prices);
            await context.SaveChangesAsync();
        }

        // 3. Seed Processing Mills
        if (!await context.Mills.AnyAsync())
        {
            var mills = new List<Mill>
            {
                new() { Name = "Kurunegala Coconut Works", Category = "coconut_mill", District = "Kurunegala", PhoneNumber = "+94 37 222 3344", IsVerified = true },
                new() { Name = "Chilaw Oil Refinery", Category = "oil_mill", District = "Puttalam", PhoneNumber = "+94 32 226 7788", IsVerified = true },
                new() { Name = "Ambalangoda Coir Mill", Category = "coir_mill", District = "Galle", PhoneNumber = "+94 91 225 4411", IsVerified = true },
                new() { Name = "Matale Estate Mills", Category = "coconut_mill", District = "Matale", PhoneNumber = "+94 66 222 9911", IsVerified = true },
                new() { Name = "Gampaha Copra Traders", Category = "coconut_mill", District = "Gampaha", PhoneNumber = "+94 33 222 1122", IsVerified = false },
                new() { Name = "Southern Oil Pressers", Category = "oil_mill", District = "Matara", PhoneNumber = "+94 41 223 8877", IsVerified = true },
                new() { Name = "Ratnapura Fiber Co.", Category = "coir_mill", District = "Ratnapura", PhoneNumber = "+94 45 222 3311", IsVerified = false },
                new() { Name = "Katunayake Oil Mills", Category = "oil_mill", District = "Gampaha", PhoneNumber = "+94 11 225 5566", IsVerified = true },
                new() { Name = "Hambantota Coir Exports", Category = "coir_mill", District = "Hambantota", PhoneNumber = "+94 47 223 4455", IsVerified = true },
                new() { Name = "Kegalle Village Mill", Category = "coconut_mill", District = "Kegalle", PhoneNumber = "+94 35 222 7799", IsVerified = false },
                new() { Name = "Colombo Coir Wholesale", Category = "coir_mill", District = "Colombo", PhoneNumber = "+94 11 258 0011", IsVerified = true },
                new() { Name = "Kalutara Family Oil Mill", Category = "oil_mill", District = "Kalutara", PhoneNumber = "+94 34 222 6644", IsVerified = false }
            };
            await context.Mills.AddRangeAsync(mills);
            await context.SaveChangesAsync();
        }

        // 4. Seed Marketplace Listings
        if (!await context.Listings.AnyAsync())
        {
            var user1 = await context.Users.FirstAsync();
            var listings = new List<Listing>
            {
                new() { UserId = user1.Id, Type = ListingType.Buyer, Commodity = CommodityType.Coconut, QuantityDescription = "5,000 nuts / week", Notes = "Grade A only, size ≥ 350g. Weekly pickup Fridays.", District = "Colombo", ContactPhone = "+94 77 456 1122" },
                new() { UserId = user1.Id, Type = ListingType.Supplier, Commodity = CommodityType.Coconut, QuantityDescription = "12,000 nuts / week", Notes = "Own transport up to 200km. Contract options available.", District = "Kurunegala", ContactPhone = "+94 71 224 3311" },
                new() { UserId = user1.Id, Type = ListingType.Buyer, Commodity = CommodityType.CoconutOil, QuantityDescription = "8,000 L / month", Notes = "White coconut oil, edible grade. Ongoing contract.", District = "Colombo", ContactPhone = "+94 76 811 2200" },
                new() { UserId = user1.Id, Type = ListingType.Supplier, Commodity = CommodityType.CoconutOil, QuantityDescription = "20,000 L / month", Notes = "Bulk drums or tankers. Export documentation supported.", District = "Puttalam", ContactPhone = "+94 77 998 6611" },
                new() { UserId = user1.Id, Type = ListingType.Buyer, Commodity = CommodityType.CoirFiber, QuantityDescription = "40 tonnes / month", Notes = "For hydroponic use, low EC required.", District = "Gampaha", ContactPhone = "+94 70 322 7788" },
                new() { UserId = user1.Id, Type = ListingType.Supplier, Commodity = CommodityType.CoirFiber, QuantityDescription = "60 tonnes / month", Notes = "Bristle & mattress fiber. FOB Colombo pricing.", District = "Galle", ContactPhone = "+94 76 445 9922" },
                new() { UserId = user1.Id, Type = ListingType.Buyer, Commodity = CommodityType.CoconutHusk, QuantityDescription = "100,000 husks / month", Notes = "Fresh, unaged husks for pith processing.", District = "Kalutara", ContactPhone = "+94 71 100 2233" },
                new() { UserId = user1.Id, Type = ListingType.Supplier, Commodity = CommodityType.CoconutHusk, QuantityDescription = "250,000 husks / month", Notes = "Long-term supply contract preferred.", District = "Matale", ContactPhone = "+94 77 553 4411" },
                new() { UserId = user1.Id, Type = ListingType.Buyer, Commodity = CommodityType.CoconutShell, QuantityDescription = "15 tonnes / month", Notes = "Clean, dry shell. Testing required before contract.", District = "Kandy", ContactPhone = "+94 70 812 4477" },
                new() { UserId = user1.Id, Type = ListingType.Supplier, Commodity = CommodityType.CoconutShell, QuantityDescription = "22 tonnes / month", Notes = "Charcoal-grade shell available. Sample on request.", District = "Galle", ContactPhone = "+94 71 224 8090" }
            };
            await context.Listings.AddRangeAsync(listings);
            await context.SaveChangesAsync();
        }

        // 5. Seed Community Trade Chat Discussions
        if (!await context.ChatMessages.AnyAsync())
        {
            var chats = new List<ChatMessage>
            {
                new()
                {
                    AuthorName = "Gamini Wickramasinghe",
                    District = "Kurunegala",
                    Role = "Grower / වතු හිමි",
                    Topic = "prices",
                    Message = "CDA latest auction closed at Rs. 117.58 average. Anyone in Kurunegala or Narammala buying above Rs. 120 for fresh large nuts (>700g)? Have ~15,000 ready.",
                    LikesCount = 6,
                    RepliesCount = 2,
                    Badge = "Verified Grower",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-15)
                },
                new()
                {
                    AuthorName = "Nimal Fernando (Fernando Oil Mills)",
                    District = "Gampaha",
                    Role = "Miller / මෝල් හිමි",
                    Topic = "mills",
                    Message = "Negombo & Kochchikade area: We are accepting copra and dry nuts daily for oil extraction. Paying spot cash on delivery. Current intake rate Rs. 875/kg for pure copra.",
                    LikesCount = 11,
                    RepliesCount = 4,
                    Badge = "Registered Mill",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-35)
                },
                new()
                {
                    AuthorName = "Rathnayake Logistics",
                    District = "Kurunegala",
                    Role = "Transporter / ප්‍රවාහන",
                    Topic = "transport",
                    Message = "Lorry available (10-ton container / 15,000 nuts capacity) traveling from Kuliyapitiya / Giriulla to Colombo Pettah wholesale market daily at night. Reasonable rates.",
                    LikesCount = 8,
                    RepliesCount = 1,
                    Badge = "Transport Partner",
                    CreatedAt = DateTime.UtcNow.AddHours(-1)
                },
                new()
                {
                    AuthorName = "Sunil Shantha Perera",
                    District = "Puttalam",
                    Role = "Trader / වෙළෙන්දා",
                    Topic = "prices",
                    Message = "Madampe area: 25,000 mature coconuts harvested this week. Husking labor team available on site. Direct buyers or millers please reach out.",
                    LikesCount = 14,
                    RepliesCount = 5,
                    Badge = "Verified Trader",
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    AuthorName = "Lanka Coir Solutions Ltd",
                    District = "Puttalam",
                    Role = "Coir Miller / කොහු මෝල",
                    Topic = "mills",
                    Message = "Urgent husk requirement: Buying 50,000 green/semi-dry coconut husks for mattress fiber manufacturing. We can arrange transport if within 30km of Chilaw.",
                    LikesCount = 9,
                    RepliesCount = 3,
                    Badge = "Registered Mill",
                    CreatedAt = DateTime.UtcNow.AddHours(-3)
                },
                new()
                {
                    AuthorName = "Colombo Agro Exporters",
                    District = "Colombo",
                    Role = "Exporter / අපනයනකරු",
                    Topic = "prices",
                    Message = "Inquiring for 40ft FCL bulk coconut shell charcoal. High calorific value, moisture < 12%. Need FOB Colombo quote with test certificate.",
                    LikesCount = 15,
                    RepliesCount = 6,
                    Badge = "Verified Buyer",
                    CreatedAt = DateTime.UtcNow.AddHours(-5)
                }
            };
            await context.ChatMessages.AddRangeAsync(chats);
            await context.SaveChangesAsync();
        }
    }
}
