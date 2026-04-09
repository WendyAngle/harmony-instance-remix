import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Server, Cpu, AlertTriangle, User } from "lucide-react";
import { dashboardStats, alerts } from "@/data/mock-data";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-4 shrink-0">
      <SidebarTrigger className="shrink-0" />

      {/* 全局状态指标 */}
      <div className="hidden md:flex items-center gap-4 ml-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Server className="h-3.5 w-3.5 text-success" />
          <span className="text-muted-foreground">在线设备</span>
          <span className="font-semibold">{dashboardStats.onlineDevices}/{dashboardStats.totalDevices}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">活跃实例</span>
          <span className="font-semibold">{dashboardStats.activeInstances}/{dashboardStats.totalInstances}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="text-muted-foreground">告警</span>
          <span className="font-semibold">{dashboardStats.alertCount}</span>
        </div>
      </div>

      {/* 搜索 */}
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索设备 / 账号 / IP / 应用..."
            className="h-8 pl-8 text-xs bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 通知 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-3 border-b">
            <h4 className="text-sm font-semibold">通知中心</h4>
          </div>
          <div className="max-h-64 overflow-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className={`px-3 py-2.5 border-b last:border-0 text-xs ${!alert.read ? "bg-accent/30" : ""}`}>
                <div className="flex items-start gap-2">
                  <Badge variant={alert.type === "error" ? "destructive" : alert.type === "warning" ? "outline" : "secondary"} className="text-[10px] shrink-0 mt-0.5">
                    {alert.type === "error" ? "错误" : alert.type === "warning" ? "警告" : "信息"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground leading-relaxed">{alert.message}</p>
                    <p className="text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* 用户 */}
      <div className="flex items-center gap-2 pl-2 border-l">
        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-medium hidden lg:inline">管理员</span>
      </div>
    </header>
  );
}
