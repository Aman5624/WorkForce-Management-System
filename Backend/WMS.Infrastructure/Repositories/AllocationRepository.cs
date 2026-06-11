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
}