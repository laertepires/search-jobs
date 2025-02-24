import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { ReactNode } from "react";

interface ListProps {
  dehydratedState: DehydratedState;
  children: ReactNode;
}

export default function DehydratedComponent({
  dehydratedState,
  children,
}: ListProps) {
  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
