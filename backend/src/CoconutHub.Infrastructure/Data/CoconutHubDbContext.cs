using CoconutHub.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoconutHub.Infrastructure.Data;

public class CoconutHubDbContext : DbContext
{
    public CoconutHubDbContext(DbContextOptions<CoconutHubDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CommodityPrice> CommodityPrices => Set<CommodityPrice>();
    public DbSet<Mill> Mills => Set<Mill>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<ContactUnlock> ContactUnlocks => Set<ContactUnlock>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PhoneNumber).IsUnique();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20).IsRequired();
            entity.Property(e => e.District).HasMaxLength(50);
        });

        // ChatMessage
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Topic);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.AuthorName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.District).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.Topic).HasMaxLength(30).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.Badge).HasMaxLength(50);
            entity.Property(e => e.RepliedToAuthor).HasMaxLength(100);
        });

        // Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Title).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.SenderName).HasMaxLength(100);
        });

        // CommodityPrice
        modelBuilder.Entity<CommodityPrice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.Commodity, e.RecordedDate });
            entity.Property(e => e.PriceLkr).HasPrecision(12, 2);
            entity.Property(e => e.ChangePercentage).HasPrecision(5, 2);
            entity.Property(e => e.Unit).HasMaxLength(50);
            entity.Property(e => e.Source).HasMaxLength(100);
        });

        // Mill
        modelBuilder.Entity<Mill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(50).IsRequired();
            entity.Property(e => e.District).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(30).IsRequired();
        });

        // Listing
        modelBuilder.Entity<Listing>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuantityDescription).HasMaxLength(100).IsRequired();
            entity.Property(e => e.District).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ContactPhone).HasMaxLength(30).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Listings)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ContactUnlock
        modelBuilder.Entity<ContactUnlock>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderId).IsUnique();
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.Currency).HasMaxLength(5);

            entity.HasOne(e => e.Listing)
                  .WithMany(l => l.Unlocks)
                  .HasForeignKey(e => e.ListingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Unlocks)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
