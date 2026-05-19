import { createFileRoute } from "@tanstack/react-router";
import { EmailViewer } from "@/components/EmailViewer.tsx";
import { Main } from "@/components/Main.tsx";
import { getEmail } from "@/lib/api.ts";
import { NoMailSelected } from "@/components/NoMailSelected.tsx";

export const Route = createFileRoute("/view/$path")({
  loader: async ({ params }) => {
    if (params.path.endsWith("/")) {
      return null;
    }

    return await getEmail({ data: params });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { path } = Route.useParams();
  const data = Route.useLoaderData();

  if (path.endsWith("/")) {
    return (
      <Main>
        <NoMailSelected />
      </Main>
    );
  }

  return (
    <Main currentEmail={data}>
      <EmailViewer emailPath={path} />
    </Main>
  );
}
