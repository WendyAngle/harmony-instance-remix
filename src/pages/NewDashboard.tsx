import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  hostServers,
  virtualInstances,
  socialAccounts,
  proxyItems,
  romImages,
  tasks,
  type HostServer,
} from "@/data/mock-data";
import {
  Server,
  Cpu,
  Globe,
  Shield,
  Package,
  HardDrive,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ── derived stats ──
const onlineServers = hostServers.filter((s) => s.status === "online").length;
const totalServers = hostServers.length;

const cloudInstances = virtualInstances.filter((v) => v.type === "cloud");
const mountedCloud = cloudInstances.filter((v) => v.status === "running").length;

const browserInstances = virtualInstances.filter((v) => v.type === "windows");
const mountedBrowser = browserInstances.filter((v) => v.status === "running").length;

const healthyProxies = proxyItems.filter((p) => p.status === "available").length;
const totalProxies = proxyItems.length;

const activeApps = 8; // mock
const totalImages = romImages.length;

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

// ── gradient icon backgrounds ──
const iconStyles: Record<string, string> = {
  server: "from-blue-500/20 to-blue-600/10 text-blue-500",
  cloud: "from-emerald-500/20 to-emerald-600/10 text-emerald-500",
  browser: "from-orange-500/20 to-orange-600/10 text-orange-500",
  proxy: "from-indigo-500/20 to-indigo-600/10 text-indigo-500",
  app: "from-rose-500/20 to-rose-600/10 text-rose-500",
  image: "from-purple-500/20 to-purple-600/10 text-purple-500",
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  style: string;
}

function StatCard({ label, value, sub, icon: Icon, style }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-success opacity-70" />
          </div>
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${style} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function PieSection({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={50}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 text-sm">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}:</span>
              <span className="font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ServerStatusItem({ server }: { server: HostServer }) {
  const statusDot =
    server.status === "online"
      ? "bg-success"
      : server.status === "error"
        ? "bg-destructive"
        : server.status === "maintenance"
          ? "bg-warning"
          : "bg-muted-foreground";

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-2 w-2 rounded-full ${statusDot} shrink-0`} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{server.name}</p>
          <p className="text-[11px] text-muted-foreground">{server.type === "arm" ? "ARM" : "X86"}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span>CPU {server.cpu}%</span>
        <span>内存 {server.memory}%</span>
      </div>
    </div>
  );
}

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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="服务器状态"
          value={`${onlineServers}/${totalServers}`}
          sub="在线/总数"
          icon={Server}
          style={iconStyles.server}
        />
        <StatCard
          label="云机实例"
          value={`${mountedCloud}/${cloudInstances.length}`}
          sub="已挂载/总数"
          icon={Cpu}
          style={iconStyles.cloud}
        />
        <StatCard
          label="指纹浏览器"
          value={`${mountedBrowser}/${browserInstances.length}`}
          sub="使用中/总数"
          icon={Globe}
          style={iconStyles.browser}
        />
        <StatCard
          label="健康代理"
          value={`${healthyProxies}/${totalProxies}`}
          sub="健康/总数"
          icon={Shield}
          style={iconStyles.proxy}
        />
        <StatCard
          label="应用包"
          value={`${activeApps}`}
          sub="0 活跃 · 0 废弃"
          icon={Package}
          style={iconStyles.app}
        />
        <StatCard
          label="镜像文件"
          value={`${totalImages}`}
          sub="已创建总数"
          icon={HardDrive}
          style={iconStyles.image}
        />
      </div>

      {/* ── Bottom 4-column: Pies + Tasks + Servers ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <PieSection title="服务器类型分布" data={serverPie} />
        <PieSection title="实例类型分布" data={instancePie} />

        {/* Recent Tasks */}
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              最近任务
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <p className="text-sm font-medium truncate leading-relaxed">
                  {task.id.replace("TASK-", "")}···{task.name.slice(-6)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {task.scriptName?.split(" ")[0] || "TASK"}
                  </p>
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
                    className="text-[10px] h-5"
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Server Status */}
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              设备状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hostServers.slice(0, 4).map((s) => (
              <ServerStatusItem key={s.id} server={s} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
