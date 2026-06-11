namespace WMS.Domain.Entities;

public class Project
{
    public int ProjectId { get; set; }

    public string ProjectName { get; set; } = string.Empty;

    public int? ClientId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string Status { get; set; } = "Active";

    public Client? Client { get; set; }

    public ICollection<EmployeeProjectAllocation>? Allocations { get; set; }
}