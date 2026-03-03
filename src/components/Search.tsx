"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { FormValues } from "@/types";

export default function Search() {
  const { control, handleSubmit, setValue } = useFormContext<FormValues>();

  const onSubmit = handleSubmit((values) => {
    setValue("search", values.searchInput.trim());
    setValue("pagination.page", 1);
  });

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(14px)",
        backgroundColor: "rgba(248, 250, 252, 0.88)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        component="form"
        onSubmit={onSubmit}
        sx={{
          minHeight: { xs: 88, md: 90 },
          px: { xs: 2, md: 5 },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              backgroundColor: "primary.main",
            }}
          >
            <WorkOutlineRoundedIcon />
          </Avatar>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: -0.6,
            }}
          >
            JobPortal
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            flex: 1,
            maxWidth: 980,
            justifyContent: "flex-end",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              maxWidth: 620,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: "#EEF2F6",
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", mr: 1.5 }} />
            <Controller
              name="searchInput"
              control={control}
              render={({ field }) => (
                <InputBase
                  {...field}
                  placeholder="Cargo ou empresa"
                  sx={{
                    flex: 1,
                    fontSize: 16,
                    color: "text.primary",
                  }}
                />
              )}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ px: 4, py: 1.25, whiteSpace: "nowrap", fontSize: 14 }}
          >
            Achar vagas
          </Button>

          <IconButton sx={{ display: { xs: "none", md: "inline-flex" } }}>
            <NotificationsNoneRoundedIcon />
          </IconButton>
          <IconButton sx={{ display: { xs: "none", md: "inline-flex" } }}>
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
