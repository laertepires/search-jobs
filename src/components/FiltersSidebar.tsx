"use client";

import { useFormContext } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FormValues, JobFilters } from "@/types";
import { useJobs } from "@/hooks/useJobs";

const workplaceTypeLabels: Record<string, string> = {
  Remote: "Remoto",
  Hybrid: "Hibrido",
  "On-site": "Presencial",
};

function FilterSection({
  title,
  options,
  value,
  onToggle,
  emptyLabel,
  getLabel,
}: {
  title: string;
  options: string[];
  value: string[];
  onToggle: (option: string) => void;
  emptyLabel: string;
  getLabel?: (option: string) => string;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Typography>

      {options.length > 0 ? (
        <Stack sx={{ mt: 1 }}>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={value.includes(option)}
                  onChange={() => onToggle(option)}
                />
              }
              label={getLabel ? getLabel(option) : option}
              sx={{
                m: 0,
                ".MuiFormControlLabel-label": {
                  fontSize: 14,
                  color: "text.primary",
                },
              }}
            />
          ))}
        </Stack>
      ) : (
        <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: 14 }}>
          {emptyLabel}
        </Typography>
      )}
    </Box>
  );
}

export default function FiltersSidebar() {
  const { watch, setValue } = useFormContext<FormValues>();
  const search = watch("search");
  const filters = watch("filters");
  const { data } = useJobs(10, 1, search, filters);

  const availableFilters = data?.availableFilters ?? {
    companies: [],
    locations: [],
    workplaceTypes: [],
  };

  const toggleFilterValue = (
    key: keyof Pick<JobFilters, "companies" | "locations" | "workplaceTypes">,
    option: string
  ) => {
    const currentValues = filters[key];
    const nextValues = currentValues.includes(option)
      ? currentValues.filter((item) => item !== option)
      : [...currentValues, option];

    setValue(`filters.${key}`, nextValues, { shouldDirty: true });
    setValue("pagination.page", 1);
  };

  const clearFilters = () => {
    setValue("filters", {
      companies: [],
      locations: [],
      workplaceTypes: [],
      postedWithinDays: null,
    });
    setValue("pagination.page", 1);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          p: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Filtros
          </Typography>
          <Button
            variant="text"
            onClick={clearFilters}
            sx={{ minWidth: 0, fontWeight: 700 }}
          >
            Limpar
          </Button>
        </Stack>

        <Stack spacing={3}>
          <FilterSection
            title="EMPRESA"
            options={availableFilters.companies}
            value={filters.companies}
            onToggle={(option) => toggleFilterValue("companies", option)}
            emptyLabel="Nenhuma empresa encontrada para a busca atual."
          />

          <FilterSection
            title="LOCALIDADE"
            options={availableFilters.locations}
            value={filters.locations}
            onToggle={(option) => toggleFilterValue("locations", option)}
            emptyLabel="Nenhuma localidade encontrada para a busca atual."
          />

          <FilterSection
            title="MODELO DE TRABALHO"
            options={availableFilters.workplaceTypes}
            value={filters.workplaceTypes}
            onToggle={(option) => toggleFilterValue("workplaceTypes", option)}
            emptyLabel="Nenhum modelo de trabalho encontrado."
            getLabel={(option) => workplaceTypeLabels[option] || option}
          />

          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.8,
              }}
            >
              DATA DE PUBLICACAO
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={filters.postedWithinDays ?? 0}
              onChange={(_, value: number | null) => {
                setValue("filters.postedWithinDays", value || null, {
                  shouldDirty: true,
                });
                setValue("pagination.page", 1);
              }}
              sx={{
                mt: 1.5,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                ".MuiToggleButtonGroup-grouped": {
                  borderRadius: "8px !important",
                  border: "1px solid rgba(148, 163, 184, 0.3) !important",
                },
              }}
            >
              <ToggleButton value={1}>Hoje</ToggleButton>
              <ToggleButton value={7}>7 dias</ToggleButton>
              <ToggleButton value={30}>30 dias</ToggleButton>
              <ToggleButton value={0}>Todas</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Card>

      <Card
        sx={{
          borderRadius: 2,
          p: 3,
          border: "1px solid",
          borderColor: "rgba(25, 118, 210, 0.2)",
          backgroundColor: "rgba(25, 118, 210, 0.04)",
          boxShadow: "none",
        }}
      >
        <Typography sx={{ mb: 2, fontSize: 14, lineHeight: 1.6 }}>
          Receba avisos de novas vagas direto no Telegram.
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          href="https://t.me/JobPortalLaerteBot"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir bot
        </Button>
      </Card>
    </Stack>
  );
}
