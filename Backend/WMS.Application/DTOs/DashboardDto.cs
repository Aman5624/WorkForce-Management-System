namespace WMS.Application.DTOs;

public class DashboardDto
{
    public int TotalEmployees { get; set; }

    public int TotalDepartments { get; set; }

    public int TotalProjects { get; set; }

    public int PendingLeaves { get; set; }

    public int PresentToday { get; set; }
}