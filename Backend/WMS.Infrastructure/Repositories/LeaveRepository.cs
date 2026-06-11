using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class LeaveRepository : ILeaveRepository
{
    private readonly AppDbContext _context;

    public LeaveRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Leave>> GetAllAsync()
    {
        return await _context.Leaves.ToListAsync();
    }

    public async Task<Leave?> GetByIdAsync(int id)
    {
        return await _context.Leaves.FindAsync(id);
    }

    public async Task ApplyLeaveAsync(Leave leave)
    {
        await _context.Leaves.AddAsync(leave);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Leave leave)
    {
        _context.Leaves.Update(leave);
        await _context.SaveChangesAsync();
    }
}