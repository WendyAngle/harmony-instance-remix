import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { hostServers, type HostServer, type HostServerType, type HostServerStatus } from "@/data/mock-data";
import { Plus, Trash2, Eye, Server, Monitor, Upload, RotateCcw, Search, ChevronLeft, ChevronRight, Power, ExternalLink, ServerCrash, Download, FileSpreadsheet, Layers } from "lucide-react";

const serverTypeLabel: Record<HostServerType, string> = { arm: "ARM服务器", x86: "X86服务器" };

const statusConfig: Record<HostServerStatus, { label: string; tooltip: string; colorClass: string }> = {
  online: { label: "在线", tooltip: "服务器正常运行", colorClass: "bg-status-online" },
  offline: { label: "离线", tooltip: "服务器离线无法连接", colorClass: "bg-status-offline" },
  error: { label: "异常", tooltip: "运行异常，需检查", colorClass: "bg-status-abnormal" },
  maintenance: { label: "维护中", tooltip: "计划维护中", colorClass: "bg-status-processing" },
  shielded: { label: "已屏蔽", tooltip: "告警屏蔽", colorClass: "bg-status-shielded" },
};

const PAGE_SIZES = [10, 20, 50];

const isServerActive = (status: HostServerStatus) => status === "online" || status === "error";

// Mock: count VMs associated with a server
const getVmCount = (serverId: string, serverIp: string) => {
  // In real app this would query virtual instances
  const counts: Record<string, number> = {
    "10.0.1.10": 3,
    "10.0.1.11": 2,
    "10.0.2.1": 5,
    "10.0.2.2": 0,
    "10.0.1.12": 1,
    "10.0.2.3": 0,
    "10.0.3.1": 4,
  };
  return counts[serverIp] ?? 0;
};

export default function HostServers() {
  const navigate = useNavigate();
  const [servers, setServers] = useState(hostServers);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
  const [showBatchDeleteAlert, setShowBatchDeleteAlert] = useState(false);
  const [showDetail, setShowDetail] = useState<HostServer | null>(null);
  const [showBoardCards, setShowBoardCards] = useState<HostServer | null>(null);
  const [addFormType, setAddFormType] = useState("");
  const [selectedBoardCards, setSelectedBoardCards] = useState<string[]>([]);

  // Mock: unassociated ARM board cards available for linking
  const availableBoardCards = useMemo(() => [
    { id: "ubc-1", name: "板卡-空闲-01", sn: "OR65M2X101S01", spec: "Orion865 | 8 vCPU | 12GB", ip: "172.31.30.1", runStatus: "正常" as const },
    { id: "ubc-2", name: "板卡-空闲-02", sn: "OR65M2X102S02", spec: "Orion865 | 8 vCPU | 12GB", ip: "172.31.30.2", runStatus: "正常" as const },
    { id: "ubc-3", name: "板卡-空闲-03", sn: "OR65M2X103S03", spec: "Orion865 | 8 vCPU | 12GB", ip: "172.31.30.3", runStatus: "异常" as const },
    { id: "ubc-4", name: "板卡-空闲-04", sn: "OR65M2X104S04", spec: "Orion865 | 8 vCPU | 12GB", ip: "172.31.30.4", runStatus: "正常" as const },
    { id: "ubc-5", name: "板卡-空闲-05", sn: "OR65M2X105S05", spec: "Orion865 | 8 vCPU | 12GB", ip: "172.31.30.5", runStatus: "正常" as const },
  ], []);

  const filteredServers = useMemo(() => {
    let result = servers;
    if (filterType !== "all") result = result.filter(s => s.type === filterType);
    if (filterStatus !== "all") result = result.filter(s => s.status === filterStatus);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.ip.includes(q) || s.mac.toLowerCase().includes(q) || s.sn.toLowerCase().includes(q));
    }
    return result;
  }, [servers, filterType, filterStatus, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredServers.length / pageSize));
  const pagedServers = filteredServers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string) => {
    setServers(prev => prev.filter(s => s.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setShowDeleteAlert(null);
  };

  const handleBatchDelete = () => {
    setServers(prev => prev.filter(s => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
    setShowBatchDeleteAlert(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    const ids = pagedServers.map(s => s.id);
    const allSelected = ids.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const n = new Set(prev);
      ids.forEach(id => allSelected ? n.delete(id) : n.add(id));
      return n;
    });
  };

  const allPageSelected = pagedServers.length > 0 && pagedServers.every(s => selectedIds.has(s.id));

  const metricOrDash = (server: HostServer, value: React.ReactNode) =>
    isServerActive(server.status) ? value : <span className="text-muted-foreground">-</span>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">主机服务器管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理ARM服务器和X86服务器</p>
        </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" disabled={selectedIds.size === 0} onClick={() => setShowBatchDeleteAlert(true)}>
              <Trash2 className="h-4 w-4 mr-1" />批量删除{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBatchImport(true)}>
              <Upload className="h-4 w-4 mr-1" />批量导入
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />新增服务器
            </Button>
          </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="搜索服务器ID/名称/IP/MAC/SN..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="服务器类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="arm">ARM服务器</SelectItem>
            <SelectItem value="x86">X86服务器</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="online">在线</SelectItem>
            <SelectItem value="offline">离线</SelectItem>
            <SelectItem value="error">异常</SelectItem>
            <SelectItem value="maintenance">维护中</SelectItem>
            <SelectItem value="shielded">已屏蔽</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ServerCrash className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">暂无匹配的服务器记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">服务器ID</TableHead>
                  <TableHead className="whitespace-nowrap">服务器名称</TableHead>
                  <TableHead className="whitespace-nowrap">类型</TableHead>
                  <TableHead className="whitespace-nowrap">所属集群/阵列ID</TableHead>
                  <TableHead className="whitespace-nowrap">IP地址</TableHead>
                  <TableHead className="whitespace-nowrap">MAC</TableHead>
                  <TableHead className="whitespace-nowrap">SN码</TableHead>
                  <TableHead className="whitespace-nowrap">CPU型号</TableHead>
                  <TableHead className="text-right whitespace-nowrap">CPU核数</TableHead>
                  <TableHead className="text-right whitespace-nowrap">CPU (%)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">内存 (GB)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">磁盘 (TB)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">温度 (°C)</TableHead>
                  <TableHead className="whitespace-nowrap">网络带宽占用</TableHead>
                  <TableHead className="text-right whitespace-nowrap">关联虚拟机</TableHead>
                  <TableHead className="whitespace-nowrap">最后心跳时间</TableHead>
                  <TableHead className="whitespace-nowrap">上架时间</TableHead>
                  <TableHead className="text-center whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedServers.map((server) => {
                  const active = isServerActive(server.status);
                  const vmCount = getVmCount(server.id, server.ip);
                  return (
                    <TableRow
                      key={server.id}
                      className={server.status === "error" ? "bg-destructive/5" : server.status === "offline" ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Checkbox checked={selectedIds.has(server.id)} onCheckedChange={() => toggleSelect(server.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap" title={server.id}>{server.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap">{server.name}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] gap-1 whitespace-nowrap">
                          {server.type === "arm" ? <Server className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                          {serverTypeLabel[server.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{server.clusterId}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{server.ip}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{server.mac}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{server.sn || "-"}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{server.cpuModel}</TableCell>
                      <TableCell className="text-right text-xs font-mono whitespace-nowrap">{server.cpuCores}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {metricOrDash(server, (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={server.cpu} className="w-12 h-1.5" />
                            <span className={`text-xs font-mono ${server.cpu >= 80 ? "text-threshold-danger font-bold" : ""}`}>{server.cpu}%</span>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {metricOrDash(server, (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={server.memory} className="w-12 h-1.5" />
                            <span className={`text-xs font-mono ${server.memory >= 90 ? "text-threshold-danger font-bold" : ""}`}>{server.memoryUsed}/{server.memoryTotal}</span>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {metricOrDash(server, (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={server.disk} className="w-12 h-1.5" />
                            <span className={`text-xs font-mono ${server.disk >= 85 ? "text-threshold-danger font-bold" : ""}`}>{server.diskUsed}/{server.diskTotal}</span>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {metricOrDash(server, (
                          <span className={`text-xs font-mono ${server.temperature >= 60 ? "text-threshold-danger font-bold" : server.temperature >= 45 ? "text-warning" : ""}`}>
                            {server.temperature}°C
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="text-xs font-mono whitespace-nowrap">
                        {metricOrDash(server, server.networkBandwidth)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {vmCount > 0 ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs font-mono text-primary whitespace-nowrap"
                            onClick={() => navigate(`/devices/virtual?server=${server.ip}`)}
                          >
                            {vmCount} 台
                          </Button>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">0 台</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{server.lastHeartbeat}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{server.createdAt}</TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-white whitespace-nowrap ${statusConfig[server.status].colorClass}`}>
                              {statusConfig[server.status].label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{statusConfig[server.status].tooltip}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowDetail(server)}><Eye className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>详情</TooltipContent></Tooltip>
                          {server.type === "arm" && (
                            <Tooltip><TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowBoardCards(server)}><Layers className="h-3.5 w-3.5" /></Button>
                            </TooltipTrigger><TooltipContent>查看关联资源</TooltipContent></Tooltip>
                          )}
                          {active && (
                            <>
                              <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
                              </TooltipTrigger><TooltipContent>重启</TooltipContent></Tooltip>
                              <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Power className="h-3.5 w-3.5" /></Button>
                              </TooltipTrigger><TooltipContent>关机</TooltipContent></Tooltip>
                            </>
                          )}
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setShowDeleteAlert(server.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>删除</TooltipContent></Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filteredServers.length} 条记录</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>每页</span>
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s} 条</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span>{currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 新增服务器弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) { setAddFormType(""); setSelectedBoardCards([]); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增服务器</DialogTitle>
            <DialogDescription>登记新的ARM服务器或X86服务器信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>服务器类型 <span className="text-destructive">*</span></Label>
                <Select value={addFormType} onValueChange={v => { setAddFormType(v); setSelectedBoardCards([]); }}>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arm">ARM服务器</SelectItem>
                    <SelectItem value="x86">X86服务器</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>服务器名称 <span className="text-destructive">*</span></Label><Input placeholder="ARM生产服务器-01" /></div>
            </div>

            {/* ARM服务器显示关联资源 - 紧挨服务器类型 */}
            {addFormType === "arm" && (
              <div className="space-y-2">
                <Label>关联资源（ARM板卡）</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {availableBoardCards.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">暂无可关联的ARM板卡</p>
                  ) : (
                    availableBoardCards.map(card => (
                      <div key={card.id} className="flex items-center gap-2 py-1">
                        <Checkbox
                          checked={selectedBoardCards.includes(card.id)}
                          onCheckedChange={(checked) => {
                            setSelectedBoardCards(prev =>
                              checked ? [...prev, card.id] : prev.filter(id => id !== card.id)
                            );
                          }}
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-medium">{card.name}</span>
                          <span className="text-muted-foreground ml-2">SN: {card.sn}</span>
                          <span className="text-muted-foreground ml-2">IP: {card.ip}</span>
                          <span className="text-muted-foreground ml-2">{card.spec}</span>
                        </div>
                        <Badge variant={card.runStatus === "正常" ? "default" : "destructive"} className="text-[10px]">{card.runStatus}</Badge>
                      </div>
                    ))
                  )}
                </div>
                {selectedBoardCards.length > 0 && (
                  <p className="text-xs text-muted-foreground">已选择 {selectedBoardCards.length} 块板卡</p>
                )}
              </div>
            )}
            )}

            <div className="space-y-2"><Label>备注</Label><Input placeholder="选填" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setAddFormType(""); setSelectedBoardCards([]); }}>取消</Button>
            <Button onClick={() => { setShowAddDialog(false); setAddFormType(""); setSelectedBoardCards([]); }}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入弹窗 */}
      <Dialog open={showBatchImport} onOpenChange={setShowBatchImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量导入服务器</DialogTitle>
            <DialogDescription>下载模版文件，按格式填写后上传导入</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>1. 下载导入模版</Label>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                下载模版文件（.xlsx）
              </Button>
              <p className="text-xs text-muted-foreground">模版包含：服务器名称、类型、所属集群/阵列ID、IP、MAC、SN码、CPU型号、CPU核数、网络、机架、操作系统、负责人、总内存(GB)、总磁盘(TB)</p>
            </div>
            <div className="space-y-2">
              <Label>2. 上传填写好的文件</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">点击或拖拽上传文件</p>
                <p className="text-xs text-muted-foreground mt-1">支持 .xlsx、.xls、.csv 格式</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchImport(false)}>取消</Button>
            <Button onClick={() => setShowBatchImport(false)}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 服务器详情抽屉 */}
      <Sheet open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>服务器详情 - {showDetail?.name}</SheetTitle>
            <SheetDescription>
              {showDetail && serverTypeLabel[showDetail.type]} · {showDetail?.ip} · {showDetail?.network}
            </SheetDescription>
          </SheetHeader>
          {showDetail && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">CPU (%)</p><p className={`text-lg font-bold ${showDetail.cpu >= 80 ? "text-threshold-danger" : ""}`}>{isServerActive(showDetail.status) ? `${showDetail.cpu}%` : "-"}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">内存 (GB)</p><p className={`text-lg font-bold ${showDetail.memory >= 90 ? "text-threshold-danger" : ""}`}>{isServerActive(showDetail.status) ? `${showDetail.memoryUsed}/${showDetail.memoryTotal}` : "-"}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">磁盘 (TB)</p><p className={`text-lg font-bold ${showDetail.disk >= 85 ? "text-threshold-danger" : ""}`}>{isServerActive(showDetail.status) ? `${showDetail.diskUsed}/${showDetail.diskTotal}` : "-"}</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">温度 (°C)</p><p className={`text-lg font-bold ${showDetail.temperature >= 60 ? "text-threshold-danger" : ""}`}>{isServerActive(showDetail.status) ? `${showDetail.temperature}°C` : "-"}</p></CardContent></Card>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">服务器ID</span><span className="font-mono text-xs">{showDetail.id}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">服务器名称</span><span>{showDetail.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">所属集群/阵列ID</span><span className="font-mono">{showDetail.clusterId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">操作系统</span><span>{showDetail.os}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CPU型号</span><span>{showDetail.cpuModel}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CPU核数</span><span>{showDetail.cpuCores} 核</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">MAC地址</span><span className="font-mono">{showDetail.mac}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SN码</span><span className="font-mono">{showDetail.sn || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">机架</span><span>{showDetail.rack || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">网络</span><span>{showDetail.network}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">网络带宽占用</span><span className="font-mono">{showDetail.networkBandwidth}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">负责人</span><span>{showDetail.manager || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">上架时间</span><span>{showDetail.createdAt}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">最后心跳时间</span><span>{showDetail.lastHeartbeat}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">运行时长</span><span>{showDetail.uptime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">关联虚拟机</span><span>{getVmCount(showDetail.id, showDetail.ip)} 台</span></div>
                  {showDetail.remark && (
                    <div className="flex justify-between"><span className="text-muted-foreground">备注</span><span>{showDetail.remark}</span></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 删除确认 */}
      <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除服务器？</AlertDialogTitle>
            <AlertDialogDescription>删除服务器 {showDeleteAlert} 后将无法恢复，该服务器下所有关联虚拟机信息将被释放。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => showDeleteAlert && handleDelete(showDeleteAlert)}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认 */}
      <AlertDialog open={showBatchDeleteAlert} onOpenChange={setShowBatchDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除？</AlertDialogTitle>
            <AlertDialogDescription>将删除选中的 {selectedIds.size} 台服务器，此操作不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 查看关联ARM板卡 */}
      <Dialog open={!!showBoardCards} onOpenChange={() => setShowBoardCards(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>关联ARM板卡 - {showBoardCards?.name}</DialogTitle>
            <DialogDescription>服务器 {showBoardCards?.ip} 下关联的ARM板卡信息</DialogDescription>
          </DialogHeader>
          {showBoardCards && (() => {
            // Mock: generate associated board cards based on server
            const mockAssociatedCards = Array.from({ length: showBoardCards.ip === "10.0.1.10" ? 6 : showBoardCards.ip === "10.0.1.11" ? 4 : showBoardCards.ip === "10.0.1.12" ? 3 : 2 }, (_, i) => ({
              id: `bc-${showBoardCards.id.substring(0, 8)}-${i + 1}`,
              name: `板卡-${showBoardCards.name.replace("ARM", "").replace("服务器", "").trim()}-${String(i + 1).padStart(2, "0")}`,
              sn: `OR65M2X${String(Math.floor(Math.random() * 900) + 100)}S${String(i + 1).padStart(2, "0")}`,
              spec: "Orion865 | 8 vCPU | 12GB内存 | 256G存储",
              os: "Android10",
              runStatus: i === 0 && showBoardCards.status === "error" ? "异常" as const : "正常" as const,
              taskStatus: i % 3 === 0 ? "运行中" as const : "空闲" as const,
              containerCount: i % 2 === 0 ? 2 : 4,
              ip: `172.31.${showBoardCards.ip.split(".")[2]}.${10 + i}`,
              romVersion: "OR65L10CDA_V2.2.55_20250715_1708",
            }));
            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">板卡名称</TableHead>
                    <TableHead className="whitespace-nowrap">SN码</TableHead>
                    <TableHead className="whitespace-nowrap">规格</TableHead>
                    <TableHead className="whitespace-nowrap">操作系统</TableHead>
                    <TableHead className="whitespace-nowrap text-center">运行状态</TableHead>
                    <TableHead className="whitespace-nowrap text-center">任务状态</TableHead>
                    <TableHead className="whitespace-nowrap text-right">容器数</TableHead>
                    <TableHead className="whitespace-nowrap">IP地址</TableHead>
                    <TableHead className="whitespace-nowrap">ROM版本</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAssociatedCards.map(card => (
                    <TableRow key={card.id}>
                      <TableCell className="text-xs font-medium whitespace-nowrap">{card.name}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{card.sn}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.spec}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.os}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant={card.runStatus === "正常" ? "default" : "destructive"} className="text-[10px]">{card.runStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px]">{card.taskStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono whitespace-nowrap">{card.containerCount}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{card.ip}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{card.romVersion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/devices/board-cards")}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />前往ARM板卡管理
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
