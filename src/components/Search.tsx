
"use client"
import { Autocomplete, Button, Grid2 as Grid, TextField } from "@mui/material";

export default function Search() {
  return (
    <>
      <Grid size={8}>
        <Autocomplete
          freeSolo
          id="filter"
          disableClearable
          options={[]}
          renderInput={(params) => (
            <TextField
              {...params}
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
        <Button sx={{ height: "100%", width: "100%"}} size="large" variant="contained">Achar vagas</Button>
      </Grid>
    </>
  );
}
