using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class AllocationRepository : IAllocationRepository
{
    private readonly AppDbContext _context;

    public AllocationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(EmployeeProjectAllocation allocation)
    {
        await _context.EmployeeProjectAllocations
            .AddAsync(allocation);

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<EmployeeProjectAllocation>> GetAllAsync()
    {
        return await _context.EmployeeProjectAllocations
            .Include(a => a.Employee)
            .Include(a => a.Project)
            .ToListAsync();
    }

    public async Task<EmployeeProjectAllocation?> GetByIdAsync(int id)
    {
        return await _context.EmployeeProjectAllocations.FindAsync(id);
    }

    public async Task UpdateAsync(EmployeeProjectAllocation allocation)
    {
        _context.EmployeeProjectAllocations.Update(allocation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var allocation = await _context.EmployeeProjectAllocations.FindAsync(id);
        if (allocation != null)
        {
            _context.EmployeeProjectAllocations.Remove(allocation);
            await _context.SaveChangesAsync();
        }
    }
}