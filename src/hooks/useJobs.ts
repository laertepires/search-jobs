import { useQuery } from "@tanstack/react-query";

export const fetchJobs = async (pageSize = 10, page = 1, search = ''): Promise<any> => {
  const res = await fetch(`/api/jobs?pageSize=${pageSize}&page=${page}&search=${search}`);
  return res.json();
};

const useJobs = (pageSize?: number, page?: number, search?: string) => {
  return useQuery({
    queryKey: ["jobs", pageSize, page, search],
    queryFn: () => fetchJobs(pageSize, page, search),
  });
};

export { useJobs };
