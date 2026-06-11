using AutoMapper;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WMS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Employee, EmployeeDto>();

        CreateMap<CreateEmployeeDto, Employee>();

        CreateMap<Project, ProjectDto>();

        CreateMap<CreateProjectDto, Project>();
    }
}