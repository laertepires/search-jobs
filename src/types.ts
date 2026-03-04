// types.ts

import { DehydratedState } from "@tanstack/react-query";

export type PaginationData = {
  page?: number;
  limit?: number;
};

export interface JobFilters {
  companies: string[];
  locations: string[];
  workplaceTypes: string[];
  postedWithinDays: number | null;
}

export interface FormValues {
  search: string;
  searchInput: string;
  filters: JobFilters;
  pagination: {
    page: number;
    pageSize: number;
  };
}

export interface DehydratedProps {
  dehydratedState?: DehydratedState;
}

export interface Job {
  jobId: string;
  displayName: string;
  location: string;
  workplaceType: string;
  link: string;
  published: boolean;
  XTenant: string | null;
  sourcePublishedAt?: Date | string | null;
  createdAt: Date;
  tenantName: string;
}

export interface PaginatedJobsResponse {
  paginatedResults: Job[];
  totalCount: number;
  page: number;
  pageSize: number;
  availableFilters: {
    companies: string[];
    locations: string[];
    workplaceTypes: string[];
  };
}

