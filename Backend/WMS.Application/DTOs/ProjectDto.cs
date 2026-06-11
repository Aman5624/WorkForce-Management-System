namespace WMS.Application.DTOs;

public class ProjectDto
{
    public int ProjectId { get; set; }

    public string ProjectName { get; set; } = string.Empty;

    public string ClientName { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string Status { get; set; } = string.Empty;
}