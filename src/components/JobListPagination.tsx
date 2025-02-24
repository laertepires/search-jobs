"use client";
import { useJobs } from "@/hooks/useJobs";
import { DehydratedProps } from "@/types";
import { Grid2 as Grid, Pagination } from "@mui/material";
import DehydratedComponent from "./DehydratedComponent";
import { useFormContext } from "react-hook-form";

export default function JobListPagination({
  dehydratedState,
}: DehydratedProps) {
  const { watch, setValue } = useFormContext();
  const { pagination, search } = watch();
  const { data, isLoading, isFetching } = useJobs(pagination.pageSize, pagination.page, search);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setValue("pagination.page", newPage);
  };

  if (isLoading || !data?.totalCount) return <></>;
  return (
    <DehydratedComponent dehydratedState={dehydratedState}>
      <Grid size={12}>
        {isFetching && <p>Atualizando dados...</p>}

        <Pagination
          page={data?.page}
          onChange={handlePageChange}
          count={ Math.ceil(data?.totalCount/10)}
        />
      </Grid>
    </DehydratedComponent>
  );
}
