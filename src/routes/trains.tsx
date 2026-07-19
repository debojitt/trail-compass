import { createFileRoute } from "@tanstack/react-router";
import { TransportPage } from "@/components/site/TransportPage";

export const Route = createFileRoute("/trains")({
  head: () => ({
    meta: [
      { title: "Trains · NORTHNEST" },
      { name: "description", content: "Demo rail routes into Northeast India." },
    ],
  }),
  component: () => <TransportPage mode="trains" />,
});
