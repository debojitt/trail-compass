import { createFileRoute } from "@tanstack/react-router";
import { TransportPage } from "@/components/site/TransportPage";

export const Route = createFileRoute("/cabs")({
  head: () => ({
    meta: [
      { title: "Cabs · NORTHNEST" },
      { name: "description", content: "Fixed-price demo cab transfers across Northeast India." },
    ],
  }),
  component: () => <TransportPage mode="cabs" />,
});
