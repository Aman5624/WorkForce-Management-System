using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface ILeaveRepository
{
    Task<IEnumerable<Leave>> GetAllAsync();

    Task<Leave?> GetByIdAsync(int id);

    Task ApplyLeaveAsync(Leave leave);

    Task UpdateAsync(Leave leave);
}