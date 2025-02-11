/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Grid2 as Grid, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import Link from "next/link";

export default async function JobList() {
  console.log("JobList here");

  const url = "https://api.inhire.app/job-posts/public/pages";

  const { data } = await axios.get(url, {
    headers: {
      "X-Tenant": "lyncas ",
    },
  });

  console.log("data => ", data);

  return (
    <>
      <Grid size={12}>
        {data?.jobsPage?.map((result: any) => (
          <Link
            key={result.jobId}
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                my: 2,
                "&.MuiCard-root:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <CardContent>
                <Typography sx={{ color: "text.primary" }}>
                  {result.displayName} <br />
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ fontSize: 10, mt: 2 }}
                  >
                    Postado hoje
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Grid>
    </>
  );
}
