using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IAllocationRepository
{
    Task AddAsync(EmployeeProjectAllocation allocation);

    Task<IEnumerable<EmployeeProjectAllocation>> GetAllAsync();

    Task<EmployeeProjectAllocation?> GetByIdAsync(int id);

    Task UpdateAsync(EmployeeProjectAllocation allocation);

    Task DeleteAsync(int id);
}