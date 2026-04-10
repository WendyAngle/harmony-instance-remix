import {
  Server, Cpu, Smartphone, Database,
  Users, Wifi,
  Code, Play, LayoutDashboard, HardDrive,
  Package, FileUp, CloudCog, ClipboardList, CircuitBoard, Tag, Network
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuGroups = [
  {
    label: "总览",
    items: [
      { title: "控制台", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "设备资源中台",
    items: [
      { title: "主机管理", url: "/devices/servers", icon: Database },
      // { title: "物理设备管理", url: "/devices/physical", icon: Server },
      { title: "ARM板卡", url: "/devices/boardcards", icon: CircuitBoard },
    ],
  },
  {
    label: "云资源中台",
    items: [
      { title: "虚拟机管理", url: "/devices/virtual", icon: Cpu },
      { title: "镜像文件", url: "/devices/images", icon: HardDrive },
      { title: "镜像实例", url: "/devices/clouddrive", icon: CloudCog },
      { title: "标签管理", url: "/devices/tags", icon: Tag },
    ],
  },
  {
    label: "账号与身份中台",
    items: [
      { title: "账号管理", url: "/accounts", icon: Users },
    ],
  },
  {
    label: "网络代理中台",
    items: [
      { title: "IP池管理", url: "/proxy/pool", icon: Wifi },
    ],
  },
  {
    label: "系统管理",
    items: [
      { title: "应用管理", url: "/apps/manage", icon: Package },
      { title: "文件上传", url: "/apps/files", icon: FileUp },
      { title: "脚本仓库", url: "/scripts/hub", icon: Code },
      // { title: "任务编排", url: "/scripts/tasks", icon: Play },
    ],
  },
  {
    label: "运维管理",
    items: [
      { title: "任务管理", url: "/ops/tasks", icon: ClipboardList },
      // { title: "节点管理", url: "/ops/nodes", icon: Network },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {collapsed ? (
            <div className="flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-sidebar-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Smartphone className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-sidebar-accent-foreground">Matrix Device</h1>
                <p className="text-[10px] text-sidebar-foreground">矩阵设备服务平台</p>
              </div>
            </div>
          )}
        </div>

        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
              {!collapsed && group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
