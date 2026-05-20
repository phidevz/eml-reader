import {RefreshCwIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useFileTree} from "@/hooks/useFileTree.ts";
import {ClientOnly} from "@tanstack/react-router";
import {AgeDisplay} from "@/components/AgeDisplay.tsx";

export default function Footer() {
    const {data, isFetching, refetch} = useFileTree();

    return (
        <footer className="text-muted-foreground text-sm">
            <div
                className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                <div>
                    <ClientOnly fallback={"not loaded"}>
                        {!!data ? <AgeDisplay timestamp={data?.timestamp}/> : "not loaded"}
                    </ClientOnly>
                </div>
                <Button
                    size="icon"
                    className="size-8 group-data-[collapsible=icon]:opacity-0"
                    variant="ghost"
                    loading={isFetching}
                    onClick={async () => {
                        await refetch();
                    }}
                >
                    <RefreshCwIcon/>
                    <span className="sr-only">Refetch files</span>
                </Button>
            </div>
        </footer>
    );
}
