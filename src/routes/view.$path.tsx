import {createFileRoute} from "@tanstack/react-router";
import {EmailViewer} from "@/components/EmailViewer.tsx";
import {Main} from "@/components/Main.tsx";
import {getEmail} from "@/lib/api.ts";
import {NoMailSelected} from "@/components/NoMailSelected.tsx";
import {ErrorComponent} from "@/components/ErrorComponent.tsx";
import {Button, LinkButton} from "@/components/ui/button.tsx";
import {Download, RefreshCw} from "lucide-react";
import {useMail} from "@/hooks/useMail.ts";

export const Route = createFileRoute("/view/$path")({
    loader: async ({params}) => {
        if (params.path.endsWith("/")) {
            return null;
        }

        return await getEmail({data: params});
    },
    component: RouteComponent,
    errorComponent: ErrorComponent
});

function RouteComponent() {
    const {path} = Route.useParams();
    const currentEmail = Route.useLoaderData();
    const query = useMail();

    if (path.endsWith("/")) {
        return (
            <Main>
                <NoMailSelected/>
            </Main>
        );
    }

    return (
        <Main
            heading={!!currentEmail ? currentEmail.subject ?? "(No subject)" : undefined}
            buttonSlot={!!currentEmail ? (
                <div className="ml-auto flex items-center gap-2">
                    <LinkButton
                        variant="outline"
                        href={`/api/${encodeURIComponent(currentEmail.pathOnDisk)}`}
                        download={`${currentEmail.subject || "email"}.eml`}
                        disabled={query.isFetching}
                        className="inline-flex items-center gap-2 text-sm text-secondary-foreground"
                    >
                        <Download className="w-4 h-4"/>
                        EML
                    </LinkButton>
                    <Button
                        variant="outline"
                        className="text-secondary-foreground"
                        loading={query.isFetching}
                        onClick={() => {
                            query.refetch()
                        }}
                    >
                        <RefreshCw className="w-4 h-4"/>
                        <span className="sr-only">Refresh email</span>
                    </Button>
                </div>
            ) : undefined}>
            <EmailViewer emailPath={path}/>
        </Main>
    );
}
