"use client";
import { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormValues } from "@/types";

interface ListProps {
  children: ReactNode;
}

export default function FormContext({ children }: ListProps) {
  const methods = useForm<FormValues>({
    defaultValues: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      search: "",
      searchInput: "",
      filters: {
        companies: [],
        locations: [],
        workplaceTypes: [],
        postedWithinDays: null,
      },
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}
