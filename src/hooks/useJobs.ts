import { JobFilters, PaginatedJobsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const fetchJobs = async (
  pageSize = 10,
  page = 1,
  search = "",
  filters: JobFilters = {
    companies: [],
    locations: [],
    workplaceTypes: [],
    postedWithinDays: null,
  }
): Promise<PaginatedJobsResponse> => {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    page: String(page),
    search,
  });

  if (filters.companies.length > 0) {
    params.set("companies", filters.companies.join(","));
  }

  if (filters.locations.length > 0) {
    params.set("locations", filters.locations.join(","));
  }

  if (filters.workplaceTypes.length > 0) {
    params.set("workplaceTypes", filters.workplaceTypes.join(","));
  }

  if (filters.postedWithinDays) {
    params.set("postedWithinDays", String(filters.postedWithinDays));
  }

  const res = await fetch(`/api/jobs?${params.toString()}`);
  return res.json();
};

const useJobs = (
  pageSize?: number,
  page?: number,
  search?: string,
  filters?: JobFilters
) => {
  return useQuery({
    queryKey: ["jobs", pageSize, page, search, filters],
    queryFn: () => fetchJobs(pageSize, page, search, filters),
  });
};

export { useJobs };
