// types.ts

import { DehydratedState } from "@tanstack/react-query";

export type PaginationData = {
  page?: number;
  limit?: number;
};

export interface FormValues {
  search: string;
}

export interface DehydratedProps {
  dehydratedState: DehydratedState;
}

export interface Job {
  jobId: string;
  displayName: string;
  location: string;
  workplaceType: string;
  link: string;
  published: boolean;
  XTenant: string | null;
  createdAt: Date;
  tenantName: string;
}

export interface PaginatedJobsResponse {
  paginatedResults: Job[];
  totalCount: number;
  page: number;
  pageSize: number;
}

