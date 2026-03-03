"use client";

import {
  Box,
  Button,
  CircularProgress,
  Card,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { useJobs } from "@/hooks/useJobs";
import { formatDate } from "@/utils/utils";
import DehydratedComponent from "./DehydratedComponent";
import { DehydratedProps, FormValues, Job } from "@/types";
import { useFormContext } from "react-hook-form";

const workplaceTypeLabels: Record<string, string> = {
  Remote: "Remoto",
  Hybrid: "Hibrido",
  "On-site": "Presencial",
};

function buildTags(job: Job) {
  const titleTags = job.displayName
    .split(" ")
    .filter((word) => word.length > 4)
    .slice(0, 2);

  return [job.tenantName, ...titleTags].filter(Boolean) as string[];
}

export default function JobList({ dehydratedState }: DehydratedProps) {
  const { watch } = useFormContext<FormValues>();
  const pagination = watch("pagination");
  const search = watch("search");
  const filters = watch("filters");
  const { data, isLoading, isFetching } = useJobs(
    pagination.pageSize,
    pagination.page,
    search,
    filters
  );

  if (isLoading) {
    return (
      <Card sx={{ p: 4, borderRadius: 4 }}>
        <Typography color="text.secondary">Carregando vagas...</Typography>
      </Card>
    );
  }

  return (
    <DehydratedComponent dehydratedState={dehydratedState}>
      <Box sx={{ position: "relative" }}>
        {isFetching ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(248, 250, 252, 0.72)",
              backdropFilter: "blur(1px)",
              borderRadius: 2,
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={28} />
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                Atualizando vagas...
              </Typography>
            </Stack>
          </Box>
        ) : null}

        <Stack spacing={3} sx={{ opacity: isFetching ? 0.55 : 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8 }}>
            Vagas encontradas ({data?.totalCount || 0})
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 15 }}>
            Ordenar por:{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
              Mais recentes
            </Box>
          </Typography>
        </Stack>

        {data?.paginatedResults?.length ? (
          data.paginatedResults.map((result: Job) => {
            const tags = buildTags(result);

            return (
              <Card
                key={result.jobId}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Stack spacing={3}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1.5,
                          backgroundColor: "#EEF2F6",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ApartmentRoundedIcon fontSize="large" />
                      </Box>

                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 800, letterSpacing: -0.4 }}
                        >
                          {result.displayName}
                        </Typography>
                        <Typography
                          sx={{ mt: 0.5, color: "text.secondary", fontSize: 15 }}
                        >
                          {result.tenantName || "Empresa confidencial"}
                        </Typography>
                      </Box>
                    </Stack>

                    <BookmarkBorderRoundedIcon sx={{ color: "text.secondary" }} />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2.5}
                    divider={
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: "none", md: "block" } }}
                      />
                    }
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FmdGoodOutlinedIcon sx={{ color: "text.secondary" }} />
                      <Typography color="text.secondary">
                        {result.location || "Local nao informado"}
                      </Typography>
                    </Stack>

                    <Typography color="text.secondary">
                      {workplaceTypeLabels[result.workplaceType] ||
                        result.workplaceType ||
                        "Modelo nao informado"}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleRoundedIcon sx={{ color: "text.secondary" }} />
                      <Typography color="text.secondary">
                        Postado {formatDate(result.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {tags.map((tag) => (
                        <Chip
                          key={`${result.jobId}-${tag}`}
                          label={tag}
                          sx={{
                            backgroundColor: "#EEF2F6",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Stack>

                    <Link
                      href={result.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                    >
                      <Button variant="text" sx={{ fontWeight: 800 }}>
                        Ver detalhes
                      </Button>
                    </Link>
                  </Stack>
                </Stack>
              </Card>
            );
          })
        ) : (
          <Card sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nenhuma vaga encontrada
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              Ajuste os filtros ou tente buscar outro cargo ou empresa.
            </Typography>
          </Card>
        )}
        </Stack>
      </Box>
    </DehydratedComponent>
  );
}
