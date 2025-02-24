"use client";

import {
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  Link,
  Typography,
} from "@mui/material";
import { useJobs } from "@/hooks/useJobs";
import { formatDate } from "@/utils/utils";
import DehydratedComponent from "./DehydratedComponent";
import { DehydratedProps, Job } from "@/types";
import { useFormContext } from "react-hook-form";

export default function JobList({ dehydratedState }: DehydratedProps) {
  const { watch } = useFormContext();
  const { pagination, search } = watch();
  const { data, isLoading } = useJobs(pagination.pageSize, pagination.page, search);

  if (isLoading) return <p>Carregando...</p>;

  return (
    <DehydratedComponent dehydratedState={dehydratedState}>
      <Grid sx={{ width: "100%", textAlign: "right", mt: 2 }} size={4}>
        <Typography
          variant="body1"
          component="span"
          sx={{ fontSize: 10, textAlign: "right" }}
        >
          {data?.totalCount} encontrados
        </Typography>
      </Grid>
      <Grid size={12}>
        {data?.paginatedResults?.map((result: Job) => (
          <Link
            key={result.jobId}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                my: 2,
                pr: 2,
                position: "relative",
                "&.MuiCard-root:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <CardContent>
                <Chip
                  variant="outlined"
                  sx={{ position: "absolute", right: 8, top: 8 }}
                  label={result.workplaceType}
                />

                <Typography sx={{ color: "text.primary" }}>
                  {result.displayName} <br />
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ fontSize: 10, mt: 2 }}
                  >
                    By {result.tenantName} - Postado{" "}
                    {formatDate(result.createdAt)}
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Grid>
    </DehydratedComponent>
  );
}
