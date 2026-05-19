import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useFileTree } from "@/hooks/useFileTree.ts";
import { cn } from "@/lib/utils.ts";

export default function Footer() {
  const { isFetching } = useFileTree();

  return (
    <footer className="text-muted-foreground text-sm">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          {/*FIXME x.cacheStatus.isCached ? x.cacheStatus.timestamp : "not loaded"*/}
        </div>
        <Button
          size="icon"
          className={cn("size-8 group-data-[collapsible=icon]:opacity-0", {
            "animate-spin": isFetching,
          })}
          variant="ghost"
          disabled={isFetching}
        >
          <RefreshCwIcon />
          <span className="sr-only">Refetch files</span>
        </Button>
      </div>
    </footer>
  );
}
