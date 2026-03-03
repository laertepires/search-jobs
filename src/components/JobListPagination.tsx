"use client";

import { useJobs } from "@/hooks/useJobs";
import { DehydratedProps, FormValues } from "@/types";
import { Box, Pagination, Typography } from "@mui/material";
import DehydratedComponent from "./DehydratedComponent";
import { useFormContext } from "react-hook-form";

export default function JobListPagination({
  dehydratedState,
}: DehydratedProps) {
  const { watch, setValue } = useFormContext<FormValues>();
  const pagination = watch("pagination");
  const search = watch("search");
  const filters = watch("filters");
  const { data, isLoading, isFetching } = useJobs(
    pagination.pageSize,
    pagination.page,
    search,
    filters
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setValue("pagination.page", newPage);
  };

  if (isLoading || !data?.totalCount) {
    return null;
  }

  return (
    <DehydratedComponent dehydratedState={dehydratedState}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mt: 5,
        }}
      >
        {isFetching ? (
          <Typography color="text.secondary">Atualizando resultados...</Typography>
        ) : null}

        <Pagination
          page={data.page}
          onChange={handlePageChange}
          count={Math.ceil(data.totalCount / data.pageSize)}
          color="primary"
          shape="rounded"
          size="large"
          siblingCount={1}
          sx={{
            ".MuiPaginationItem-root": {
              borderRadius: 2,
              minWidth: 44,
              height: 44,
            },
          }}
        />
      </Box>
    </DehydratedComponent>
  );
}
