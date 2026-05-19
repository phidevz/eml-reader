import { AArrowDownIcon, MailIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Footer from "@/components/Footer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MailFileTree } from "@/components/MailFileTree.tsx";

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b">
        <div className="px-2 py-0 flex flex-row gap-2">
          <MailIcon role="display" />
          <h1>EML Browser</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup style={{ display: "none" }}>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <AArrowDownIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  className="size-8 group-data-[collapsible=icon]:opacity-0"
                  variant="outline"
                >
                  <MailIcon />
                  <span className="sr-only">Inbox</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <MailFileTree />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Footer />
      </SidebarFooter>
    </Sidebar>
  );
}
