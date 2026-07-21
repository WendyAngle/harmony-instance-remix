import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Eye, ListOrdered, X, RotateCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

type SessionStatus = "open_success" | "closed";

interface ProxySession {
  requestId: string;
  status: SessionStatus;
  nodeId: string;
  instanceType: string;
  instanceId: string;
  deviceType: string;
  deviceId: string;
  deviceIp: string;
  exitIp: string;
  transparentProxy: string;
  expiredAt: string | null;
  openedAt: string;
  closedAt: string | null;
  lastEventAt: string;
  errorMsg: string | null;
  proxyOpenRequestJson: string;
  proxyOpenResponseJson: string;
  proxyCloseRequestJson: string;
  proxyCloseResponseJson: string;
  thirdPartyProxyJson: string;
  latestRequestSnapshot: string;
  latestResponseSnapshot: string;
  events: LifecycleEvent[];
}

interface LifecycleEvent {
  time: string;
  type: string;
  status: SessionStatus;
  errorMsg?: string;
}

const statusMeta: Record<SessionStatus, { label: string; className: string }> = {
  open_success: { label: "打开成功", className: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  closed: { label: "已关闭", className: "bg-slate-100 text-slate-600 border border-slate-200" },
};

// ---- Mock data generation ------------------------------------------------
const DEVICE_POOL = [
  { ip: "172.30.11.202", exit: "72.11.130.104", proxy: "socks5h://192.168.50.1:10096", deviceId: "2078006612345678" },
  { ip: "172.30.21.208", exit: "23.95.228.9", proxy: "socks5h://192.168.50.1:10069", deviceId: "2075498987896827" },
  { ip: "172.30.21.56", exit: "192.3.64.230", proxy: "socks5h://192.168.50.1:10072", deviceId: "2075498987896828" },
  { ip: "172.30.21.56", exit: "66.63.177.44", proxy: "socks5h://192.168.50.1:10085", deviceId: "2075498987896829" },
  { ip: "172.30.21.238", exit: "67.215.232.217", proxy: "socks5h://192.168.50.1:10090", deviceId: "2075498987896830" },
  { ip: "172.30.21.56", exit: "72.11.130.101", proxy: "socks5h://192.168.50.1:10093", deviceId: "2075498987896831" },
  { ip: "172.30.21.30", exit: "23.95.228.9", proxy: "socks5h://192.168.50.1:10069", deviceId: "2075498887896832" },
];

function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function buildMockSessions(): ProxySession[] {
  const list: ProxySession[] = [];
  const now = new Date("2026-07-21T11:20:00");
  for (let i = 0; i < 60; i++) {
    const dev = DEVICE_POOL[i % DEVICE_POOL.length];
    const opened = new Date(now.getTime() - i * 15 * 60 * 1000);
    const closed = new Date(opened.getTime() + 90 * 1000);
    const status: SessionStatus = i % 3 === 0 ? "open_success" : "closed";
    const requestId = `task-forward-2079${(40412806 - i * 12345).toString().padStart(8, "0")}${(66817 + i).toString().padStart(5, "0")}`;
    const instanceId = `207005${(4753017319425 - i * 12).toString().slice(0, 10)}`;
    const proxySessionId = `2079388${(625198571500 + i).toString()}`;
    const traceId = `bp-task-2079387372121571329-sub-${(2079387372419366913 + i).toString()}`;
    const openReqJson = JSON.stringify({
      deviceId: dev.deviceId + "000",
      deviceIp: dev.ip,
      deviceType: "WINDOWS_VM",
      instanceId: instanceId + "400",
      instanceType: "FINGERPRINT_STORAGE",
      openContext: `{\\"schema_version\\":\\"2026.06.task-v3\\",\\"tenant_id\\":\\"206978315176050278${i}\\",\\"task_id\\":\\"2079387372121571329\\",\\"trace_id\\":\\"${traceId}\\",\\"image_instance_id\\":\\"${instanceId}9425\\",\\"platform\\":\\"facebook\\",\\"account_info\\":\\"...\\"}`,
    }, null, 2);
    const openRespJson = JSON.stringify({
      externalProxyId: `${dev.ip}@${dev.proxy.replace("socks5h://", "")}`,
      rawResponseJson: `{\\"code\\":200,\\"message\\":\\"success\\",\\"timestamp\\":\\"${fmt(opened)}+08:00\\",\\"data\\":{\\"success\\":true,\\"device_ip\\":\\"${dev.ip}\\",\\"listen_port\\":${dev.proxy.split(":").pop()},\\"listen_ip\\":\\"192.168.50.1\\",\\"protocol\\":\\"socks5h\\",\\"message\\":\\"proxy open success\\"}}`,
      success: true,
      thirdPartyTransparentProxyHost: "192.168.50.1",
    }, null, 2);
    const closeReqJson = JSON.stringify({
      closeReason: "TASK_FORWARD_TERMINAL",
      deviceIp: dev.ip,
      deviceType: "WINDOWS_VM",
      externalProxyId: `${dev.ip}@${dev.proxy.replace("socks5h://", "")}`,
      proxySessionId,
      requestId,
      traceId,
    }, null, 2);
    const closeRespJson = JSON.stringify({
      rawResponseJson: `{\\"code\\":200,\\"message\\":\\"success\\",\\"timestamp\\":\\"${fmt(closed)}+08:00\\",\\"data\\":{\\"success\\":true,\\"device_ip\\":\\"${dev.ip}\\",\\"message\\":\\"proxy close success\\"}}`,
      success: true,
    }, null, 2);
    const thirdPartyJson = JSON.stringify({
      code: 200,
      message: "success",
      timestamp: `${fmt(opened)}+08:00`,
      data: {
        success: true,
        device_ip: dev.ip,
        listen_port: Number(dev.proxy.split(":").pop()),
        listen_ip: "192.168.50.1",
        protocol: "socks5h",
        message: "proxy open success",
      },
      success: true,
    }, null, 2);

    const events: LifecycleEvent[] = [
      { time: fmt(opened), type: "OPEN_SUCCESS", status: "open_success" },
    ];
    if (status === "closed") {
      events.unshift(
        { time: fmt(new Date(closed.getTime() + 4 * 60 * 1000)), type: "REPORT_RETRY", status: "closed" },
        { time: fmt(new Date(closed.getTime() + 3 * 60 * 1000)), type: "REPORT_RETRY", status: "closed" },
        { time: fmt(new Date(closed.getTime() + 2 * 60 * 1000)), type: "REPORT_RETRY", status: "closed" },
        { time: fmt(closed), type: "CLOSED", status: "closed" },
      );
    }

    list.push({
      requestId,
      status,
      nodeId: "172.30.11.173",
      instanceType: "指纹浏览器实例",
      instanceId,
      deviceType: "虚拟机设备",
      deviceId: dev.deviceId,
      deviceIp: dev.ip,
      exitIp: dev.exit,
      transparentProxy: dev.proxy,
      expiredAt: null,
      openedAt: fmt(opened),
      closedAt: status === "closed" ? fmt(closed) : null,
      lastEventAt: fmt(status === "closed" ? closed : opened),
      errorMsg: null,
      proxyOpenRequestJson: openReqJson,
      proxyOpenResponseJson: openRespJson,
      proxyCloseRequestJson: closeReqJson,
      proxyCloseResponseJson: closeRespJson,
      thirdPartyProxyJson: thirdPartyJson,
      latestRequestSnapshot: closeReqJson,
      latestResponseSnapshot: closeRespJson,
      events,
    });
  }
  return list;
}

const MOCK_SESSIONS = buildMockSessions();
const PAGE_SIZES = [10, 25, 50];

function truncate(text: string, len = 10) {
  if (!text) return "-";
  return text.length > len ? `${text.slice(0, len)}...` : text;
}

function JsonBlock({ value }: { value: string }) {
  return (
    <pre className="text-xs bg-muted/40 rounded-md p-3 border border-border overflow-auto max-h-72 whitespace-pre-wrap break-all font-mono text-foreground/80">
      {value}
    </pre>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 py-3 border-b border-border last:border-b-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground break-all">{children}</div>
    </div>
  );
}

export default function ProxySessions() {
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nodeIdFilter, setNodeIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [detailSession, setDetailSession] = useState<ProxySession | null>(null);
  const [eventsSession, setEventsSession] = useState<ProxySession | null>(null);

  const filtered = useMemo(() => {
    return MOCK_SESSIONS.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (requestIdFilter && !s.requestId.toLowerCase().includes(requestIdFilter.toLowerCase())) return false;
      if (nodeIdFilter && !s.nodeId.includes(nodeIdFilter)) return false;
      return true;
    });
  }, [requestIdFilter, statusFilter, nodeIdFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleReset = () => {
    setRequestIdFilter("");
    setStatusFilter("all");
    setNodeIdFilter("");
    setPage(1);
  };

  const handleClose = (s: ProxySession) => {
    // mock action; no state mutation for placeholder session data
    console.log("close session", s.requestId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">requestId</Label>
              <Input
                placeholder="请输入 requestId"
                value={requestIdFilter}
                onChange={(e) => setRequestIdFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">状态</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="请选择状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="open_success">打开成功</SelectItem>
                  <SelectItem value="closed">已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">节点ID</Label>
              <Input
                placeholder="请输入节点ID"
                value={nodeIdFilter}
                onChange={(e) => setNodeIdFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setPage(1)} className="gap-1"><Search className="w-4 h-4" />搜索</Button>
              <Button variant="outline" onClick={handleReset} className="gap-1"><RotateCw className="w-4 h-4" />重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>requestId</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>节点ID</TableHead>
                  <TableHead>实例类型</TableHead>
                  <TableHead>实例ID</TableHead>
                  <TableHead>设备类型</TableHead>
                  <TableHead>设备ID</TableHead>
                  <TableHead>设备IP</TableHead>
                  <TableHead>出口 IP</TableHead>
                  <TableHead>透明代理</TableHead>
                  <TableHead>过期关闭时间</TableHead>
                  <TableHead>最近事件时间</TableHead>
                  <TableHead className="text-right pr-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((s, idx) => {
                  const meta = statusMeta[s.status];
                  return (
                    <TableRow key={s.requestId}>
                      <TableCell className="text-muted-foreground">{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{truncate(s.requestId, 24)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${meta.className}`}>{meta.label}</span>
                      </TableCell>
                      <TableCell>{s.nodeId}</TableCell>
                      <TableCell>{s.instanceType}</TableCell>
                      <TableCell className="font-mono text-xs">{truncate(s.instanceId, 8)}</TableCell>
                      <TableCell>{s.deviceType}</TableCell>
                      <TableCell className="font-mono text-xs">{truncate(s.deviceId, 8)}</TableCell>
                      <TableCell className="font-mono text-xs">{s.deviceIp}</TableCell>
                      <TableCell className="font-mono text-xs">{s.exitIp}</TableCell>
                      <TableCell className="font-mono text-xs">{s.transparentProxy}</TableCell>
                      <TableCell className="text-muted-foreground">{s.expiredAt ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{s.lastEventAt}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            onClick={() => setDetailSession(s)}
                          >
                            <Eye className="w-3.5 h-3.5" />详情
                          </button>
                          <button
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            onClick={() => setEventsSession(s)}
                          >
                            <ListOrdered className="w-3.5 h-3.5" />事件
                          </button>
                          {s.status === "open_success" && (
                            <button
                              className="inline-flex items-center gap-1 text-destructive hover:underline"
                              onClick={() => handleClose(s)}
                            >
                              <X className="w-3.5 h-3.5" />关闭
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-10">暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <div className="text-muted-foreground">共 {filtered.length} 条</div>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}条/页</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Sheet open={!!detailSession} onOpenChange={(o) => !o && setDetailSession(null)}>
        <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>代理会话详情</SheetTitle>
          </SheetHeader>
          {detailSession && (
            <div className="mt-4">
              <DetailRow label="requestId"><span className="font-mono text-xs">{detailSession.requestId}</span></DetailRow>
              <DetailRow label="节点">{detailSession.nodeId}</DetailRow>
              <DetailRow label="实例">FINGERPRINT_STORAGE / {detailSession.instanceId}</DetailRow>
              <DetailRow label="设备">WINDOWS_VM / {detailSession.deviceId}</DetailRow>
              <DetailRow label="出口 IP">{detailSession.exitIp}</DetailRow>
              <DetailRow label="状态">
                <Badge variant="outline" className={statusMeta[detailSession.status].className}>
                  {statusMeta[detailSession.status].label}
                </Badge>
              </DetailRow>
              <DetailRow label="透明代理"><span className="font-mono text-xs">{detailSession.transparentProxy}</span></DetailRow>
              <DetailRow label="过期关闭时间">{detailSession.expiredAt ?? "-"}</DetailRow>
              <DetailRow label="打开时间">{detailSession.openedAt}</DetailRow>
              <DetailRow label="关闭时间">{detailSession.closedAt ?? "-"}</DetailRow>
              <DetailRow label="错误信息">{detailSession.errorMsg ?? "-"}</DetailRow>
              <DetailRow label="三方透明代理 JSON"><JsonBlock value={detailSession.thirdPartyProxyJson} /></DetailRow>
              <DetailRow label="最近请求快照"><JsonBlock value={detailSession.latestRequestSnapshot} /></DetailRow>
              <DetailRow label="最近响应快照"><JsonBlock value={detailSession.latestResponseSnapshot} /></DetailRow>
              <DetailRow label="开代理请求"><JsonBlock value={detailSession.proxyOpenRequestJson} /></DetailRow>
              <DetailRow label="开代理响应"><JsonBlock value={detailSession.proxyOpenResponseJson} /></DetailRow>
              <DetailRow label="关代理请求"><JsonBlock value={detailSession.proxyCloseRequestJson} /></DetailRow>
              <DetailRow label="关代理响应"><JsonBlock value={detailSession.proxyCloseResponseJson} /></DetailRow>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Lifecycle Events Drawer */}
      <Sheet open={!!eventsSession} onOpenChange={(o) => !o && setEventsSession(null)}>
        <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>生命周期事件</SheetTitle>
          </SheetHeader>
          {eventsSession && (
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>事件时间</TableHead>
                    <TableHead>事件类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>错误信息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsSession.events.map((ev, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{ev.time}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusMeta[ev.status].className}`}>
                          {statusMeta[ev.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{ev.errorMsg ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}