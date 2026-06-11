using WMS.Domain.Entities;

namespace WMS.Application.Services;

public interface ITokenService
{
    string GenerateToken(UserLogin user, string roleName);
}