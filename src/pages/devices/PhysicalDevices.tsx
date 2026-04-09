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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { physicalDevices, virtualInstances, type PhysicalDevice, type DeviceType, type DeviceStatus } from "@/data/mock-data";
import { Plus, RotateCcw, Trash2, Eye, HardDrive, Server, Monitor, LayoutGrid, List, Upload, Search, FileDown, FileText, ChevronLeft, ChevronRight, Pencil, Download, FileSpreadsheet } from "lucide-react";

const deviceTypeLabel: Record<DeviceType, string> = { board: "ARM主板", windows: "Windows主机" };

const statusConfig: Record<DeviceStatus, { label: string; tooltip: string; colorClass: string }> = {
  online: { label: "在线", tooltip: "设备正常运行", colorClass: "bg-status-online" },
  abnormal: { label: "异常", tooltip: "运行异常，触发告警", colorClass: "bg-status-abnormal" },
  offline: { label: "离线", tooltip: "设备离线无法连接", colorClass: "bg-status-offline" },
  processing: { label: "处理中", tooltip: "重启/维护中", colorClass: "bg-status-processing" },
  shielded: { label: "已屏蔽", tooltip: "异常已屏蔽，不告警", colorClass: "bg-status-shielded" },
};

const PAGE_SIZES = [10, 20, 50];

export default function PhysicalDevices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState(physicalDevices);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterServer, setFilterServer] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<string>("none");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
  const [showBatchDeleteAlert, setShowBatchDeleteAlert] = useState(false);
  const [showDetail, setShowDetail] = useState<PhysicalDevice | null>(null);
  const [batchImportText, setBatchImportText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const servers = useMemo(() => [...new Set(devices.map(d => d.server))], [devices]);

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (filterType !== "all") result = result.filter(d => d.type === filterType);
    if (filterStatus !== "all") result = result.filter(d => d.status === filterStatus);
    if (filterServer !== "all") result = result.filter(d => d.server === filterServer);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(d => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.ip.includes(q));
    }
    if (sortField === "cpu") result = [...result].sort((a, b) => b.cpu - a.cpu);
    else if (sortField === "memory") result = [...result].sort((a, b) => b.memory - a.memory);
    else if (sortField === "temperature") result = [...result].sort((a, b) => b.temperature - a.temperature);
    return result;
  }, [devices, filterType, filterStatus, filterServer, searchText, sortField]);

  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / pageSize));
  const pagedDevices = filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allPageSelected = pagedDevices.length > 0 && pagedDevices.every(d => selectedIds.has(d.id));

  const toggleSelectAll = () => {
    const newSet = new Set(selectedIds);
    if (allPageSelected) {
      pagedDevices.forEach(d => newSet.delete(d.id));
    } else {
      pagedDevices.forEach(d => newSet.add(d.id));
    }
    setSelectedIds(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDelete = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setShowDeleteAlert(null);
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
  };

  const handleBatchDelete = () => {
    setDevices(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    setShowBatchDeleteAlert(false);
  };

  const handleBatchRestart = () => {
    setDevices(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, status: "processing" as DeviceStatus } : d));
    setSelectedIds(new Set());
  };

  const renderValue = (val: string | number | undefined | null, suffix = "") => {
    if (val === undefined || val === null || val === "" || val === 0) return <span className="text-muted-foreground">-</span>;
    return <>{val}{suffix}</>;
  };

  const renderCpuWarning = (val: number) => val >= 80;
  const renderMemWarning = (val: number) => val >= 85;
  const renderTempWarning = (val: number) => val >= 60;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">物理设备管理</h1>
            <p className="text-sm text-muted-foreground mt-1">统一管理ARM主板机与Windows主机硬件资源</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {/* export logic */}}>
              <FileDown className="h-4 w-4 mr-1" />导出
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBatchImport(true)}>
              <Upload className="h-4 w-4 mr-1" />批量导入
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />新增设备
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-8 text-xs" placeholder="搜索设备ID/名称/IP..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
          </div>
          <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="board">ARM主板</SelectItem>
              <SelectItem value="windows">Windows主机</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="online">在线</SelectItem>
              <SelectItem value="abnormal">异常</SelectItem>
              <SelectItem value="offline">离线</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="shielded">已屏蔽</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterServer} onValueChange={v => { setFilterServer(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="服务器" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部服务器</SelectItem>
              {servers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="排序" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">默认排序</SelectItem>
              <SelectItem value="cpu">CPU ↓</SelectItem>
              <SelectItem value="memory">内存 ↓</SelectItem>
              <SelectItem value="temperature">温度 ↓</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center gap-1 mr-2">
              {selectedIds.size > 0 && <span className="text-xs text-muted-foreground">已选 {selectedIds.size} 项</span>}
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={selectedIds.size === 0} onClick={handleBatchRestart}>
                <RotateCcw className="h-3 w-3 mr-1" />批量重启
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" disabled={selectedIds.size === 0} onClick={() => setShowBatchDeleteAlert(true)}>
                <Trash2 className="h-3 w-3 mr-1" />批量删除
              </Button>
            </div>
            <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("table")}><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === "card" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("card")}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} /></TableHead>
                    <TableHead>设备ID</TableHead>
                    <TableHead>设备名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>MAC</TableHead>
                    <TableHead>所属服务器</TableHead>
                    <TableHead>系统版本</TableHead>
                    <TableHead className="text-right">CPU (%)</TableHead>
                    <TableHead className="text-right">内存 (%)</TableHead>
                    <TableHead className="text-right">温度 (°C)</TableHead>
                    <TableHead className="text-center">实例数 (已用/总)</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead>运维负责人</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedDevices.map((device) => (
                    <TableRow key={device.id} className={selectedIds.has(device.id) ? "bg-accent/50" : ""}>
                      <TableCell><Checkbox checked={selectedIds.has(device.id)} onCheckedChange={() => toggleSelect(device.id)} /></TableCell>
                      <TableCell className="font-mono font-medium">{device.id}</TableCell>
                      <TableCell className="text-sm">{device.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          {device.type === "board" ? <Server className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                          {deviceTypeLabel[device.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{device.ip}</TableCell>
                      <TableCell className="font-mono text-xs">{device.mac}</TableCell>
                      <TableCell className="font-mono text-xs">{device.server}</TableCell>
                      <TableCell className="text-xs">{renderValue(device.osVersion)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={device.cpu} className="w-12 h-1.5" />
                          <span className={`text-xs font-mono ${renderCpuWarning(device.cpu) ? "text-threshold-danger font-bold" : ""}`}>
                            {device.status === "offline" && device.cpu === 0 ? <span className="text-muted-foreground">-</span> : <>{device.cpu}%</>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={device.memory} className="w-12 h-1.5" />
                          <span className={`text-xs font-mono ${renderMemWarning(device.memory) ? "text-threshold-danger font-bold" : ""}`}>
                            {device.status === "offline" && device.memory === 0 ? <span className="text-muted-foreground">-</span> : <>{device.memory}%</>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs font-mono ${renderTempWarning(device.temperature) ? "text-threshold-danger font-bold" : ""}`}>
                          {device.status === "offline" && device.temperature < 25 ? <span className="text-muted-foreground">-</span> : <>{device.temperature}°C</>}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`text-xs font-mono font-medium hover:underline cursor-pointer ${device.activeSlots >= device.totalSlots ? "text-threshold-danger" : "text-primary"}`}
                              onClick={() => navigate(`/devices/virtual?deviceId=${device.id}`)}
                            >
                              {device.activeSlots}/{device.totalSlots}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>点击查看该设备关联的虚拟实例</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-white ${statusConfig[device.status].colorClass}`}>
                              {statusConfig[device.status].label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{statusConfig[device.status].tooltip}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-xs">{renderValue(device.operator)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowDetail(device)}><Eye className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>详情</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>编辑</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>远程重启</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><FileText className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>日志</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setShowDeleteAlert(device.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TooltipTrigger><TooltipContent>删除</TooltipContent></Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedDevices.map((device) => {
              const devInstances = virtualInstances.filter(i => i.hostServerId === device.id);
              const activeInstances = devInstances.filter(i => i.status === "running" || i.status === "warming");
              return (
                <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetail(device)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${statusConfig[device.status].colorClass}`}>
                              {statusConfig[device.status].label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{statusConfig[device.status].tooltip}</TooltipContent>
                        </Tooltip>
                        <span className="font-mono font-medium text-sm">{device.id}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {device.type === "board" ? <Server className="h-3 w-3 mr-0.5" /> : <Monitor className="h-3 w-3 mr-0.5" />}
                          {deviceTypeLabel[device.type]}
                        </Badge>
                      </div>
                      <span className={`text-xs font-mono font-medium ${activeInstances.length >= device.totalSlots ? "text-threshold-danger" : "text-muted-foreground"}`}>
                        {activeInstances.length}/{device.totalSlots} 活跃
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                      <p>{device.name} · 服务器: {device.server}</p>
                      <p>
                        CPU: <span className={renderCpuWarning(device.cpu) ? "text-threshold-danger font-bold" : ""}>{device.cpu}%</span>
                        {" · "}内存: <span className={renderMemWarning(device.memory) ? "text-threshold-danger font-bold" : ""}>{device.memory}%</span>
                        {" · "}温度: <span className={renderTempWarning(device.temperature) ? "text-threshold-danger font-bold" : ""}>{device.temperature}°C</span>
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: Math.min(device.totalSlots, 20) }).map((_, i) => {
                        const inst = activeInstances[i];
                        return (
                          <div key={i} className={`h-8 rounded-md border flex items-center justify-center text-[10px] font-mono ${device.totalSlots > 10 ? "w-8" : "flex-1"} ${inst ? "border-primary/50 bg-accent" : "border-dashed border-muted-foreground/20"}`}>
                            {inst ? inst.id.split("-")[1] : ""}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>共 {filteredDevices.length} 条记录</span>
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

        {/* Add Device Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增物理设备</DialogTitle>
              <DialogDescription>登记新的ARM主板或Windows主机信息</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>设备类型</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">ARM主板</SelectItem>
                    <SelectItem value="windows">Windows主机</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>设备ID</Label><Input placeholder="DEV-010" /></div>
                <div className="space-y-2"><Label>设备名称</Label><Input placeholder="ARM主板-A10" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>IP地址</Label><Input placeholder="192.168.1.107" /></div>
                <div className="space-y-2"><Label>MAC地址</Label><Input placeholder="AA:BB:CC:DD:EE:07" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>所属服务器</Label><Input placeholder="10.0.1.10" /></div>
                <div className="space-y-2"><Label>系统版本</Label><Input placeholder="Android 12" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>运维负责人</Label><Input placeholder="张伟" /></div>
                <div className="space-y-2"><Label>最大并发数</Label><Input placeholder="主板默认4，Windows默认20" type="number" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
              <Button onClick={() => setShowAddDialog(false)}>确认添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Import Dialog */}
        <Dialog open={showBatchImport} onOpenChange={setShowBatchImport}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>批量导入设备</DialogTitle>
              <DialogDescription>下载模版文件，按格式填写后上传导入</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>1. 下载导入模版</Label>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  下载模版文件（.xlsx）
                </Button>
                <p className="text-xs text-muted-foreground">模版包含：设备ID、名称、类型、IP、MAC、所属服务器、系统版本、运维负责人、最大并发数</p>
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
              <Button onClick={() => { setShowBatchImport(false); setBatchImportText(""); }}>确认导入</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Sheet */}
        <Sheet open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>设备详情 - {showDetail?.id}</SheetTitle>
              <SheetDescription>
                {showDetail?.name} · {showDetail && deviceTypeLabel[showDetail.type]} · {showDetail?.server}
              </SheetDescription>
            </SheetHeader>
            {showDetail && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">IP地址：</span>{showDetail.ip}</div>
                  <div><span className="text-muted-foreground">MAC：</span>{showDetail.mac}</div>
                  <div><span className="text-muted-foreground">系统版本：</span>{showDetail.osVersion}</div>
                  <div><span className="text-muted-foreground">运维负责人：</span>{showDetail.operator}</div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">状态：</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-white ml-1 ${statusConfig[showDetail.status].colorClass}`}>
                      {statusConfig[showDetail.status].label}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">CPU (%)</p><p className={`text-lg font-bold ${renderCpuWarning(showDetail.cpu) ? "text-threshold-danger" : ""}`}>{showDetail.cpu}%</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">内存 (%)</p><p className={`text-lg font-bold ${renderMemWarning(showDetail.memory) ? "text-threshold-danger" : ""}`}>{showDetail.memory}%</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">温度 (°C)</p><p className={`text-lg font-bold ${renderTempWarning(showDetail.temperature) ? "text-threshold-danger" : ""}`}>{showDetail.temperature}°C</p></CardContent></Card>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                     {showDetail.type === "board" ? "镜像模版概览" : "虚拟机概览"} ({virtualInstances.filter(i => i.hostServerId === showDetail.id).length}个)
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {virtualInstances.filter(i => i.hostServerId === showDetail.id).map((inst) => (
                      <div key={inst.id} className="p-2 rounded-lg border text-center text-xs">
                        <HardDrive className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-mono">{inst.id}</p>
                        <Badge variant="outline" className="text-[9px] mt-1">
                          {inst.status === "running" ? "运行" : inst.status === "idle" ? "空闲" : inst.status === "warming" ? "预热" : inst.status === "error" ? "异常" : "离线"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">活跃插槽 ({showDetail.activeSlots}/{showDetail.totalSlots})</h4>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: Math.min(showDetail.totalSlots, 20) }).map((_, i) => (
                      <div key={i} className={`h-6 rounded flex items-center justify-center text-[10px] font-medium ${showDetail.totalSlots > 10 ? "w-8" : "flex-1"} ${i < showDetail.activeSlots ? "border-primary bg-accent text-accent-foreground border" : "border border-dashed border-muted-foreground/30 text-muted-foreground"}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirm */}
        <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除设备？</AlertDialogTitle>
              <AlertDialogDescription>删除设备 {showDeleteAlert} 后将无法恢复，该设备下所有实例将被释放。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => showDeleteAlert && handleDelete(showDeleteAlert)}>确认删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Batch Delete Confirm */}
        <AlertDialog open={showBatchDeleteAlert} onOpenChange={setShowBatchDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认批量删除？</AlertDialogTitle>
              <AlertDialogDescription>将删除已选中的 {selectedIds.size} 台设备，操作不可恢复。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleBatchDelete}>确认删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
