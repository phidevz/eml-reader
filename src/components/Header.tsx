import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { Separator } from "./ui/separator";
import { Button, LinkButton } from "@/components/ui/button.tsx";
import { Download, RefreshCw } from "lucide-react";
import type { ParsedEmail } from "@/lib/api.ts";

export type HeaderProps = { currentEmail?: ParsedEmail | null | undefined };

export function Header(props: HeaderProps) {
  const { currentEmail } = props;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 pl-4 pr-2 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h2 className="text-base font-medium">
          {!!currentEmail
            ? (currentEmail.subject ?? "(No subject)")
            : "No mail selected"}
        </h2>
        {!!currentEmail ? (
          <div className="ml-auto flex items-center gap-2">
            <LinkButton
              variant="outline"
              href={`/api/${encodeURIComponent(currentEmail.pathOnDisk)}`}
              download={`${currentEmail.subject || "email"}.eml`}
              className="inline-flex items-center gap-2 text-sm text-secondary-foreground"
            >
              <Download className="w-4 h-4" />
              EML
            </LinkButton>
            <Button
              variant="outline"
              className="text-secondary-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="sr-only">Refresh email</span>
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
