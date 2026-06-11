using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _context;

    public AttendanceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Attendance>> GetAllAsync()
    {
        return await _context.Attendances.ToListAsync();
    }

    public async Task<Attendance?> GetByIdAsync(int id)
    {
        return await _context.Attendances.FindAsync(id);
    }

    public async Task CheckInAsync(Attendance attendance)
    {
        await _context.Attendances.AddAsync(attendance);

        await _context.SaveChangesAsync();
    }

    public async Task CheckOutAsync(Attendance attendance)
    {
        _context.Attendances.Update(attendance);

        await _context.SaveChangesAsync();
    }
}