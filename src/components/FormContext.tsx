"use client";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

interface ListProps {
  children: ReactNode;
}

export default function FormContext({ children }: ListProps) {
  const methods = useForm({
    defaultValues: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      search: ''
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}
