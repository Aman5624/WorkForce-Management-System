using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IRoleRepository
{
    Task<IEnumerable<Role>> GetAllAsync();

    Task<Role?> GetByIdAsync(int id);

    Task AddAsync(Role role);
}