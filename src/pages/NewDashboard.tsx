import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Inbox,
  Monitor,
  MonitorSmartphone,
  Cpu,
  Link2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import {
  hostServers,
  virtualInstances,
  proxyItems,
  scripts,
} from "@/data/mock-data";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

/* ── derived counts (aligned with reference screenshot) ── */
const totalServers = 8;
const onlineServers = 8;

const winVmRunning = 7;
const winVmTotal = 16;

const cloudVmRunning = 64;
const cloudVmTotal = 104;

const cloudInstMounted = 54;
const cloudInstTotal = 63;

const browserUsing = 0;
const browserTotal = 72;

const proxyHealthy = 136;
const proxyTotal = 136;

const activeApps = scripts.filter((s) => s.status === "active").length || 5;
const deprecatedApps = scripts.filter((s) => s.status === "deprecated").length || 0;
const totalApps = activeApps + deprecatedApps;

const armServers = hostServers.filter((s) => s.type === "arm").length;
const x86Servers = hostServers.filter((s) => s.type === "x86").length;

/* ── stat card configs ── */
type Stat = {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
};

const topStats: Stat[] = [
  { label: "服务器", value: `${onlineServers}/${totalServers}`, unit: "台", sub: "在线/总数", icon: Monitor, iconBg: "bg-[#3B82F6]" },
  { label: "Windows虚拟机", value: `${winVmRunning}/${winVmTotal}`, unit: "个", sub: "运行中/总数", icon: MonitorSmartphone, iconBg: "bg-[#14B8A6]" },
  { label: "云机虚拟机", value: `${cloudVmRunning}/${cloudVmTotal}`, unit: "个", sub: "运行中/总数", icon: Cpu, iconBg: "bg-[#F59E0B]" },
  { label: "云机实例", value: `${cloudInstMounted}/${cloudInstTotal}`, unit: "个", sub: "已挂载/总数", icon: Cpu, iconBg: "bg-[#22C55E]" },
];

const midStats: Stat[] = [
  { label: "指纹浏览器", value: `${browserUsing}/${browserTotal}`, unit: "个", sub: "使用中/总数", icon: Link2, iconBg: "bg-[#F59E0B]" },
  { label: "健康代理", value: `${proxyHealthy}/${proxyTotal}`, unit: "个", sub: "健康/总数", icon: Link2, iconBg: "bg-[#94A3B8]" },
  { label: "应用包", value: `${totalApps}`, unit: "个", sub: `${activeApps} 活跃 · ${deprecatedApps} 废弃`, icon: ShoppingBag, iconBg: "bg-[#F43F5E]" },
];

/* ── donut data ── */
const vmTypePie = [
  { name: "Windows虚拟机", value: 16, color: "#14B8A6" },
  { name: "云机虚拟机", value: 104, color: "#F59E0B" },
];
const serverTypePie = [
  { name: "ARM服务器", value: armServers, color: "#3B82F6" },
  { name: "X86服务器", value: x86Servers, color: "#22C55E" },
];
const instTypePie = [
  { name: "云机实例", value: cloudInstTotal, color: "#3B82F6" },
  { name: "指纹浏览器", value: browserTotal, color: "#F59E0B" },
];

/* ── trend generator ── */
type TrendRange = "day" | "week" | "twoweek" | "month";
const rangeMeta: Record<TrendRange, { label: string; points: number; unit: "h" | "d"; step: number }> = {
  day: { label: "近一天", points: 24, unit: "h", step: 1 },
  week: { label: "近一周", points: 7, unit: "d", step: 1 },
  twoweek: { label: "近两周", points: 14, unit: "d", step: 1 },
  month: { label: "近一月", points: 30, unit: "d", step: 1 },
};
function buildTrend(range: TrendRange) {
  const { points, unit } = rangeMeta[range];
  const now = new Date();
  const rows: any[] = [];
  for (let i = 0; i < points; i++) {
    const idx = points - 1 - i;
    const d = new Date(now);
    if (unit === "h") d.setHours(d.getHours() - idx);
    else d.setDate(d.getDate() - idx);
    const label = unit === "h"
      ? `${String(d.getHours()).padStart(2, "0")}:00`
      : `${d.getMonth() + 1}/${d.getDate()}`;
    rows.push({
      time: label,
      "云机实例": 63 + Math.round(Math.sin(i / 2) * 2),
      "指纹浏览器": 72 + Math.round(Math.cos(i / 3) * 2),
      "Windows虚拟机": 16 + Math.round(Math.sin(i / 4) * 1),
      "云机虚拟机": 104 + Math.round(Math.cos(i / 2) * 2),
      "执行任务": 10 + Math.round(Math.abs(Math.sin(i / 2)) * 5),
    });
  }
  return rows;
}

const trendSeries: { key: string; color: string }[] = [
  { key: "云机实例", color: "#22C55E" },
  { key: "指纹浏览器", color: "#F59E0B" },
  { key: "Windows虚拟机", color: "#14B8A6" },
  { key: "云机虚拟机", color: "#F97316" },
  { key: "执行任务", color: "#F43F5E" },
];

/* ── Stat Card ── */
function StatCard({ label, value, unit, sub, icon: Icon, iconBg }: Stat) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-[26px] font-bold tracking-tight text-slate-800 tabular-nums">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

/* ── Donut ── */
function DonutCard({
  title, data, unit = "台",
}: { title: string; data: { name: string; value: number; color: string }[]; unit?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [`${v} ${unit}`, n]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-slate-600">{d.name}</span>
              <span className="font-semibold text-slate-800 tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Trend Chart ── */
function TrendCard() {
  const [range, setRange] = useState<TrendRange>("day");
  const data = useMemo(() => buildTrend(range), [range]);
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">资源/任务 趋势</CardTitle>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          {(Object.keys(rangeMeta) as TrendRange[]).map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`px-3 py-1 transition-colors ${
                range === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {rangeMeta[k].label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="云机虚拟机" stroke="#F97316" fill="url(#areaFill)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="云机实例" stroke="#22C55E" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="指纹浏览器" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Windows虚拟机" stroke="#14B8A6" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="执行任务" stroke="#F43F5E" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Host status card ── */
function HostStatusCard() {
  const online = hostServers.filter((s) => s.status === "online").length;
  const offline = hostServers.filter((s) => s.status === "offline").length;
  const normal = hostServers.filter((s) => s.status !== "maintenance" && s.status !== "error").length;
  const maint = hostServers.filter((s) => s.status === "maintenance").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">主机状态</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">在线状态</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">在线 {online}</Badge>
              <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-0">离线 {offline}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">运维状态</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">正常 {normal}</Badge>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">维护中 {maint}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
          {hostServers.slice(0, 6).map((s) => {
            const dotColor =
              s.status === "online" ? "bg-emerald-500" :
              s.status === "error" ? "bg-rose-500" :
              s.status === "maintenance" ? "bg-amber-500" : "bg-slate-400";
            return (
              <div key={s.id} className="rounded-md bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="text-sm font-medium text-slate-700 truncate">{s.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>{s.type === "arm" ? "ARM" : "X86"}</span>
                  <span>CPU {s.cpu}%</span>
                  <span>CPU 使用率 {s.cpu}%</span>
                  <span>内存 {s.memory}%</span>
                  <span>磁盘 {s.disk}%</span>
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* keep proxyItems reference to avoid unused warning */
void proxyItems;
void virtualInstances;

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

      {/* Top stats row (4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {topStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Mid stats row (3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {midStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Trend + VM type distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <TrendCard />
        </div>
        <DonutCard title="虚拟机类型分布" data={vmTypePie} unit="个" />
      </div>

      {/* Bottom row: server type / instance type / host status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DonutCard title="服务器类型分布" data={serverTypePie} unit="台" />
        <DonutCard title="实例类型分布" data={instTypePie} unit="个" />
        <HostStatusCard />
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
