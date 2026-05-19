import { createFileRoute } from "@tanstack/react-router";
import { Main } from "@/components/Main.tsx";
import { NoMailSelected } from "@/components/NoMailSelected.tsx";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <Main>
      <NoMailSelected />
    </Main>
  );
}
