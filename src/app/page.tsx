import { Box, Container, Link, Stack, Typography } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Search from "@/components/Search";
import JobList from "@/components/JobList";
import JobListPagination from "@/components/JobListPagination";
import FiltersSidebar from "@/components/FiltersSidebar";
import FormContext from "@/components/FormContext";

export default function Home() {
  return (
    <FormContext>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #F8FAFC 0%, #F5F7FB 48%, #F8FAFC 100%)",
        }}
      >
        <Search />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 5 }, py: 5 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={4}
            alignItems="flex-start"
          >
            <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0 }}>
              <FiltersSidebar />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <JobList />
              <JobListPagination />
            </Box>
          </Stack>
        </Container>

        <Box
          component="footer"
          sx={{
            mt: 8,
            px: { xs: 2, md: 5 },
            py: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
              JobPortal © 2026 • Desenvolvido por Laerte
            </Typography>
            <Stack
              direction="row"
              spacing={4}
              sx={{ color: "text.secondary", flexWrap: "wrap" }}
            >
              <Typography>Sobre nos</Typography>
              <Typography>Politica de Privacidade</Typography>
              <Typography>Termos de Uso</Typography>
              <Link
                href="https://www.linkedin.com/in/iamlaerteoliveira/"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
              >
                Contato
              </Link>
            </Stack>
            <Stack direction="row" spacing={1.5} color="text.secondary">
              <LanguageRoundedIcon />
              <HelpOutlineRoundedIcon />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </FormContext>
  );
}
