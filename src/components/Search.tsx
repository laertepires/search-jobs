"use client";
import { FormValues } from "@/types";
import { Autocomplete, Button, Grid2 as Grid, TextField } from "@mui/material";
import { SubmitHandler, useForm, useFormContext } from "react-hook-form";

export default function Search() {
  const { setValue } = useFormContext();
  const { register, handleSubmit } = useForm<any>();
  const onSubmit: SubmitHandler<FormValues> = (data) =>
    setValue("search", data.search);

  return (
    <form
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid spacing={2} size={12} container>
        <Grid  size={8}>
          <Autocomplete
            freeSolo
            id="filter"
            disableClearable
            options={["React", "Angular", "Front-end", "Back-end"]}
            renderInput={(params) => (
              <TextField
                {...params}
                {...register("search")}
                label="Cargo ou empresa"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    type: "search",
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={4}>
          <Button
            sx={{ height: "100%", width: "100%" }}
            size="large"
            variant="contained"
            type="submit"
          >
            Achar vagas
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
