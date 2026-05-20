import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "./ui/separator";
import type {ReactNode} from "react";

export type HeaderProps = { heading?: string; buttonSlot?: ReactNode };

export function Header(props: HeaderProps) {
    const {heading, buttonSlot} = props;

    return (
        <header
            className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 pl-4 pr-2 lg:gap-2">
                <SidebarTrigger className="-ml-1"/>
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h2 className="text-base font-medium">
                    {heading ?? "No mail selected"}
                </h2>
                {buttonSlot ?? null}
            </div>
        </header>
    );
}
