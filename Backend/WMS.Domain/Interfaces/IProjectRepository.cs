using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllAsync();

    Task<Project?> GetByIdAsync(int id);

    Task AddAsync(Project project);

    Task UpdateAsync(Project project);

    Task DeleteAsync(int id);
}