using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IAttendanceRepository
{
    Task<IEnumerable<Attendance>> GetAllAsync();

    Task<Attendance?> GetByIdAsync(int id);

    Task CheckInAsync(Attendance attendance);

    Task CheckOutAsync(Attendance attendance);
}