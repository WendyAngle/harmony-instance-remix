import { useState } from "react";
import {
  Cpu, Database, Wifi, Code, LayoutDashboard, HardDrive,
  Package, FileUp, CloudCog, CircuitBoard, Tag, Cloud,
  Monitor, Server, MonitorPlay, Settings, ChevronDown, Rocket, CloudUpload,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type Group = { label: string; icon: React.ComponentType<{ className?: string }>; items: Item[] };

const topItems: Item[] = [
  { title: "控制台", url: "/", icon: LayoutDashboard },
  { title: "新控制台", url: "/new-dashboard", icon: LayoutDashboard },
  { title: "落地页", url: "/landing", icon: Rocket },
];

const groups: Group[] = [
  {
    label: "云资源管理", icon: Monitor,
    items: [
      { title: "虚拟机管理", url: "/devices/virtual", icon: Cpu },
      { title: "镜像实例", url: "/devices/clouddrive", icon: CloudCog },
      { title: "IP池管理", url: "/proxy/pool", icon: Wifi },
      { title: "代理会话", url: "/proxy/sessions", icon: Wifi },
      { title: "VNC会话", url: "/vnc/sessions", icon: MonitorPlay },
    ],
  },
  {
    label: "设备资源管理", icon: Server,
    items: [
      { title: "主机管理", url: "/devices/servers", icon: Database },
      { title: "ARM板卡", url: "/devices/boardcards", icon: CircuitBoard },
      { title: "服务节点", url: "/devices/nodes", icon: Server },
    ],
  },
  {
    label: "系统管理", icon: Settings,
    items: [
      { title: "标签管理", url: "/devices/tags", icon: Tag },
      { title: "应用管理", url: "/apps/manage", icon: Package },
      { title: "云存储配置", url: "/system/storage", icon: CloudUpload },
      { title: "文件上传", url: "/apps/files", icon: FileUp },
      { title: "脚本仓库", url: "/scripts/hub", icon: Code },
      { title: "镜像文件", url: "/devices/images", icon: HardDrive },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => {
      init[g.label] = g.items.some((i) => pathname.startsWith(i.url)) || g.label !== "系统管理";
    });
    return init;
  });

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const linkClass = (active: boolean) =>
    `relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-r before:bg-primary"
        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
    }`;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Brand */}
        <div className={`px-4 pt-5 pb-4 border-b border-sidebar-border/60 ${collapsed ? "px-2" : ""}`}>
          {collapsed ? (
            <div className="flex items-center justify-center">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Cloud className="h-6 w-6 text-primary" />
              <h1 className="text-base font-bold text-sidebar-accent-foreground">云机矩阵平台</h1>
            </div>
          )}
        </div>

        <div className="px-2 py-3 space-y-1">
          {/* Top-level items */}
          <SidebarMenu>
            {topItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className={linkClass(isActive(item.url))}
                    activeClassName=""
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Collapsible groups */}
          {groups.map((g) => {
            const open = openMap[g.label];
            return (
              <Collapsible
                key={g.label}
                open={collapsed ? true : open}
                onOpenChange={(v) => setOpenMap((m) => ({ ...m, [g.label]: v }))}
              >
                {!collapsed && (
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60">
                    <span className="flex items-center gap-2">
                      <g.icon className="h-4 w-4" />
                      {g.label}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent className={!collapsed ? "pl-4 mt-0.5" : ""}>
                  <SidebarMenu>
                    {g.items.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={linkClass(isActive(item.url))}
                            activeClassName=""
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
