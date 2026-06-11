using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IAnnouncementRepository
{
    Task<IEnumerable<Announcement>> GetAllAsync();

    Task AddAsync(Announcement announcement);
}