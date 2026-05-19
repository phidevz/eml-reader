import { useQuery } from "@tanstack/react-query";
import { getFileTree } from "@/lib/api.ts";
import { getRouteApi } from "@tanstack/react-router";

const RootRoute = getRouteApi("__root__");

const queryKey = ["mails"] as const;

export const getQueryKey = () => queryKey;

export const useFileTree = () => {
  const loaderData = RootRoute.useLoaderData();

  console.log("X", loaderData)

  return useQuery({
    queryKey: getQueryKey(),
    networkMode: "online",
    throwOnError: false,
    queryFn: async () => await getFileTree(),
    initialData: loaderData,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 60 minutes
  });
};
