using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IDepartmentRepository
{
    Task<IEnumerable<Department>> GetAllAsync();

    Task<Department?> GetByIdAsync(int id);

    Task AddAsync(Department department);

    Task UpdateAsync(Department department);

    Task DeleteAsync(int id);
}