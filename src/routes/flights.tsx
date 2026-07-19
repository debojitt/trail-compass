import { createFileRoute } from "@tanstack/react-router";
import { TransportPage } from "@/components/site/TransportPage";

export const Route = createFileRoute("/flights")({
  head: () => ({
    meta: [
      { title: "Flights · NORTHNEST" },
      { name: "description", content: "Demo flight fares into and across Northeast India." },
    ],
  }),
  component: () => <TransportPage mode="flights" />,
});
