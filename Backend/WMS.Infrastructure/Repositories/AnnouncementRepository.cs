using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class AnnouncementRepository : IAnnouncementRepository
{
    private readonly AppDbContext _context;

    public AnnouncementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Announcement>> GetAllAsync()
    {
        return await _context.Announcements.ToListAsync();
    }

    public async Task AddAsync(Announcement announcement)
    {
        await _context.Announcements.AddAsync(announcement);
        await _context.SaveChangesAsync();
    }

    public async Task<Announcement?> GetByIdAsync(int id)
    {
        return await _context.Announcements.FindAsync(id);
    }

    public async Task UpdateAsync(Announcement announcement)
    {
        _context.Announcements.Update(announcement);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement != null)
        {
            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
        }
    }
}