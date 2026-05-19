import { useQuery } from "@tanstack/react-query";
import { getEmail } from "@/lib/api.ts";
import { getRouteApi } from "@tanstack/react-router";

const ViewRoute = getRouteApi("/view/$path");

export const getQueryKey = (path: string) => ["mail", path] as const;

export const useMail = () => {
  const { path: mailPath } = ViewRoute.useParams();
  const loaderData = ViewRoute.useLoaderData();

  return useQuery({
    queryKey: getQueryKey(mailPath),
    networkMode: "online",
    throwOnError: false,
    queryFn: async ({ queryKey: [, path] }) =>
      await getEmail({ data: { path } }),
    initialData: loaderData,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 60 minutes
  });
};
