import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./pages/_app";
import { Box, Grid2 as Grid } from "@mui/material";
import Search from "@/components/Search";
import JobList from "@/components/JobList";

const Page: NextPageWithLayout = () => {
  console.log("page here")
  return (
    <>
    <Box sx={{ bgcolor: "primary.main", height: "35px", width: "100%"}}></Box>
    <Grid container sx={{ m: 5 }} justifyContent="center">
      <Grid container maxWidth="sm" size={12} spacing={2}>
        <Search />
        <JobList/>
      </Grid>
    </Grid>
    </>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Page;
