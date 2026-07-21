import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import {
  hostServers,
  virtualInstances,
  proxyItems,
  romImages,
  tasks,
  scripts,
  type HostServer,
} from "@/data/mock-data";
import {
  Server,
  Cpu,
  Globe,
  Shield,
  Package,
  HardDrive,
  ArrowUp,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

/* ── derived stats ── */
const onlineServers = hostServers.filter((s) => s.status === "online").length;
const totalServers = hostServers.length;

const cloudInstances = virtualInstances.filter((v) => v.type === "cloud");
const mountedCloud = cloudInstances.filter((v) => v.status === "running").length;

const browserInstances = virtualInstances.filter((v) => v.type === "windows");
const mountedBrowser = browserInstances.filter((v) => v.status === "running").length;

const healthyProxies = proxyItems.filter((p) => p.status === "available").length;
const totalProxies = proxyItems.length;

const totalImages = romImages.length;
const activeApps = scripts.filter((s) => s.status === "active").length;
const deprecatedApps = scripts.filter((s) => s.status === "deprecated").length;

const armServers = hostServers.filter((s) => s.type === "arm").length;
const x86Servers = hostServers.filter((s) => s.type === "x86").length;

const serverPie = [
  { name: "ARM服务器", value: armServers, color: "#3B82F6" },
  { name: "X86服务器", value: x86Servers, color: "#22C55E" },
];

const instancePie = [
  { name: "云机实例", value: cloudInstances.length, color: "#3B82F6" },
  { name: "指纹浏览器", value: browserInstances.length, color: "#F59E0B" },
];

const recentTasks = tasks.slice(0, 4);

/* ── stat card config ── */
const statCards = [
  {
    label: "服务器状态",
    value: `${onlineServers}/${totalServers}`,
    unit: "台",
    sub: "在线/总数",
    icon: Server,
    iconBg: "bg-blue-500",
  },
  {
    label: "云机实例",
    value: `${mountedCloud}/${cloudInstances.length}`,
    unit: "",
    sub: "已挂载/总数",
    icon: Cpu,
    iconBg: "bg-emerald-500",
    trend: true,
  },
  {
    label: "指纹浏览器",
    value: `${mountedBrowser}/${browserInstances.length}`,
    unit: "",
    sub: "使用中/总数",
    icon: Globe,
    iconBg: "bg-orange-500",
    trend: true,
  },
  {
    label: "健康代理",
    value: `${healthyProxies}/${totalProxies}`,
    unit: "",
    sub: "健康/总数",
    icon: Shield,
    iconBg: "bg-indigo-500",
    trend: true,
  },
  {
    label: "应用包",
    value: `${activeApps + deprecatedApps}`,
    unit: "",
    sub: `${activeApps} 活跃 · ${deprecatedApps} 废弃`,
    icon: Package,
    iconBg: "bg-rose-500",
    trend: true,
  },
  {
    label: "镜像文件",
    value: `${totalImages}`,
    unit: "",
    sub: "已创建总数",
    icon: HardDrive,
    iconBg: "bg-purple-500",
    trend: true,
  },
];

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  iconBg,
  trend,
}: (typeof statCards)[number]) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div
            className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {unit && (
            <span className="text-sm text-muted-foreground font-medium ml-0.5">
              {unit}
            </span>
          )}
          {trend && (
            <ArrowUp className="h-3.5 w-3.5 text-success ml-1.5 opacity-80" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

/* ── Donut Chart with center label ── */
function DonutCard({
  title,
  data,
  total,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          <div className="relative">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={60}
                  dataKey="value"
                  stroke="hsl(var(--card))"
                  strokeWidth={3}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* center number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xl font-bold">{total}</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.value} 台</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Task Item ── */
function TaskItem({ task }: { task: (typeof tasks)[number] }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="min-w-0 flex-1 mr-3">
        <p className="text-sm font-mono text-foreground truncate leading-relaxed">
          {task.id.toLowerCase().replace("task-", "")}{task.name.slice(0, 20)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
          {task.scriptName?.split(" ")[0] || "RESTART"}
        </p>
      </div>
      <Badge
        variant={
          task.status === "completed"
            ? "default"
            : task.status === "running"
              ? "secondary"
              : task.status === "failed"
                ? "destructive"
                : "outline"
        }
        className="text-[10px] shrink-0"
      >
        {task.status === "completed"
          ? "完成"
          : task.status === "running"
            ? "运行中"
            : task.status === "failed"
              ? "失败"
              : "等待"}
      </Badge>
    </div>
  );
}

/* ── Server Row ── */
function ServerRow({ server }: { server: HostServer }) {
  const statusColor =
    server.status === "online"
      ? "bg-success"
      : server.status === "error"
        ? "bg-destructive"
        : server.status === "maintenance"
          ? "bg-warning"
          : "bg-muted-foreground";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-2.5 w-2.5 rounded-full ${statusColor} shrink-0 ring-2 ring-offset-2 ring-offset-card ${statusColor}/30`} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{server.name}</p>
          <p className="text-xs text-muted-foreground">
            {server.type === "arm" ? "ARM" : "X86"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span className="tabular-nums">CPU {server.cpu}%</span>
        <span className="tabular-nums">内存 {server.memory}%</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function NewDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">控制台</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Matrix 设备管理平台运营概览
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Bottom 4-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DonutCard
          title="服务器类型分布"
          data={serverPie}
          total={totalServers}
        />
        <DonutCard
          title="实例类型分布"
          data={instancePie}
          total={cloudInstances.length + browserInstances.length}
        />

        {/* Recent Tasks */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              最近任务
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {recentTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CardContent>
        </Card>

        {/* Server Status */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              设备状态
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {hostServers.slice(0, 4).map((s) => (
              <ServerRow key={s.id} server={s} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Messages */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold">系统消息</CardTitle>
          <Link
            to="/system/messages"
            className="text-sm text-primary hover:underline"
          >
            查看更多
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="h-16 w-16 opacity-30 mb-3" />
          <span className="text-sm">暂无消息</span>
        </CardContent>
      </Card>
    </div>
  );
}
