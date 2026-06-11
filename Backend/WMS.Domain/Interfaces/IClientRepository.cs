using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();

    Task<Client?> GetByIdAsync(int id);

    Task AddAsync(Client client);
}