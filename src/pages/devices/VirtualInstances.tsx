import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { virtualInstances, physicalDevices, romImages, proxyItems, hostServers, type VirtualInstance, type InstanceStatus, type VirtualDeviceType } from "@/data/mock-data";
import { initialDrives as cloudDriveData } from "@/pages/devices/CloudDrive";
import { LayoutGrid, List, Play, Square, MonitorSmartphone, RotateCcw, RefreshCw, Smartphone, Globe, Plus, Search, ChevronLeft, ChevronRight, HardDrive, AlertTriangle, MoreHorizontal, Pencil, Info, ArrowUpCircle, Link2, ChevronDown, Copy, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface EnvVariable {
  id: string;
  name: string;
  value: string;
  nameError?: string;
}

const statusLabel: Record<InstanceStatus, string> = { offline: "离线", idle: "空闲", warming: "预热中", running: "运行中", error: "异常" };
const statusConfig: Record<InstanceStatus, { colorClass: string; tooltip: string }> = {
  offline: { colorClass: "bg-status-offline", tooltip: "实例离线" },
  idle: { colorClass: "bg-muted-foreground", tooltip: "空闲等待任务" },
  warming: { colorClass: "bg-status-abnormal", tooltip: "预热中" },
  running: { colorClass: "bg-status-online", tooltip: "正在运行" },
  error: { colorClass: "bg-destructive", tooltip: "运行异常" },
};
const typeLabel: Record<VirtualDeviceType, string> = { cloud: "云机", windows: "Windows", linux: "Linux" };

const PAGE_SIZES = [10, 20, 50];

export default function VirtualInstances() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [instances] = useState(virtualInstances);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFingerprint, setShowFingerprint] = useState<VirtualInstance | null>(null);
  const [showRemoteControl, setShowRemoteControl] = useState<VirtualInstance | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<VirtualInstance | null>(null);
  const [showChangeIp, setShowChangeIp] = useState<VirtualInstance | null>(null);
  const [showMountDrive, setShowMountDrive] = useState<VirtualInstance | null>(null);
  const [mountDriveId, setMountDriveId] = useState("");
  const [mountAutoStart, setMountAutoStart] = useState(true);
  const [detailEnvVars, setDetailEnvVars] = useState<EnvVariable[]>([
    { id: "1", name: "AIC_DISPLAY", value: "720x1280" },
  ]);


  // New dialog states
  const [showEdit, setShowEdit] = useState<VirtualInstance | null>(null);
  const [editRemark, setEditRemark] = useState("");
  const [showRestart, setShowRestart] = useState<VirtualInstance | null>(null);
  const [resetKeepApps, setResetKeepApps] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState<VirtualInstance | null>(null);
  const [upgradeModifyLayout, setUpgradeModifyLayout] = useState(false);
  const [upgradeClearData, setUpgradeClearData] = useState(false);
  const [upgradeAfterStatus, setUpgradeAfterStatus] = useState("start");
  const [showConnectionInfo, setShowConnectionInfo] = useState<VirtualInstance | null>(null);
  const [showDetail, setShowDetail] = useState<VirtualInstance | null>(null);

  const availableCloudDrives = cloudDriveData.filter(d => d.status === "available");

  const filtered = useMemo(() => {
    return instances.filter(i => {
      if (filterType !== "all" && i.type !== filterType) return false;
      if (filterStatus !== "all" && i.status !== filterStatus) return false;
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        if (!i.id.toLowerCase().includes(q) && !i.name.toLowerCase().includes(q) && !i.model.toLowerCase().includes(q) && !i.hostServerId.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [instances, filterType, filterStatus, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedInstances = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getHostServerName = (inst: VirtualInstance) => {
    const srv = hostServers.find(s => s.id === inst.hostServerId);
    return srv ? `${srv.name}` : inst.hostServerId.slice(0, 8);
  };

  const getImageName = (inst: VirtualInstance) => {
    const img = romImages.find(r => r.id === inst.imageId);
    return img ? img.name : "-";
  };

  const getAvailableIps = () => proxyItems.filter(p => p.virtualDeviceIds.length === 0 && p.status === "available");

  // Mock connection info
  const getConnectionInfo = (inst: VirtualInstance) => ({
    ip: "172.31.11.92",
    port: "2226",
    username: `172.31.50.51_22_115_${Date.now()}`,
    password: "eyJtZXRhIjoiZXlKaVlXTmxJam9pZDJGcEpam9pZDNNcS0xMjIz",
    expiry: "2026-04-08 03:31:39",
    sshCommand: `ssh 172.31.50.51_22_115_${Date.now()}@172.31.11.92 -p 2226`,
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const addEnvVar = (setter: React.Dispatch<React.SetStateAction<EnvVariable[]>>) => {
    setter(prev => [...prev, { id: String(Date.now()), name: "", value: "", nameError: "" }]);
  };

  const removeEnvVar = (setter: React.Dispatch<React.SetStateAction<EnvVariable[]>>, id: string) => {
    setter(prev => prev.filter(v => v.id !== id));
  };

  const updateEnvVar = (setter: React.Dispatch<React.SetStateAction<EnvVariable[]>>, id: string, field: "name" | "value", val: string) => {
    setter(prev => prev.map(v => v.id === id ? { ...v, [field]: val, nameError: field === "name" && !val.trim() ? "请输入变量名称" : "" } : v));
  };

  const EnvVarSection = ({ envVars, setEnvVars }: { envVars: EnvVariable[]; setEnvVars: React.Dispatch<React.SetStateAction<EnvVariable[]>> }) => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-primary">android实例高级设置(环境变量、开发模式)</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="font-medium">环境变量</Label>
          <Button size="sm" onClick={() => addEnvVar(setEnvVars)}>
            <Plus className="h-3.5 w-3.5 mr-1" />新增变量
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              以AIC_开头的环境变量，系统默认会转化ro.aic.*属性进行设置
            </TooltipContent>
          </Tooltip>
        </div>
        {envVars.map(ev => (
          <div key={ev.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="请输入变量名称"
                  value={ev.name}
                  onChange={e => updateEnvVar(setEnvVars, ev.id, "name", e.target.value)}
                  className={ev.nameError ? "border-destructive" : ""}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="请输入变量值"
                  value={ev.value}
                  onChange={e => updateEnvVar(setEnvVars, ev.id, "value", e.target.value)}
                />
              </div>
              <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeEnvVar(setEnvVars, ev.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {ev.nameError && <p className="text-xs text-destructive">{ev.nameError}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">虚拟机管理</h1>
          <p className="text-sm text-muted-foreground mt-1">统一管理云机与Windows虚拟机实例的生命周期</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/devices/virtual/create")}>
            <Plus className="h-4 w-4 mr-1" />创建虚拟机
          </Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("table")}><List className="h-4 w-4" /></Button>
          <Button variant={viewMode === "card" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("card")}><LayoutGrid className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="搜索虚拟机ID/名称/主机ID..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="虚拟机类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="cloud">云机</SelectItem>
            <SelectItem value="windows">Windows</SelectItem>
            <SelectItem value="linux">Linux</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="running">运行中</SelectItem>
            <SelectItem value="idle">空闲</SelectItem>
            <SelectItem value="warming">预热中</SelectItem>
            <SelectItem value="error">异常</SelectItem>
            <SelectItem value="offline">离线</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">虚拟机ID</TableHead>
                  <TableHead className="whitespace-nowrap">虚拟机名称</TableHead>
                  <TableHead className="whitespace-nowrap">虚拟机类型</TableHead>
                  <TableHead className="whitespace-nowrap">所属主机ID</TableHead>
                  <TableHead className="whitespace-nowrap">镜像模版</TableHead>
                  <TableHead className="whitespace-nowrap">部署时间</TableHead>
                  <TableHead className="whitespace-nowrap">CPU核数</TableHead>
                  <TableHead className="whitespace-nowrap">CPU (%)</TableHead>
                  <TableHead className="whitespace-nowrap">内存 (GB)</TableHead>
                  <TableHead className="whitespace-nowrap">磁盘 (TB)</TableHead>
                  <TableHead className="whitespace-nowrap">操作系统版本</TableHead>
                  <TableHead className="whitespace-nowrap">代理IP</TableHead>
                  <TableHead className="whitespace-nowrap text-center">状态</TableHead>
                  <TableHead className="whitespace-nowrap">运行时长</TableHead>
                  <TableHead className="whitespace-nowrap">自动重启</TableHead>
                  <TableHead className="whitespace-nowrap">备注</TableHead>
                  <TableHead className="whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedInstances.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-mono font-medium text-xs whitespace-nowrap">{inst.id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={inst.type === "cloud" ? "default" : inst.type === "linux" ? "outline" : "secondary"} className="text-[10px] gap-1">
                        {inst.type === "cloud" ? <Smartphone className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {typeLabel[inst.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{inst.hostServerId.slice(0, 8)}...</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{getImageName(inst)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.deployedAt}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-center">{inst.cpuCores}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.cpuUsage}%</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.memoryUsed}/{inst.memoryTotal}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.diskUsed}/{inst.diskTotal}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.osVersion}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{inst.proxyIp || "-"}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-white whitespace-nowrap ${statusConfig[inst.status].colorClass}`}>
                            {statusLabel[inst.status]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{statusConfig[inst.status].tooltip}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{inst.uptime}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-center">{inst.autoRestart ? "是" : "否"}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap max-w-[120px] truncate">{inst.remark || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5 items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowRemoteControl(inst)} disabled={inst.status !== "running"}>
                              <MonitorSmartphone className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>远程控制</TooltipContent>
                        </Tooltip>
                        {inst.status === "idle" || inst.status === "offline" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-success"><Play className="h-3.5 w-3.5" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>启动</TooltipContent>
                          </Tooltip>
                        ) : inst.status === "running" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Square className="h-3.5 w-3.5" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>停止</TooltipContent>
                          </Tooltip>
                        ) : null}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowChangeIp(inst)}>
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>换绑IP</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMountDriveId(""); setMountAutoStart(true); setShowMountDrive(inst); }}>
                              <HardDrive className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>挂载镜像实例</TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowDetail(inst)}>
                              <Info className="h-3.5 w-3.5 mr-2" />详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditRemark(""); setShowEdit(inst); }}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowRestart(inst)}>
                              <RotateCcw className="h-3.5 w-3.5 mr-2" />重启
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setResetKeepApps(false); setShowResetConfirm(inst); }}>
                              <RefreshCw className="h-3.5 w-3.5 mr-2" />重置
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setUpgradeModifyLayout(false); setUpgradeClearData(false); setUpgradeAfterStatus("start"); setShowUpgrade(inst); }}>
                              <ArrowUpCircle className="h-3.5 w-3.5 mr-2" />升级
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowConnectionInfo(inst)}>
                              <Link2 className="h-3.5 w-3.5 mr-2" />连接信息
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pagedInstances.map((inst) => (
            <Card key={inst.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetail(inst)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-medium">{inst.id}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${statusConfig[inst.status].colorClass}`}>
                        {statusLabel[inst.status]}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{statusConfig[inst.status].tooltip}</TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant={inst.type === "cloud" ? "default" : "secondary"} className="text-[9px] mb-2">{typeLabel[inst.type]}</Badge>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>名称: {inst.name}</p>
                  <p>镜像模版: {getImageName(inst)}</p>
                  <p>主机: {getHostServerName(inst)}</p>
                  <p>OS: {inst.osVersion}</p>
                  <p>代理: {inst.proxyIp || "无"}</p>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] flex-1" onClick={(e) => { e.stopPropagation(); setShowRemoteControl(inst); }} disabled={inst.status !== "running"}>
                    <MonitorSmartphone className="h-3 w-3 mr-1" />控制
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filtered.length} 条记录</span>
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


      {/* 详情弹窗 - 带标签页 */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>虚拟机</span>
              <ChevronRight className="h-3 w-3" />
              <span>{showDetail?.id}</span>
            </div>
            <DialogTitle className="flex items-center justify-between">
              <span>{showDetail?.id}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">虚拟机详情</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">总览</TabsTrigger>
                <TabsTrigger value="tasks">任务详情</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* 基本信息 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>基本信息</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">虚拟机ID</span><span className="font-mono text-xs">{showDetail.id}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">虚拟机名称</span><span>{showDetail.name}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属主机</span><span>{getHostServerName(showDetail)}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">镜像模版</span><span>{getImageName(showDetail)}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">板卡规格</span><span>Orion865 | 8vCPU | 12G内存 | 256G存储</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">操作系统</span><span>Android10</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">状态</span><Badge variant={showDetail.status === "running" ? "default" : "secondary"}>{statusLabel[showDetail.status]}</Badge></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">Release状态</span><Badge variant="outline" className="text-green-600 border-green-300">Ready</Badge></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">标签</span><span>-</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">限速</span><span>上行: - / 下行: -</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">SoC类型</span><span>Orion865</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">虚拟机规格</span><span>四开 | 2 vCPU | 3GB内存</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">IP地址</span><span className="font-mono">{showDetail.proxyIp || "172.31.50.45"}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">环境变量</span><span>{detailEnvVars.length > 0 ? detailEnvVars.map(v => `${v.name}=${v.value}`).join(", ") : "-"}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">网络类型</span><span>macvlan</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">NAT类型</span><span>DNAT</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">创建时间</span><span>2026-04-03 12:18:25</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">更新时间</span><span>{showDetail.lastActive}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">备注</span><span>-</span></div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 屏幕布局 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>屏幕布局</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">屏幕宽度</span><span>720px</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">屏幕高度</span><span>1280px</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">屏幕刷新率</span><span>30fps</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">像素密度</span><span>320dpi</span></div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 配置信息 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>配置信息</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属板卡ID</span><span className="font-mono text-xs">4e722b952ef72ea5913d65791f62248c</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属板卡IP</span><span className="font-mono text-primary">172.31.20.22</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属服务器IP</span><span className="font-mono text-primary">172.31.14.10</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属板卡SN</span><span className="font-mono text-primary">OR65M62X02S243000253</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属区域</span><span className="text-primary">西南</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground min-w-[70px]">所属节点</span><span className="text-primary">yaan-test</span></div>
                      <div className="flex gap-2 col-span-3"><span className="text-muted-foreground min-w-[70px]">所属服务器</span><span className="font-mono text-primary text-xs">{showDetail.hostServerId}</span></div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 公网配置信息 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>公网配置信息</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">SNAT</p>
                      <p className="font-medium">DNAT</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">运营商</TableHead>
                            <TableHead className="text-xs">公网IP</TableHead>
                            <TableHead className="text-xs">公网端口</TableHead>
                            <TableHead className="text-xs">内网IP</TableHead>
                            <TableHead className="text-xs">内网端口</TableHead>
                            <TableHead className="text-xs">协议</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-4">暂无数据</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 存储 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>存储</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">名称</TableHead>
                          <TableHead className="text-xs">ID</TableHead>
                          <TableHead className="text-xs">状态</TableHead>
                          <TableHead className="text-xs">类型</TableHead>
                          <TableHead className="text-xs">容量</TableHead>
                          <TableHead className="text-xs">挂载目录</TableHead>
                          <TableHead className="text-xs">备注</TableHead>
                          <TableHead className="text-xs">创建时间</TableHead>
                          <TableHead className="text-xs">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground text-xs py-4">暂无数据</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                </Collapsible>

                {/* 环境变量 */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-sm border-b">
                    <span>环境变量</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <EnvVarSection envVars={detailEnvVars} setEnvVars={setDetailEnvVars} />
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="全部" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
                      <SelectItem value="failed">失败</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input className="h-8 text-xs w-64" placeholder="支持多个条件组合搜索..." />
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Search className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">序号</TableHead>
                      <TableHead className="text-xs">子任务ID</TableHead>
                      <TableHead className="text-xs">任务类型</TableHead>
                      <TableHead className="text-xs">来源</TableHead>
                      <TableHead className="text-xs">状态</TableHead>
                      <TableHead className="text-xs">原因</TableHead>
                      <TableHead className="text-xs">执行时间</TableHead>
                      <TableHead className="text-xs">开始时间</TableHead>
                      <TableHead className="text-xs">结束时间</TableHead>
                      <TableHead className="text-xs">操作员</TableHead>
                      <TableHead className="text-xs">日志</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 1, taskId: "9238f0dc4be4c1089066d64b058ea50", type: "挂载镜像实例", source: "web", status: "失败", reason: '{"armCardIp":"172.31.20.22","code":500...}', duration: "00:03", start: "2026-04-07 10:57:37", end: "2026-04-07 10:57:40", operator: "chenrong" },
                      { id: 2, taskId: "a903eb51a4be405b8e6506f4cfa5fbb6", type: "挂载镜像实例", source: "web", status: "失败", reason: '{"armCardIp":"172.31.20.22","code":500...}', duration: "00:03", start: "2026-04-03 16:08:35", end: "2026-04-03 16:08:38", operator: "bxp" },
                      { id: 3, taskId: "ad515af9925244d3a1858877c586ad05", type: "重启虚拟机", source: "web", status: "失败", reason: '{"code":560016,"message":"实例重启失败..."}', duration: "00:11", start: "2026-04-03 16:08:22", end: "2026-04-03 16:08:33", operator: "bxp" },
                    ].map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="text-xs">{task.id}</TableCell>
                        <TableCell className="text-xs font-mono text-primary">{task.taskId.slice(0, 20)}...</TableCell>
                        <TableCell className="text-xs">{task.type}</TableCell>
                        <TableCell className="text-xs">{task.source}</TableCell>
                        <TableCell><Badge variant="destructive" className="text-[10px]">失败</Badge></TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{task.reason}</TableCell>
                        <TableCell className="text-xs">{task.duration}</TableCell>
                        <TableCell className="text-xs">{task.start}</TableCell>
                        <TableCell className="text-xs">{task.end}</TableCell>
                        <TableCell className="text-xs">{task.operator}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">-</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑虚拟机弹窗 */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑虚拟机</DialogTitle>
            <DialogDescription className="sr-only">编辑虚拟机备注信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-4 items-start">
              <Label className="mt-2 min-w-[40px]">备注</Label>
              <Textarea placeholder="请输入备注" value={editRemark} onChange={e => setEditRemark(e.target.value)} className="min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(null)}>取 消</Button>
            <Button onClick={() => { toast.success("编辑成功"); setShowEdit(null); }}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重启确认弹窗 */}
      <Dialog open={!!showRestart} onOpenChange={() => setShowRestart(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确定要重启虚拟机？</DialogTitle>
            <DialogDescription className="sr-only">重启虚拟机确认</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 font-medium">确定要重启虚拟机？</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">已选择 1 项</p>
            <Input value={showRestart?.id || ""} disabled className="bg-muted" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestart(null)}>取 消</Button>
            <Button onClick={() => { toast.success("重启指令已发送"); setShowRestart(null); }}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置确认弹窗 */}
      <Dialog open={!!showResetConfirm} onOpenChange={() => setShowResetConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>重置</DialogTitle>
            <DialogDescription className="sr-only">重置虚拟机确认</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 font-medium">重置虚拟机默认会清理全部数据，请谨慎操作！</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">已选择 1 项</p>
            <Input value={showResetConfirm?.id || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="keep-apps" checked={resetKeepApps} onCheckedChange={(v) => setResetKeepApps(!!v)} />
              <label htmlFor="keep-apps" className="text-sm cursor-pointer">保留预安装应用保留策略</label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">如果选择保留预安装应用数据，则只清理第三方应用。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(null)}>取 消</Button>
            <Button onClick={() => { toast.success("重置指令已发送"); setShowResetConfirm(null); }}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 升级弹窗 */}
      <Dialog open={!!showUpgrade} onOpenChange={() => setShowUpgrade(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>虚拟机镜像模版升级</DialogTitle>
            <DialogDescription className="sr-only">升级虚拟机镜像模版</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 font-medium">1、需要先将镜像模版同步至节点，镜像文件才可用。</AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">已选择 1 项</p>
              <Input value={showUpgrade?.id || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label><span className="text-destructive mr-0.5">*</span>镜像模版</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="请选择镜像模版" /></SelectTrigger>
                <SelectContent>
                  {romImages.filter(r => r.imageStatus === "normal").map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.name} ({img.version})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="modify-layout" checked={upgradeModifyLayout} onCheckedChange={(v) => setUpgradeModifyLayout(!!v)} />
              <label htmlFor="modify-layout" className="text-sm cursor-pointer">修改屏幕布局</label>
            </div>
            {upgradeModifyLayout && (
              <div className="space-y-2">
                <Label><span className="text-destructive mr-0.5">*</span>自定义屏幕布局</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="请选择屏幕布局" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720x1280">720×1280</SelectItem>
                    <SelectItem value="1080x1920">1080×1920</SelectItem>
                    <SelectItem value="1080x2400">1080×2400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox id="clear-data" checked={upgradeClearData} onCheckedChange={(v) => setUpgradeClearData(!!v)} />
              <label htmlFor="clear-data" className="text-sm cursor-pointer">是否清空实例数据</label>
            </div>
            <div className="flex items-center gap-4">
              <Label>升级后虚拟机状态</Label>
              <RadioGroup value={upgradeAfterStatus} onValueChange={setUpgradeAfterStatus} className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="start" id="upgrade-start" />
                  <label htmlFor="upgrade-start" className="text-sm text-primary cursor-pointer">启动</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="keep" id="upgrade-keep" />
                  <label htmlFor="upgrade-keep" className="text-sm cursor-pointer">保持原状态</label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgrade(null)}>取 消</Button>
            <Button onClick={() => { toast.success("升级指令已发送"); setShowUpgrade(null); }}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 连接信息弹窗 */}
      <Dialog open={!!showConnectionInfo} onOpenChange={() => setShowConnectionInfo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>连接信息</DialogTitle>
            <DialogDescription className="sr-only">虚拟机连接信息</DialogDescription>
          </DialogHeader>
          {showConnectionInfo && (() => {
            const info = getConnectionInfo(showConnectionInfo);
            return (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground min-w-[60px]">IP</span>
                    <span className="font-semibold font-mono">{info.ip}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground min-w-[60px]">端口</span>
                    <span className="font-semibold font-mono">{info.port}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground min-w-[60px]">用户名</span>
                    <span className="font-mono text-sm break-all">{info.username}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground min-w-[60px]">密码</span>
                    <span className="font-mono text-sm break-all">{info.password}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground min-w-[60px]">到期时间</span>
                    <span>{info.expiry}</span>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={() => handleCopyText(`IP: ${info.ip}\n端口: ${info.port}\n用户名: ${info.username}\n密码: ${info.password}`)}>
                      <Copy className="h-4 w-4 mr-1" />一键复制
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-muted-foreground min-w-[60px]">连接命令</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-primary">{info.sshCommand}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyText(info.sshCommand)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* 指纹详情弹窗 (legacy) */}
      <Dialog open={!!showFingerprint} onOpenChange={() => setShowFingerprint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设备指纹详情 - {showFingerprint?.id}</DialogTitle>
            <DialogDescription>该实例的完整硬件环境参数</DialogDescription>
          </DialogHeader>
          {showFingerprint && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["类型", typeLabel[showFingerprint.type]],
                ["所属主机", getHostServerName(showFingerprint)],
                ...(showFingerprint.type === "cloud" ? [["IMEI", showFingerprint.imei], ["Android ID", showFingerprint.androidId]] : []),
                ["机型/内核", showFingerprint.model],
                ["操作系统版本", showFingerprint.osVersion],
                ["代理IP", showFingerprint.proxyIp || "无"],
                ["最后活跃", showFingerprint.lastActive],
              ].map(([label, value]) => (
                <div key={label as string} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 远程控制弹窗 */}
      <Dialog open={!!showRemoteControl} onOpenChange={() => setShowRemoteControl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" />
              远程控制 - {showRemoteControl?.id}
              <Badge variant={showRemoteControl?.type === "cloud" ? "default" : "secondary"} className="text-[10px]">
                {showRemoteControl && typeLabel[showRemoteControl.type]}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {showRemoteControl?.type === "cloud" ? "Android云机实时画面 (ADB)" : "Windows实时画面 (VNC)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 ${showRemoteControl?.type === "cloud" ? "aspect-[9/16] max-h-[500px] mx-auto w-[280px]" : "aspect-video w-full"}`}>
              <div className="text-center text-muted-foreground">
                <MonitorSmartphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {showRemoteControl?.type === "cloud" ? "Android 实时画面" : "Windows桌面画面"}
                </p>
                <p className="text-xs mt-1">WebRTC 流连接中...</p>
                <p className="text-xs mt-1 font-mono">{showRemoteControl?.model} · {showRemoteControl?.proxyIp}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {showRemoteControl?.type === "cloud" ? (
                <>
                  <Button size="sm" variant="outline">返回</Button>
                  <Button size="sm" variant="outline">主页</Button>
                  <Button size="sm" variant="outline">多任务</Button>
                  <Button size="sm" variant="outline">截屏</Button>
                  <Button size="sm" variant="outline">输入文本</Button>
                  <Button size="sm" variant="outline">上滑</Button>
                  <Button size="sm" variant="outline">下滑</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline">刷新页面</Button>
                  <Button size="sm" variant="outline">新建标签</Button>
                  <Button size="sm" variant="outline">截屏</Button>
                  <Button size="sm" variant="outline">输入文本</Button>
                  <Button size="sm" variant="outline">清除缓存</Button>
                  <Button size="sm" variant="outline">切换代理</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 换绑IP弹窗 */}
      <Dialog open={!!showChangeIp} onOpenChange={() => setShowChangeIp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>换绑IP - {showChangeIp?.id}</DialogTitle>
            <DialogDescription>当前IP: {showChangeIp?.proxyIp || "无"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">选择新的代理IP</p>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择可用代理" /></SelectTrigger>
                <SelectContent>
                  {getAvailableIps().map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.ip}:{p.port} ({p.protocol}) · {p.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChangeIp(null)}>取消</Button>
              <Button onClick={() => setShowChangeIp(null)}>确认换绑</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 挂载镜像实例弹窗 */}
      <Dialog open={!!showMountDrive} onOpenChange={() => setShowMountDrive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>挂载镜像实例</DialogTitle>
            <DialogDescription className="sr-only">为虚拟机挂载镜像实例</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>存储类型为镜像实例的虚拟机需要先挂载镜像实例才允许启动</AlertDescription>
          </Alert>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">已选择 1 项</Label>
              <Input value={showMountDrive?.id || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label><span className="text-destructive mr-0.5">*</span>挂载镜像实例</Label>
              <Select value={mountDriveId} onValueChange={setMountDriveId}>
                <SelectTrigger><SelectValue placeholder="请选择镜像实例" /></SelectTrigger>
                <SelectContent>
                  {availableCloudDrives.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.capacity}GB · {d.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="auto-start" checked={mountAutoStart} onCheckedChange={(v) => setMountAutoStart(!!v)} />
              <label htmlFor="auto-start" className="text-sm text-primary cursor-pointer">挂载镜像实例后立即启动虚拟机</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMountDrive(null)}>取消</Button>
            <Button onClick={() => setShowMountDrive(null)} disabled={!mountDriveId}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}