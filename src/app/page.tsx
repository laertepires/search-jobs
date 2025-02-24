import { Box, Grid2 as Grid } from "@mui/material";
import Search from "@/components/Search";
import JobList from "@/components/JobList";
import JobListPagination from "@/components/JobListPagination";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchJobs } from "@/hooks/useJobs";
import FormContext from "@/components/FormContext";

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["jobs", 10, 1, ''],
    queryFn: () => fetchJobs(10, 1, ''),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", height: "35px", width: "100%" }} />
      <Grid container sx={{ m: 5 }} justifyContent="center">
        <Grid  size={12} maxWidth="sm" className="teste 123" spacing={2}>
          <FormContext>
            <Search />
            <JobList dehydratedState={dehydratedState} />
            <JobListPagination dehydratedState={dehydratedState} />
          </FormContext>
        </Grid>
      </Grid>
    </>
  );
}
