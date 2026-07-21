import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RotateCw, ChevronLeft, ChevronRight, Inbox, ArrowUpDown, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type VncStatus = "active" | "expired" | "closed";

interface VncSession {
  machineId: string;
  node: string;
  serverAddress: string;
  port: number;
  token: string;
  wsUrl: string;
  status: VncStatus;
  createdBy: string;
  expiredAt: string;
  createdAt: string;
}

const statusMeta: Record<VncStatus, { label: string; className: string }> = {
  active: { label: "活跃", className: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  expired: { label: "已过期", className: "bg-amber-50 text-amber-600 border border-amber-200" },
  closed: { label: "已关闭", className: "bg-slate-100 text-slate-600 border border-slate-200" },
};

const initialSessions: VncSession[] = [];
const PAGE_SIZES = [10, 25, 50];

export default function VncSessions() {
  const [sessions, setSessions] = useState<VncSession[]>(initialSessions);
  const [machineIdFilter, setMachineIdFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [closeTarget, setCloseTarget] = useState<VncSession | null>(null);

  const filtered = useMemo(() => {
    const list = sessions.filter((s) =>
      !appliedFilter || s.machineId.toLowerCase().includes(appliedFilter.toLowerCase())
    );
    list.sort((a, b) =>
      sortDesc ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
    );
    return list;
  }, [sessions, appliedFilter, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const reset = () => {
    setMachineIdFilter("");
    setAppliedFilter("");
    setPage(1);
  };

  const search = () => {
    setAppliedFilter(machineIdFilter);
    setPage(1);
  };

  const confirmClose = () => {
    if (!closeTarget) return;
    setSessions((list) =>
      list.map((s) => (s.machineId === closeTarget.machineId ? { ...s, status: "closed" } : s))
    );
    toast({ title: "VNC 会话已关闭" });
    setCloseTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-1.5 max-w-md">
              <Label className="text-xs text-muted-foreground">机器 ID</Label>
              <Input
                placeholder="请输入机器 ID搜索"
                value={machineIdFilter}
                onChange={(e) => setMachineIdFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={search} className="gap-1"><Search className="w-4 h-4" />搜索</Button>
              <Button variant="outline" onClick={reset} className="gap-1"><RotateCw className="w-4 h-4" />重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-14">#</TableHead>
                <TableHead>机器 ID</TableHead>
                <TableHead>所属节点</TableHead>
                <TableHead>服务器地址</TableHead>
                <TableHead>端口</TableHead>
                <TableHead>TOKEN 代币</TableHead>
                <TableHead>WSURL</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建用户</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead>
                  <button
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() => setSortDesc((v) => !v)}
                  >
                    创建时间 <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12}>
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
                      <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <div className="text-sm">暂无数据</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((s, idx) => (
                  <TableRow key={s.machineId + s.createdAt}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{s.machineId}</TableCell>
                    <TableCell>{s.node}</TableCell>
                    <TableCell className="font-mono text-xs">{s.serverAddress}</TableCell>
                    <TableCell className="font-mono text-xs">{s.port}</TableCell>
                    <TableCell className="font-mono text-xs">{s.token}</TableCell>
                    <TableCell className="font-mono text-xs break-all">{s.wsUrl}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusMeta[s.status].className}`}>
                        {statusMeta[s.status].label}
                      </span>
                    </TableCell>
                    <TableCell>{s.createdBy}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.expiredAt}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.createdAt}</TableCell>
                    <TableCell className="text-right pr-4">
                      {s.status === "active" ? (
                        <button
                          className="text-destructive hover:underline text-xs"
                          onClick={() => setCloseTarget(s)}
                        >
                          关闭
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <div className="text-muted-foreground">共 {filtered.length} 条</div>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n}条/页</SelectItem>)}
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

      {/* Close confirm dialog */}
      <Dialog open={!!closeTarget} onOpenChange={(o) => !o && setCloseTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>提示</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>确定要关闭该 VNC 会话吗?</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseTarget(null)}>取消</Button>
            <Button onClick={confirmClose}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}