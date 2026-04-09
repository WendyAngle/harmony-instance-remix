import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, trendData, tasks, physicalDevices, virtualInstances, socialAccounts, proxyItems, alerts } from "@/data/mock-data";
import { Server, Cpu, CheckCircle, Users, Wifi, AlertTriangle, TrendingUp, Activity, Package, FileUp, Code } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const statCards = [
  { label: "在线设备", value: `${dashboardStats.onlineDevices}/${dashboardStats.totalDevices}`, icon: Server, color: "text-success" },
  { label: "活跃实例", value: `${dashboardStats.activeInstances}/${dashboardStats.totalInstances}`, icon: Cpu, color: "text-primary" },
  { label: "任务成功率", value: `${dashboardStats.taskSuccessRate}%`, icon: CheckCircle, color: "text-primary" },
  { label: "账号存活率", value: `${dashboardStats.accountSurvivalRate}%`, icon: Users, color: "text-success" },
  { label: "健康代理", value: `${dashboardStats.healthyProxies}/${dashboardStats.totalProxies}`, icon: Wifi, color: "text-primary" },
  { label: "待处理告警", value: `${dashboardStats.alertCount}`, icon: AlertTriangle, color: "text-warning" },
];

// Derived stats
const cloudInstances = virtualInstances.filter(v => v.type === "cloud");
const browserInstances = virtualInstances.filter(v => v.type === "windows");
const boardDevices = physicalDevices.filter(d => d.type === "board");
const windowsDevices = physicalDevices.filter(d => d.type === "windows");
const aliveAccounts = socialAccounts.filter(a => a.status === "alive").length;
const availableProxies = proxyItems.filter(p => p.status === "available").length;
const runningTasks = tasks.filter(t => t.status === "running").length;

const deviceTypePie = [
  { name: "ARM主板", value: boardDevices.length, color: "hsl(var(--primary))" },
  { name: "Windows主机", value: windowsDevices.length, color: "hsl(var(--warning))" },
];

const instanceTypePie = [
  { name: "云机实例", value: cloudInstances.length, color: "hsl(var(--primary))" },
  { name: "Windows虚拟机", value: browserInstances.length, color: "hsl(var(--success))" },
];

export default function Dashboard() {
  const recentTasks = tasks.slice(0, 4);
  const recentAlerts = alerts.filter(a => !a.read);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">控制台</h1>
        <p className="text-sm text-muted-foreground mt-1">Matrix Device 矩阵设备服务平台运营概览</p>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 资源概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">应用包</span>
            </div>
            <p className="text-xl font-bold">6</p>
            <p className="text-[11px] text-muted-foreground">5 活跃 · 1 废弃</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">托管文件</span>
            </div>
            <p className="text-xl font-bold">6</p>
            <p className="text-[11px] text-muted-foreground">2 图片 · 2 视频 · 2 其他</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">自动化脚本</span>
            </div>
            <p className="text-xl font-bold">6</p>
            <p className="text-[11px] text-muted-foreground">{runningTasks} 个任务运行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">账号状态</span>
            </div>
            <p className="text-xl font-bold">{aliveAccounts}/{socialAccounts.length}</p>
            <p className="text-[11px] text-muted-foreground">{availableProxies} 个代理可用</p>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图 + 分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              7日趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="devices" name="在线设备" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="instances" name="活跃实例" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tasks" name="执行任务" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">设备类型分布</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={deviceTypePie} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {deviceTypePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs">
                {deviceTypePie.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">实例类型分布</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={instanceTypePie} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                    {instanceTypePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs">
                {instanceTypePie.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 告警 + 最近任务 + 设备 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              最新告警
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.length === 0 && <p className="text-sm text-muted-foreground">暂无未读告警</p>}
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 text-xs">
                <Badge variant={alert.type === "error" ? "destructive" : "outline"} className="text-[10px] shrink-0 mt-0.5">
                  {alert.type === "error" ? "错误" : alert.type === "warning" ? "警告" : "信息"}
                </Badge>
                <div className="min-w-0">
                  <p className="leading-relaxed">{alert.message}</p>
                  <p className="text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">最近任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{task.name}</p>
                    <p className="text-xs text-muted-foreground">{task.scriptName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : task.status === "running" ? "secondary" : task.status === "failed" ? "destructive" : "outline"} className="text-[10px]">
                      {task.status === "completed" ? "完成" : task.status === "running" ? "运行中" : task.status === "failed" ? "失败" : "等待"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">设备状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {physicalDevices.slice(0, 4).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${device.status === "online" ? "bg-success" : device.status === "abnormal" ? "bg-destructive" : "bg-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">{device.id}</p>
                      <p className="text-xs text-muted-foreground">{device.type === "board" ? "ARM主板" : "Win主机"} · {device.server}</p>
                    </div>
                  </div>
                  <div className="text-xs text-right">
                    <p>插槽 {device.activeSlots}/{device.totalSlots}</p>
                    <p className="text-muted-foreground">CPU {device.cpu}% · {device.temperature}°C</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
