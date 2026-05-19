import type { PropsWithChildren } from "react";
import { SidebarInset } from "@/components/ui/sidebar.tsx";
import { Header, type HeaderProps } from "@/components/Header.tsx";

export function Main(props: PropsWithChildren<HeaderProps>) {
  const { children, ...headerProps } = props;
  return (
    <SidebarInset>
      <Header {...headerProps} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </div>
      </div>
    </SidebarInset>
  );
}
