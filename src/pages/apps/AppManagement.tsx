import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Search, Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, RotateCw, Share2, Trash2, AlertCircle, Inbox } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { virtualInstances } from "@/data/mock-data";

// ============ APK Mock Data ============
export interface ApkPackage {
  id: string;
  name: string;
  packageName: string;
  version: string;
  versionCode: number;
  size: string;
  icon: string;
  minAndroid: string;
  targetAndroid: string;
  versionNote: string;
  uploadedAt: string;
  uploadedBy: string;
  status: "active" | "deprecated";
  installedCount: number;
  totalDevices: number;
}

const apkPackages: ApkPackage[] = [
  { id: "APK-001", name: "TikTok", packageName: "com.zhiliaoapp.musically", version: "33.5.4", versionCode: 335040, size: "128MB", icon: "🎵", minAndroid: "5.0", targetAndroid: "14", versionNote: "修复直播间崩溃问题，优化视频加载速度", uploadedAt: "2026-04-01 14:30", uploadedBy: "admin", status: "active", installedCount: 8, totalDevices: 10 },
  { id: "APK-002", name: "Facebook", packageName: "com.facebook.katana", version: "450.0.0.34", versionCode: 450034, size: "85MB", icon: "📘", minAndroid: "6.0", targetAndroid: "14", versionNote: "新增Reels功能支持", uploadedAt: "2026-03-28 10:00", uploadedBy: "admin", status: "active", installedCount: 3, totalDevices: 10 },
  { id: "APK-003", name: "Instagram", packageName: "com.instagram.android", version: "320.0.0.25", versionCode: 320025, size: "72MB", icon: "📸", minAndroid: "6.0", targetAndroid: "14", versionNote: "Stories交互优化", uploadedAt: "2026-03-25 09:15", uploadedBy: "admin", status: "active", installedCount: 2, totalDevices: 10 },
  { id: "APK-004", name: "WhatsApp", packageName: "com.whatsapp", version: "2.24.8.10", versionCode: 224810, size: "65MB", icon: "💬", minAndroid: "5.0", targetAndroid: "13", versionNote: "端到端加密升级", uploadedAt: "2026-03-20 16:00", uploadedBy: "ops01", status: "active", installedCount: 5, totalDevices: 10 },
  { id: "APK-005", name: "Twitter/X", packageName: "com.twitter.android", version: "10.35.0", versionCode: 103500, size: "92MB", icon: "🐦", minAndroid: "6.0", targetAndroid: "14", versionNote: "时间线算法更新", uploadedAt: "2026-03-15 11:30", uploadedBy: "admin", status: "active", installedCount: 4, totalDevices: 10 },
  { id: "APK-006", name: "TikTok (旧版)", packageName: "com.zhiliaoapp.musically", version: "32.0.0", versionCode: 320000, size: "120MB", icon: "🎵", minAndroid: "5.0", targetAndroid: "13", versionNote: "旧版本，已废弃", uploadedAt: "2026-02-10 08:00", uploadedBy: "admin", status: "deprecated", installedCount: 0, totalDevices: 10 },
];

// Serve nodes for 上传到指定节点
const serviceNodes = [
  { id: "192.168.110.48", name: "本地测试节点", online: true, uploaded: false },
  { id: "172.30.11.173", name: "雅安测试节点", online: true, uploaded: true },
];

// 应用ID mapping (mock)
const apkAppIds: Record<string, string> = {
  "APK-001": "2061384248581287938",
  "APK-002": "2061380363879837698",
  "APK-003": "2061370694851047426",
  "APK-004": "2057397766832177153",
  "APK-005": "2057368943793930242",
  "APK-006": "2057368943793930999",
};

export type InstallTaskStatus = "pending" | "installing" | "success" | "failed";

interface InstallTask {
  id: string;
  apkName: string;
  apkVersion: string;
  targetDevices: string[];
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: InstallTaskStatus;
  createdAt: string;
  completedAt: string | null;
  details: { deviceId: string; status: InstallTaskStatus; message: string }[];
}

const installTasks: InstallTask[] = [
  {
    id: "INST-001", apkName: "TikTok", apkVersion: "33.5.4", targetDevices: ["VM-001", "VM-002", "VM-003", "VM-004", "VM-005"],
    totalCount: 5, successCount: 4, failedCount: 1, status: "success", createdAt: "2026-04-01 15:00", completedAt: "2026-04-01 15:12",
    details: [
      { deviceId: "VM-001", status: "success", message: "安装完成" },
      { deviceId: "VM-002", status: "success", message: "安装完成" },
      { deviceId: "VM-003", status: "success", message: "安装完成" },
      { deviceId: "VM-004", status: "success", message: "安装完成" },
      { deviceId: "VM-005", status: "failed", message: "设备离线" },
    ],
  },
  {
    id: "INST-002", apkName: "WhatsApp", apkVersion: "2.24.8.10", targetDevices: ["VM-001", "VM-002", "VM-008"],
    totalCount: 3, successCount: 1, failedCount: 0, status: "installing", createdAt: "2026-04-02 10:30", completedAt: null,
    details: [
      { deviceId: "VM-001", status: "success", message: "安装完成" },
      { deviceId: "VM-002", status: "installing", message: "安装中..." },
      { deviceId: "VM-008", status: "pending", message: "等待中" },
    ],
  },
];

const PAGE_SIZES = [10, 20, 50];

export default function AppManagement() {
  const [showUpload, setShowUpload] = useState(false);
  const [showBatchInstall, setShowBatchInstall] = useState<ApkPackage | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState<InstallTask | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deprecated">("all");
  const [selectedApks, setSelectedApks] = useState<string[]>([]);
  const [showUploadTasks, setShowUploadTasks] = useState(false);
  const [uploadToNode, setUploadToNode] = useState<ApkPackage | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [singleUninstall, setSingleUninstall] = useState<ApkPackage | null>(null);
  const [singleUninstallSelected, setSingleUninstallSelected] = useState<string[]>([]);
  const [batchUninstallConfirm, setBatchUninstallConfirm] = useState(false);
  const [deprecateTarget, setDeprecateTarget] = useState<ApkPackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApkPackage | null>(null);
  const [rows, setRows] = useState(apkPackages);

  const cloudDevices = virtualInstances.filter(v => v.type === "cloud");

  const filteredApks = useMemo(() => rows.filter(a => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !a.name.toLowerCase().includes(q) && !a.packageName.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  }), [rows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApks.length / pageSize));
  const pagedApks = filteredApks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const selectAllDevices = () => {
    if (selectedDevices.length === cloudDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(cloudDevices.map(d => d.id));
    }
  };

  const toggleApk = (id: string) =>
    setSelectedApks(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllApks = () =>
    setSelectedApks(p => p.length === pagedApks.length ? [] : pagedApks.map(a => a.id));

  const resetFilters = () => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); };

  const confirmDeprecate = () => {
    if (!deprecateTarget) return;
    setRows(list => list.map(a => a.id === deprecateTarget.id ? { ...a, status: "deprecated" } : a));
    toast({ title: `已废弃应用 "${deprecateTarget.name}"` });
    setDeprecateTarget(null);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows(list => list.filter(a => a.id !== deleteTarget.id));
    setSelectedApks(p => p.filter(x => x !== deleteTarget.id));
    toast({ title: `已删除应用 "${deleteTarget.name}"` });
    setDeleteTarget(null);
  };

  const totalInstalledForSelected = rows
    .filter(a => selectedApks.includes(a.id))
    .reduce((s, a) => s + a.installedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">应用管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理 Android 云机上运行的 APK 安装包</p>
        </div>
      </div>

      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">安装包列表</TabsTrigger>
          <TabsTrigger value="tasks">安装任务</TabsTrigger>
          <TabsTrigger value="uninstall">卸载任务</TabsTrigger>
        </TabsList>

        {/* 安装包列表 */}
        <TabsContent value="packages" className="space-y-4">
          {/* Filter bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5 flex-1 min-w-[240px]">
                  <Label className="text-xs text-muted-foreground">搜索</Label>
                  <Input placeholder="请输入应用名称/包名搜索" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="space-y-1.5 w-64">
                  <Label className="text-xs text-muted-foreground">状态筛选</Label>
                  <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as typeof statusFilter); setCurrentPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="deprecated">已废弃</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button onClick={() => setCurrentPage(1)} className="gap-1"><Search className="w-4 h-4" />搜索</Button>
                  <Button variant="outline" onClick={resetFilters} className="gap-1"><RotateCw className="w-4 h-4" />重置</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowUpload(true)} className="gap-1">
              <Upload className="w-4 h-4" />上传 APK
            </Button>
            <Button variant="outline" onClick={() => setShowUploadTasks(true)} className="gap-1">
              <Clock className="w-4 h-4" />上传进度
            </Button>
            <Button
              variant="outline"
              disabled={selectedApks.length === 0}
              onClick={() => setBatchUninstallConfirm(true)}
              className="gap-1 text-destructive hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />批量卸载APK（{selectedApks.length}）
            </Button>
            <div className="ml-auto flex gap-1">
              <Button variant="outline" size="icon" className="h-9 w-9"><RotateCw className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-9 w-9"><Search className="w-4 h-4" /></Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={pagedApks.length > 0 && pagedApks.every(a => selectedApks.includes(a.id))}
                        onCheckedChange={toggleAllApks}
                      />
                    </TableHead>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>应用ID</TableHead>
                    <TableHead>应用</TableHead>
                    <TableHead>包名</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>版本说明</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>最低ANDROID版本</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedApks.map((apk, idx) => {
                    const deprecated = apk.status === "deprecated";
                    return (
                      <TableRow key={apk.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedApks.includes(apk.id)}
                            onCheckedChange={() => toggleApk(apk.id)}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{apkAppIds[apk.id] ?? apk.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">{apk.icon}</span>
                            <span className="text-sm">{apk.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{apk.packageName}</TableCell>
                        <TableCell className="font-mono text-xs">{apk.version}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{apk.versionNote || "-"}</TableCell>
                        <TableCell className="text-xs">{apk.size}</TableCell>
                        <TableCell className="text-xs">{apk.minAndroid}+</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-3 text-xs whitespace-nowrap">
                            <button className="inline-flex items-center gap-1 text-primary hover:underline" onClick={() => { setUploadToNode(apk); setSelectedNodeId(""); }}>
                              <Share2 className="w-3 h-3" />上传到节点
                            </button>
                            <button className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-40" disabled={deprecated} onClick={() => { setShowBatchInstall(apk); setSelectedDevices([]); }}>
                              <Download className="w-3 h-3" />批量安装
                            </button>
                            <button
                              className="inline-flex items-center gap-1 text-destructive hover:underline disabled:opacity-40"
                              disabled={deprecated || apk.installedCount === 0}
                              onClick={() => { setSingleUninstall(apk); setSingleUninstallSelected([]); }}
                            >
                              <Trash2 className="w-3 h-3" />批量卸载
                            </button>
                            <button
                              className="text-muted-foreground hover:text-foreground hover:underline disabled:opacity-40"
                              disabled={deprecated}
                              onClick={() => setDeprecateTarget(apk)}
                            >
                              废弃
                            </button>
                            <button className="inline-flex items-center gap-1 text-destructive hover:underline" onClick={() => setDeleteTarget(apk)}>
                              <Trash2 className="w-3 h-3" />删除
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pagedApks.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-10">暂无数据</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
           </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>共 {filteredApks.length} 条记录</span>
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
        </TabsContent>

        {/* 安装任务列表 */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>应用</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>目标设备数</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installTasks.map(task => {
                    const progress = task.totalCount > 0 ? Math.round(((task.successCount + task.failedCount) / task.totalCount) * 100) : 0;
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono text-xs">{task.id}</TableCell>
                        <TableCell className="text-sm font-medium">{task.apkName}</TableCell>
                        <TableCell className="font-mono text-xs">{task.apkVersion}</TableCell>
                        <TableCell className="text-xs">{task.totalCount} 台</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1.5 w-20" />
                            <span className="text-xs">{task.successCount}/{task.totalCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.status === "success" ? "default" : task.status === "installing" ? "outline" : task.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                            {task.status === "success" ? "完成" : task.status === "installing" ? "安装中" : task.status === "failed" ? "失败" : "等待"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{task.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowTaskDetail(task)}>
                            查看详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 上传 APK 弹窗 */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传 APK 安装包</DialogTitle>
            <DialogDescription>上传 Android 应用安装包到平台</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>应用名称</Label><Input placeholder="如：TikTok" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>版本号</Label><Input placeholder="33.5.4" /></div>
              <div className="space-y-2"><Label>最低 Android</Label><Input placeholder="5.0" /></div>
            </div>
            <div className="space-y-2"><Label>版本说明</Label><Input placeholder="此版本的更新内容描述" /></div>
            <div className="space-y-2">
              <Label>APK 文件</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>点击或拖拽上传 .apk 文件</p>
                <p className="text-xs mt-1">支持最大 500MB</p>
              </div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Input placeholder="可选备注信息" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>取消</Button>
            <Button onClick={() => setShowUpload(false)}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量安装弹窗 */}
      <Dialog open={!!showBatchInstall} onOpenChange={() => setShowBatchInstall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批量安装/更新 - {showBatchInstall?.name} v{showBatchInstall?.version}</DialogTitle>
            <DialogDescription>选择目标 Android 云机设备，已安装相同包名将自动更新，未安装则直接安装</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">已选择 <span className="font-bold text-primary">{selectedDevices.length}</span> 台设备</p>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={selectAllDevices}>
                {selectedDevices.length === cloudDevices.length ? "取消全选" : "全选"}
              </Button>
            </div>
            <div className="border rounded-lg max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>设备ID</TableHead>
                    <TableHead>机型</TableHead>
                    <TableHead>ROM版本</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>所属主板</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cloudDevices.map(dev => (
                    <TableRow key={dev.id} className="cursor-pointer" onClick={() => toggleDevice(dev.id)}>
                      <TableCell>
                        <Checkbox checked={selectedDevices.includes(dev.id)} onCheckedChange={() => toggleDevice(dev.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{dev.id}</TableCell>
                      <TableCell className="text-xs">{dev.model}</TableCell>
                      <TableCell className="font-mono text-xs">{dev.osVersion}</TableCell>
                      <TableCell>
                        <Badge variant={dev.status === "running" || dev.status === "idle" ? "default" : "secondary"} className="text-[10px]">
                          {dev.status === "running" ? "运行中" : dev.status === "idle" ? "空闲" : dev.status === "warming" ? "预热" : dev.status === "error" ? "异常" : "离线"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dev.hostServerId.slice(0,8)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchInstall(null)}>取消</Button>
            <Button onClick={() => setShowBatchInstall(null)} disabled={selectedDevices.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              安装/更新到 {selectedDevices.length} 台设备
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 安装任务详情弹窗 */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>安装任务详情 - {showTaskDetail?.id}</DialogTitle>
            <DialogDescription>{showTaskDetail?.apkName} v{showTaskDetail?.apkVersion} · {showTaskDetail?.createdAt}</DialogDescription>
          </DialogHeader>
          {showTaskDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-lg font-bold">{showTaskDetail.totalCount}</p>
                  <p className="text-xs text-muted-foreground">总计</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-lg font-bold text-success">{showTaskDetail.successCount}</p>
                  <p className="text-xs text-muted-foreground">成功</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="text-lg font-bold text-destructive">{showTaskDetail.failedCount}</p>
                  <p className="text-xs text-muted-foreground">失败</p>
                </div>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>设备ID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>消息</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showTaskDetail.details.map(d => (
                      <TableRow key={d.deviceId}>
                        <TableCell className="font-mono text-xs">{d.deviceId}</TableCell>
                        <TableCell>
                          {d.status === "success" && <CheckCircle className="h-4 w-4 text-success" />}
                          {d.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                          {d.status === "installing" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                          {d.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="text-xs">{d.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
