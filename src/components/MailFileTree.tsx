import type { FileTreeNode } from "@/lib/mailfs.server.ts";
import { type TreeDataItem, TreeView } from "@/components/ui/tree-view.tsx";
import { useMemo } from "react";
import { FolderIcon, MailIcon, MailOpenIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useFileTree } from "@/hooks/useFileTree.ts";

export type UseMailQueryParams = {
  forceUpdate?: boolean;
};

function buildTree(node: FileTreeNode): TreeDataItem {
  if (node.isFile) {
    return {
      id: node.path,
      name: node.name,
      draggable: false,
      droppable: false,
      icon: MailIcon,
      selectedIcon: MailOpenIcon,
    } satisfies TreeDataItem;
  }

  return {
    id: node.path,
    name: node.name,
    draggable: false,
    droppable: false,
    icon: FolderIcon,
    disabled: true,
    children: node.children!.map(buildTree),
  } satisfies TreeDataItem;
}

export function MailFileTree() {
  const navigate = useNavigate();

  const query = useFileTree();

  const transformedData = useMemo(() => {
    if (!query.data) {
      return [];
    }

    return buildTree({
      isFile: false,
      path: "/",
      name: "/",
      children: query.data,
    });
  }, [query.data]);

  if (query.isLoading) {
    return "fetching data";
  }

  if (query.isError) {
    return "failed to fetch. retry?";
  }

  if (query.isPending) {
    return "fetching again";
  }

  return (
    <TreeView
      className="p-0"
      data={transformedData}
      expandAll
      onSelectChange={(selection) => {
        if (!selection) {
          void navigate({ to: "/" });
        } else if (selection.id.endsWith("/")) {
          return;
        } else {
          void navigate({ to: "/view/$path", params: { path: selection.id } });
        }
      }}
    />
  );
}
