import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, ChevronLeft, ChevronRight, RotateCcw, MoreHorizontal, AlertTriangle, Copy, Tag, ArrowLeft, Minus, Network, Cpu } from "lucide-react";
import { mockTags } from "@/pages/devices/TagManagement";
import { toast } from "sonner";

// Mock board card data
interface BoardCard {
  id: string;
  uuid: string;
  name: string;
  sn: string;
  type: string;
  spec: string;
  os: string;
  runStatus: "正常" | "异常";
  taskStatus: "空闲" | "运行中";
  containerSpec: string;
  containerCount: number;
  overQuota: boolean;
  speedLimit: { up: string; down: string };
  ip: string;
  cpuModel: string;
  releaseStatus: "Ready" | "Not Ready";
  tags: string[];
  createdAt: string;
  romVersion: string;
}

const mockBoardCards: BoardCard[] = Array.from({ length: 24 }, (_, i) => ({
  id: `bc-${i + 1}`,
  uuid: `${Math.random().toString(16).slice(2, 14)}...`,
  name: i === 2 ? "DEV-and..." : i === 3 ? "Dev-and..." : `test${i === 0 ? "_13" : i === 1 ? "_13-1" : `-${i}`}`,
  sn: `OR65M2X02S2...`,
  type: "ARM",
  spec: "Orion865 | 8 vCPU | 12GB内存 | 256G存储",
  os: "Android10",
  runStatus: "正常",
  taskStatus: "空闲",
  containerSpec: i === 3 ? "四开 | 2 vCPU | 3GB内存" : i <= 1 ? (i === 1 ? "二开-限存储 | 4 vCPU | 6GB内存 | 100G" : "-") : "二开 | 4 vCPU | 6GB内存",
  containerCount: i === 0 ? 0 : i === 2 || i === 3 ? 0 : i === 4 ? 4 : 2,
  overQuota: false,
  speedLimit: { up: "上行", down: "下行" },
  ip: `172.31.20.${24 - i}`,
  cpuModel: `865(XR2-0)`,
  releaseStatus: i <= 3 ? "Ready" : "Not Ready",
  tags: i % 5 === 0 ? [mockTags[1].name, mockTags[3].name] : i % 3 === 0 ? [mockTags[4].name] : i % 2 === 0 ? [mockTags[0].name] : [mockTags[2].name],
  createdAt: i <= 3 ? `2026-04-${String(7 - Math.floor(i / 2)).padStart(2, "0")} ${10 + i}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : `2026-03-19 14:39:38`,
  romVersion: `OR65L10CDA_V2.2.55_20250715_1708`,
}));

const PAGE_SIZES = [10, 20, 50];

type DialogType = "flash" | "reboot" | "ota" | "speedLimit" | "connectionInfo" | "release" | "powerOn" | "powerOff" | "deleteContainer" | "recycle" | "unsubscribe" | null;

export default function BoardCardManagement() {
  const [cards] = useState<BoardCard[]>(mockBoardCards);
  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [serverFilter, setServerFilter] = useState("yaan-test(24)");
  const [isBatch, setIsBatch] = useState(false);

  // Apply form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyName, setApplyName] = useState("");
  const [applyNode, setApplyNode] = useState("yaan-test");
  const [applyType, setApplyType] = useState<"板卡&虚拟机" | "裸板卡">("板卡&虚拟机");
  const [applySpec, setApplySpec] = useState("");
  const [applyOs, setApplyOs] = useState("");
  const [applySchedule, setApplySchedule] = useState<"不指定" | "指定服务器" | "指定板卡">("不指定");
  const [applyServer, setApplyServer] = useState("");
  const [applyBoardSn, setApplyBoardSn] = useState("");
  const [applyRomEnabled, setApplyRomEnabled] = useState(false);
  const [applyRomVersion, setApplyRomVersion] = useState("");
  const [applyCount, setApplyCount] = useState(1);
  const [applyTags, setApplyTags] = useState<string[]>([]);

  // Flash dialog state
  const [flashRom, setFlashRom] = useState("否");
  const [flashImage, setFlashImage] = useState("否");
  const [flashConfirm, setFlashConfirm] = useState(false);

  // OTA dialog state
  const [otaRom, setOtaRom] = useState("");
  const [otaRestart, setOtaRestart] = useState(true);
  const [otaRiskConfirm, setOtaRiskConfirm] = useState(false);

  // Speed limit state
  const [speedUp, setSpeedUp] = useState("");
  const [speedDown, setSpeedDown] = useState("");

  // Power off state
  const [powerOffConfirm, setPowerOffConfirm] = useState(false);

  // Recycle state
  const [deepRecycle, setDeepRecycle] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: cards.length,
    normal: cards.filter(c => c.runStatus === "正常").length,
    nmsOffline: 0,
    abnormal: 0,
  }), [cards]);

  const filteredCards = useMemo(() => {
    if (!searchText.trim()) return cards;
    const q = searchText.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(q) || c.uuid.includes(q) || c.ip.includes(q) || c.sn.includes(q));
  }, [cards, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const pagedCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageSelected = pagedCards.length > 0 && pagedCards.every(c => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    const newSet = new Set(selectedIds);
    if (allPageSelected) pagedCards.forEach(c => newSet.delete(c.id));
    else pagedCards.forEach(c => newSet.add(c.id));
    setSelectedIds(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const openDialog = (type: DialogType, card: BoardCard, batch = false) => {
    setSelectedCard(card);
    setActiveDialog(type);
    setIsBatch(batch);
    // Reset states
    setFlashRom("否"); setFlashImage("否"); setFlashConfirm(false);
    setOtaRom(""); setOtaRestart(true); setOtaRiskConfirm(false);
    setSpeedUp(""); setSpeedDown("");
    setPowerOffConfirm(false);
    setDeepRecycle(false);
  };

  const closeDialog = () => { setActiveDialog(null); setSelectedCard(null); setIsBatch(false); };

  // Batch operation helper
  const openBatchDialog = (type: DialogType) => {
    const firstId = Array.from(selectedIds)[0];
    const card = cards.find(c => c.id === firstId);
    if (card) openDialog(type, card, true);
  };

  const getSelectedNames = () => {
    return cards.filter(c => selectedIds.has(c.id)).map(c => c.name);
  };

  const dialogSelectedCount = isBatch ? selectedIds.size : 1;
  const dialogSelectedNames = isBatch ? getSelectedNames() : (selectedCard ? [selectedCard.name] : []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  // Selected items display for dialogs
  const renderSelectedItems = () => (
    <div>
      <p className="text-sm text-muted-foreground mb-1">已选择 {dialogSelectedCount} 项</p>
      <div className="border rounded-md p-3 text-sm bg-muted/30">
        {dialogSelectedNames.join("、")}
      </div>
    </div>
  );

  // Apply form view
  if (showApplyForm) {
    return (
      <div className="space-y-0">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowApplyForm(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">申请ARM板卡</h1>
        </div>
        <Card className="mt-4">
          <CardContent className="p-8 space-y-6">
            {/* 名称 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 名称</Label>
              <Input className="max-w-2xl" placeholder="请输入板卡名称" value={applyName} onChange={e => setApplyName(e.target.value)} />
            </div>
            {/* 节点 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 节点</Label>
              <Select value={applyNode} onValueChange={setApplyNode}>
                <SelectTrigger className="max-w-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yaan-test">yaan-test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 类型 */}
            <div className="flex items-start gap-4">
              <Label className="w-24 text-right text-sm shrink-0 mt-2"><span className="text-destructive">*</span> 类型</Label>
              <div className="flex gap-3">
                <button
                  className={`flex items-center gap-3 border-2 rounded-lg px-5 py-3 transition-colors ${applyType === "板卡&虚拟机" ? "border-primary bg-primary/5" : "border-border"}`}
                  onClick={() => setApplyType("板卡&虚拟机")}
                >
                  <Network className={`h-6 w-6 ${applyType === "板卡&虚拟机" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className={`text-sm font-medium ${applyType === "板卡&虚拟机" ? "text-primary" : ""}`}>板卡&虚拟机</div>
                    <div className={`text-xs ${applyType === "板卡&虚拟机" ? "text-primary/70" : "text-muted-foreground"}`}>由平台来进行虚拟机生命周期管理</div>
                  </div>
                </button>
                <button
                  className={`flex items-center gap-3 border-2 rounded-lg px-5 py-3 transition-colors ${applyType === "裸板卡" ? "border-primary bg-primary/5" : "border-border"}`}
                  onClick={() => setApplyType("裸板卡")}
                >
                  <Cpu className={`h-6 w-6 ${applyType === "裸板卡" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className={`text-sm font-medium ${applyType === "裸板卡" ? "text-primary" : ""}`}>裸板卡</div>
                    <div className={`text-xs ${applyType === "裸板卡" ? "text-primary/70" : "text-muted-foreground"}`}>不依赖平台自行进行虚拟机生命周期管理</div>
                  </div>
                </button>
              </div>
            </div>
            {/* 板卡规格 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 板卡规格</Label>
              <Select value={applySpec} onValueChange={setApplySpec}>
                <SelectTrigger className="max-w-2xl"><SelectValue placeholder="请选择板卡规格" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cruise10">Cruise10 | 8vCPU | 16G内存 | 256G存储</SelectItem>
                  <SelectItem value="orion865">Orion865 | 8vCPU | 12G内存 | 256G存储</SelectItem>
                  <SelectItem value="orion8g2">Orion8G2 | 8vCPU | 24G内存 | 256G存储</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 操作系统 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 操作系统</Label>
              <Select value={applyOs} onValueChange={setApplyOs}>
                <SelectTrigger className="max-w-2xl"><SelectValue placeholder="请选择操作系统" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="android10">Android 10</SelectItem>
                  <SelectItem value="android12">Android 12</SelectItem>
                  <SelectItem value="android14">Android 14</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 调度策略 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0">调度策略 ②</Label>
              <RadioGroup value={applySchedule} onValueChange={v => setApplySchedule(v as typeof applySchedule)} className="flex gap-4">
                <div className="flex items-center gap-1.5"><RadioGroupItem value="不指定" id="sch-none" /><Label htmlFor="sch-none" className="text-sm">不指定</Label></div>
                <div className="flex items-center gap-1.5"><RadioGroupItem value="指定服务器" id="sch-server" /><Label htmlFor="sch-server" className="text-sm">指定服务器</Label></div>
                <div className="flex items-center gap-1.5"><RadioGroupItem value="指定板卡" id="sch-board" /><Label htmlFor="sch-board" className="text-sm">指定板卡</Label></div>
              </RadioGroup>
            </div>
            {/* 指定服务器 (conditional) */}
            {applySchedule === "指定服务器" && (
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 指定服务器</Label>
                <Select value={applyServer} onValueChange={setApplyServer}>
                  <SelectTrigger className="max-w-2xl"><SelectValue placeholder="请选择服务器BMC的IP" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10.0.1.10">10.0.1.10</SelectItem>
                    <SelectItem value="10.0.1.11">10.0.1.11</SelectItem>
                    <SelectItem value="10.0.1.12">10.0.1.12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* 指定板卡 (conditional) */}
            {applySchedule === "指定板卡" && (
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 指定板卡</Label>
                <Input className="max-w-md" placeholder='输入板卡SN，多个请以","或者"|"分隔。最多输入1000个' value={applyBoardSn} onChange={e => setApplyBoardSn(e.target.value)} />
              </div>
            )}
            {/* 指定ROM */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0">指定ROM ②</Label>
              <div className="flex items-center gap-2">
                <Checkbox id="apply-rom" checked={applyRomEnabled} onCheckedChange={v => setApplyRomEnabled(!!v)} />
                <Label htmlFor="apply-rom" className={`text-sm ${applyRomEnabled ? "text-primary" : ""}`}>指定</Label>
              </div>
            </div>
            {/* ROM版本 (conditional) */}
            {applyRomEnabled && (
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right text-sm shrink-0">ROM版本</Label>
                <Select value={applyRomVersion} onValueChange={setApplyRomVersion}>
                  <SelectTrigger className="max-w-2xl"><SelectValue placeholder="请选择ROM版本" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v2.2.55">OR65L10CDA_V2.2.55_20250715_1708</SelectItem>
                    <SelectItem value="v2.3.00">OR65L10CDA_V2.3.00_20250801_1200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* 数量 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"><span className="text-destructive">*</span> 数量</Label>
              <div className="flex items-center gap-0">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setApplyCount(Math.max(1, applyCount - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <Input className="w-16 h-8 rounded-none text-center border-x-0" value={applyCount} onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 1) setApplyCount(v); }} />
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setApplyCount(applyCount + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0"></Label>
              <p className="text-xs text-destructive">请选择节点与板卡规格</p>
            </div>
            {/* 标签 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right text-sm shrink-0">标签</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="max-w-2xl w-full justify-start font-normal h-10">
                    {applyTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {applyTags.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">请选择标签</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  {mockTags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer" onClick={() => setApplyTags(prev => prev.includes(tag.name) ? prev.filter(t => t !== tag.name) : [...prev, tag.name])}>
                      <Checkbox checked={applyTags.includes(tag.name)} />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">
          <Button onClick={() => { toast.success("板卡申请已提交"); setShowApplyForm(false); }}>确 定</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ARM板卡管理</h1>
          <div className="flex items-center gap-4">
            {[
              { label: "总数", value: stats.total, color: "text-primary" },
              { label: "正常", value: stats.normal, color: "text-green-600" },
              { label: "NMS离线", value: stats.nmsOffline, color: "text-muted-foreground" },
              { label: "异常", value: stats.abnormal, color: "text-destructive" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={serverFilter} onValueChange={setServerFilter}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yaan-test(24)">yaan-test(24)</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={() => setShowApplyForm(true)}>
            <Plus className="h-4 w-4 mr-1" />申请板卡
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8" disabled={selectedIds.size === 0}>更多操作</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("flash")}>刷机恢复</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("reboot")}>重启</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("ota")}>OTA升级</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => toast.error("请先手动停止板卡上的虚拟机后再进行迁移！")}>迁移虚拟机</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("speedLimit")}>限速</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("connectionInfo")}>连接信息</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("release")}>Release资源</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("powerOn")}>上电</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("powerOff")}>下电</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("deleteContainer")} className="text-destructive">删除虚拟机</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("recycle")}>回收</DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} onClick={() => openBatchDialog("unsubscribe")}>退订</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">支持多个条件组合搜索，例如 IPs: ip1ip2ip3 Name: name1name2name3</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs w-64" placeholder="搜索..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} /></TableHead>
                    <TableHead className="whitespace-nowrap">UUID</TableHead>
                    <TableHead className="whitespace-nowrap">名称</TableHead>
                    <TableHead className="whitespace-nowrap">SN</TableHead>
                    <TableHead className="whitespace-nowrap">类型</TableHead>
                    <TableHead className="whitespace-nowrap">规格</TableHead>
                    <TableHead className="whitespace-nowrap">操作系统</TableHead>
                    <TableHead className="whitespace-nowrap">运行状态</TableHead>
                    <TableHead className="whitespace-nowrap">任务状态</TableHead>
                    <TableHead className="whitespace-nowrap">虚拟机规格</TableHead>
                    <TableHead className="whitespace-nowrap">虚拟机数量</TableHead>
                    <TableHead className="whitespace-nowrap">超额</TableHead>
                    <TableHead className="whitespace-nowrap">限速(Mbps)</TableHead>
                    <TableHead className="whitespace-nowrap">IP地址</TableHead>
                    <TableHead className="whitespace-nowrap">CPU型号</TableHead>
                    <TableHead className="whitespace-nowrap">Release状态</TableHead>
                    <TableHead className="whitespace-nowrap">标签</TableHead>
                    <TableHead className="whitespace-nowrap">创建时间</TableHead>
                    <TableHead className="whitespace-nowrap">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedCards.map(card => (
                    <TableRow key={card.id}>
                      <TableCell><Checkbox checked={selectedIds.has(card.id)} onCheckedChange={() => toggleSelect(card.id)} /></TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap" title={card.uuid}>{card.uuid}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <span className="text-primary cursor-pointer hover:underline">{card.name}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{card.sn}</TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant="outline" className="text-[10px]">{card.type}</Badge></TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.spec}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">🤖 {card.os}</span>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px] whitespace-nowrap">正常</Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge variant="outline" className="bg-green-50 text-green-600 text-[10px] whitespace-nowrap">空闲</Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.containerSpec || "-"}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{card.containerCount}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{card.overQuota ? "是" : "否"}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <div className="text-[10px] leading-tight">
                          <div>上行</div>
                          <div>下行</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{card.ip}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.cpuModel}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge variant={card.releaseStatus === "Ready" ? "default" : "secondary"} className={`text-[10px] whitespace-nowrap ${card.releaseStatus === "Ready" ? "bg-green-500" : ""}`}>
                          {card.releaseStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {card.tags.length > 0 ? card.tags.join(", ") : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{card.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5 whitespace-nowrap">
                          <Button variant="link" size="sm" className="h-6 px-1 text-xs" onClick={() => openDialog("flash", card)}>刷机恢复</Button>
                          <Button variant="link" size="sm" className="h-6 px-1 text-xs" onClick={() => openDialog("reboot", card)}>重启</Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="link" size="sm" className="h-6 px-1 text-xs">更多</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDialog("ota", card)}>OTA升级</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.error("请先手动停止板卡上的虚拟机后再进行迁移！")}>迁移虚拟机</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("speedLimit", card)}>限速</DropdownMenuItem>
                              <DropdownMenuItem>ssh</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("connectionInfo", card)}>连接信息</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("release", card)}>Release资源</DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>标签</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem>添加标签</DropdownMenuItem>
                                    <DropdownMenuItem>清除标签</DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => openDialog("powerOn", card)}>上电</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("powerOff", card)}>下电</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => openDialog("deleteContainer", card)}>删除虚拟机</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("recycle", card)}>回收</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog("unsubscribe", card)}>退订</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <span>共 {filteredCards.length} 条</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}条/页</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="px-2">{currentPage}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
            <span>前往</span>
            <Input className="w-12 h-7 text-xs text-center" defaultValue={1} onKeyDown={e => { if (e.key === "Enter") { const v = Number((e.target as HTMLInputElement).value); if (v >= 1 && v <= totalPages) setCurrentPage(v); } }} />
            <span>页</span>
          </div>
        </div>

        {/* ===== Dialogs ===== */}

        {/* 刷机恢复 */}
        <Dialog open={activeDialog === "flash"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>刷机恢复</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div>
                <p>1、此操作会对板卡执行重置ROM后OTA到原有或者指定ROM版本，再进行板卡初始化及虚拟机恢复（如有）。</p>
                <p className="font-semibold">2、此操作一定会导致虚拟机数据丢失。请谨慎操作。</p>
                <p>3、若刷机恢复失败，可能会导致板卡恢复到默认刷机包状态，请知晓。</p>
              </div></div>
            </div>
            <div className="space-y-4 mt-2">
              <div>
                {renderSelectedItems()}
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm">指定ROM ②</Label>
                <RadioGroup value={flashRom} onValueChange={setFlashRom} className="flex gap-4">
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="否" id="rom-no" /><Label htmlFor="rom-no" className="text-sm">否</Label></div>
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="是" id="rom-yes" /><Label htmlFor="rom-yes" className="text-sm">是</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm">指定镜像</Label>
                <RadioGroup value={flashImage} onValueChange={setFlashImage} className="flex gap-4">
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="否" id="img-no" /><Label htmlFor="img-no" className="text-sm">否</Label></div>
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="是" id="img-yes" /><Label htmlFor="img-yes" className="text-sm">是</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Label>当前ROM版本</Label>
                <span className="text-muted-foreground">{selectedCard?.romVersion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="flash-confirm" checked={flashConfirm} onCheckedChange={v => setFlashConfirm(!!v)} />
                <Label htmlFor="flash-confirm" className="text-sm">我已知晓此操作会导致虚拟机数据丢失。</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button disabled={!flashConfirm} onClick={() => { toast.success("刷机恢复任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 重启板卡 */}
        <Dialog open={activeDialog === "reboot"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>重启板卡</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p>重启板卡操作会针对板卡执行reboot操作，是软重启，会造成其子资源虚拟机不可用，从而影响业务，请谨慎操作。</p>
              </div>
            </div>
            <div className="mt-2">
              {renderSelectedItems()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("重启任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* OTA升级 */}
        <Dialog open={activeDialog === "ota"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>OTA升级</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p>OTA升级完成后，板卡ROM版本需重启才能生效。</p>
              </div>
            </div>
            <div className="space-y-4 mt-2">
              <div>
                {renderSelectedItems()}
              </div>
              <div>
                <Label className="text-sm"><span className="text-destructive">*</span> 升级ROM</Label>
                <Select value={otaRom} onValueChange={setOtaRom}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="请选择升级包" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rom-v2.3">OR65L10CDA_V2.3.00</SelectItem>
                    <SelectItem value="rom-v2.4">OR65L10CDA_V2.4.00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">当前有 {selectedCard?.containerCount || 2} 台虚拟机与所选板卡相关</p>
              <div className="flex items-center gap-2">
                <Checkbox id="ota-restart" checked={otaRestart} onCheckedChange={v => setOtaRestart(!!v)} />
                <Label htmlFor="ota-restart" className="text-sm text-primary font-medium">升级完成后立即重启</Label>
              </div>
              <p className="text-xs text-muted-foreground">说明：ROM 版本必须在重启后才能生效，如不勾选需稍后手动重启。</p>
              <div className="flex items-center gap-2">
                <Checkbox id="ota-risk" checked={otaRiskConfirm} onCheckedChange={v => setOtaRiskConfirm(!!v)} />
                <Label htmlFor="ota-risk" className="text-sm">我已知晓上述风险</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button disabled={!otaRom || !otaRiskConfirm} onClick={() => { toast.success("OTA升级任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 板卡限速 */}
        <Dialog open={activeDialog === "speedLimit"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>板卡限速</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div>
                <p>1、以板卡为维度对虚拟机业务网络限速，重复设置以最新设置的值为准。</p>
                <p className="font-semibold">2、板卡设置的限速必须大于或者等于虚拟机设置的限速，否则限速会失败。</p>
                <p>3、重复设置限速值，会覆盖之前的值。</p>
              </div></div>
            </div>
            <div className="space-y-4 mt-2">
              <div>
                {renderSelectedItems()}
              </div>
              <p className="text-sm font-medium">限速值(单位：Mbps)</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">上行</Label>
                  <Input className="mt-1" placeholder="请输入带宽峰值，可输入范围:0-1000，可以为空，0和空代表不限速" value={speedUp} onChange={e => setSpeedUp(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">下行</Label>
                  <Input className="mt-1" placeholder="请输入带宽峰值，可输入范围:0-1000，可以为空，0和空代表不限速" value={speedDown} onChange={e => setSpeedDown(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">不设置上限或者设置为0时，则表示该虚拟机带宽不限速。限速过低时，可能会影响虚拟机的使用，建议不小于5Mbps。</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("限速设置已保存"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 连接信息 */}
        <Dialog open={activeDialog === "connectionInfo"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>连接信息</DialogTitle></DialogHeader>
            <div className="border rounded-lg p-5 space-y-4 mt-2">
              {[
                { label: "IP", value: "172.31.11.92" },
                { label: "端口", value: "2226" },
                { label: "用户名", value: `172.31.20.18_22_115_1775646916247` },
                { label: "密码", value: "eyJtZXRhIjoiZXlKaVdIXMWxJam9pZDNsbUip..." },
                { label: "到期时间", value: "2026-04-08 19:15:16" },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <span className="text-sm font-medium text-primary w-16 shrink-0">{item.label}</span>
                  <span className="text-sm break-all">{item.value}</span>
                </div>
              ))}
              <div className="flex gap-4">
                <span className="text-sm font-medium text-primary w-16 shrink-0">连接命令</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary break-all">ssh 172.31.20.18_22_115_1775646916247@172.31.11.92 -p 2226</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy("ssh 172.31.20.18_22_115_1775646916247@172.31.11.92 -p 2226")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <Button onClick={() => handleCopy("ssh 172.31.20.18_22_115_1775646916247@172.31.11.92 -p 2226")}>一键复制</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Release资源 */}
        <Dialog open={activeDialog === "release"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Release资源</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div>
                <p>1、Release资源代表将资源的Release状态由 Not Ready 状态置为Ready 状态。</p>
                <p>2、若资源置于Ready状态后，则无法再切换回 Not Ready 状态，请谨慎操作。</p>
              </div></div>
            </div>
            <div className="mt-2">
              {renderSelectedItems()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("Release状态已更新"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 上电 */}
        <Dialog open={activeDialog === "powerOn"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>上电</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="font-semibold">此操作进行上电，是否继续</p>
              </div>
            </div>
            <div className="mt-2">
              {renderSelectedItems()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("上电操作已执行"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 下电 */}
        <Dialog open={activeDialog === "powerOff"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>下电</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p>下电板卡会导致相关子级资源（如虚拟机）离线，请谨慎操作。</p>
              </div>
            </div>
            <div className="space-y-3 mt-2">
              <div>
                {renderSelectedItems()}
              </div>
              <p className="text-sm text-muted-foreground">当前有 {selectedCard?.containerCount || 2} 台虚拟机与所选板卡相关</p>
              <div className="flex items-center gap-2">
                <Checkbox id="poweroff-risk" checked={powerOffConfirm} onCheckedChange={v => setPowerOffConfirm(!!v)} />
                <Label htmlFor="poweroff-risk" className="text-sm">我已知晓上述风险</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button disabled={!powerOffConfirm} onClick={() => { toast.success("下电操作已执行"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除虚拟机 */}
        <Dialog open={activeDialog === "deleteContainer"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>删除虚拟机</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p>虚拟机必须以板卡为维度整体删除，请谨慎操作。</p>
              </div>
            </div>
            <div className="mt-2">
              {renderSelectedItems()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("删除虚拟机任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 回收板卡 */}
        <Dialog open={activeDialog === "recycle"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>回收板卡</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div>
                <p>1、回收板卡会解除板卡与用户的关系，且对关联资源虚拟机进行删除。</p>
                <p className="font-semibold">2、回收板卡会将板卡上的云盘进行卸载，请谨慎操作。</p>
                <p>3、已知晓回收后的板卡不允许再恢复！</p>
              </div></div>
            </div>
            <div className="space-y-3 mt-2">
              <div>
                {renderSelectedItems()}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="deep-recycle" checked={deepRecycle} onCheckedChange={v => setDeepRecycle(!!v)} />
                <Label htmlFor="deep-recycle" className="text-sm">深度回收</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("回收任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 退订板卡 */}
        <Dialog open={activeDialog === "unsubscribe"} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>退订板卡</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div>
                <p className="font-semibold">1、退订板卡后，将不允许再操作板卡及板卡上的虚拟机资源，请谨慎操作！</p>
                <p>2、退订失败会导致板卡关机，请悉知！</p>
              </div></div>
            </div>
            <div className="mt-2">
              {renderSelectedItems()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>取消</Button>
              <Button onClick={() => { toast.success("退订任务已提交"); closeDialog(); }}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
