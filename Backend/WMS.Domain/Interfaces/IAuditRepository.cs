using WMS.Domain.Entities;

namespace WMS.Domain.Interfaces;

public interface IAuditRepository
{
    Task AddLogAsync(AuditLog log);
}