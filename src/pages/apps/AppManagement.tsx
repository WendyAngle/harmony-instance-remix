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
  packageName: string;
  apkVersion: string;
  targetDevices: string[];
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: InstallTaskStatus;
  createdAt: string;
  completedAt: string | null;
  details: { node: string; deviceId: string; deviceName: string; status: InstallTaskStatus; message: string; summary: string }[];
}

const installTasksSeed: InstallTask[] = [
  { id: "e03b6b9c81084458a0f8c3a49f1c3580", apkName: "tk", packageName: "tiktok-45-3-3 (1)", apkVersion: "45.3.3", targetDevices: [], totalCount: 1, successCount: 1, failedCount: 0, status: "success", createdAt: "2026-06-25 14:44:14", completedAt: "2026-06-25 14:45:36", details: [{ node: "yaan-test-01", deviceId: "2059591332533673985", deviceName: "test-1-14-i2 测试-1-14-i2", status: "success", message: "-", summary: "ok 好的" }] },
  { id: "9e8e7dc2d2ea42fab32517e8a13ac4c4", apkName: "tiktok", packageName: "com.zhiliaoapp.musically", apkVersion: "45.4.3", targetDevices: [], totalCount: 2, successCount: 2, failedCount: 0, status: "success", createdAt: "2026-06-04 16:35:05", completedAt: "2026-06-04 16:37:10", details: [{ node: "yaan-test-01", deviceId: "2059591332533673986", deviceName: "test-1-15-i2", status: "success", message: "-", summary: "ok" }, { node: "yaan-test-01", deviceId: "2059591332533673987", deviceName: "test-1-16-i2", status: "success", message: "-", summary: "ok" }] },
  { id: "79811ec0f70448e8ab0ceadea31f533f", apkName: "xiaohongshu 小红书", packageName: "com.xingin.xhs", apkVersion: "8.6", targetDevices: [], totalCount: 3, successCount: 3, failedCount: 0, status: "success", createdAt: "2026-06-04 14:07:28", completedAt: "2026-06-04 14:10:00", details: [] },
  { id: "2aa386f61f43454c88c2d484605c26f1", apkName: "xiaohongshu 小红书", packageName: "com.xingin.xhs", apkVersion: "8.6", targetDevices: [], totalCount: 2, successCount: 2, failedCount: 0, status: "success", createdAt: "2026-06-03 18:33:57", completedAt: "2026-06-03 18:35:00", details: [] },
  { id: "84183c3a67784bbf89abd51835d42e50", apkName: "xiaohongshu 小红书", packageName: "com.xingin.xhs", apkVersion: "8.6", targetDevices: [], totalCount: 1, successCount: 1, failedCount: 0, status: "success", createdAt: "2026-06-03 18:28:04", completedAt: "2026-06-03 18:29:00", details: [] },
  { id: "2d1cd7ad55864bd09120f8a0a34d78ec", apkName: "tiktok", packageName: "com.zhiliaoapp.musically", apkVersion: "45.4.3", targetDevices: [], totalCount: 9, successCount: 9, failedCount: 0, status: "success", createdAt: "2026-06-03 11:02:16", completedAt: "2026-06-03 11:12:00", details: [] },
  { id: "224fbb0cf3a54a499d12372ec680b936", apkName: "tiktok", packageName: "com.zhiliaoapp.musically", apkVersion: "45.4.3", targetDevices: [], totalCount: 57, successCount: 40, failedCount: 17, status: "success", createdAt: "2026-06-02 15:31:33", completedAt: "2026-06-02 16:20:00", details: [] },
  { id: "db956ee436f040b5b5af7c6d14882ae8", apkName: "tiktok", packageName: "com.zhiliaoapp.musically", apkVersion: "45.4.3", targetDevices: [], totalCount: 3, successCount: 1, failedCount: 2, status: "success", createdAt: "2026-06-01 17:49:18", completedAt: "2026-06-01 17:52:00", details: [] },
  { id: "5ba73f96a9654e11915e19e25c66c78e", apkName: "tk", packageName: "tiktok-45-3-3 (1)", apkVersion: "45.3.3", targetDevices: [], totalCount: 3, successCount: 0, failedCount: 3, status: "failed", createdAt: "2026-06-01 17:37:15", completedAt: "2026-06-01 17:40:00", details: [] },
  { id: "af7227a03a0948b0a9a55eb183772a77", apkName: "tk", packageName: "tiktok-44.5.3 抖音-44.5.3", apkVersion: "44.5.3", targetDevices: [], totalCount: 3, successCount: 0, failedCount: 3, status: "failed", createdAt: "2026-06-01 17:32:02", completedAt: "2026-06-01 17:35:00", details: [] },
  { id: "a888e51bb5864700882c04c228663e42", apkName: "tiktok", packageName: "-", apkVersion: "45.4.1", targetDevices: [], totalCount: 3, successCount: 0, failedCount: 3, status: "failed", createdAt: "2026-06-01 16:46:59", completedAt: "2026-06-01 16:50:00", details: [] },
  { id: "1a053f3eafad4b259c59474bd174d4a7", apkName: "tiktok", packageName: "-", apkVersion: "1.0.0", targetDevices: [], totalCount: 62, successCount: 54, failedCount: 8, status: "success", createdAt: "2026-06-01 16:16:44", completedAt: "2026-06-01 17:00:00", details: [] },
  { id: "6211ea160d2349f99441b02dceb9da4f", apkName: "xiaohongshu 小红书", packageName: "com.xingin.xhs", apkVersion: "8.6", targetDevices: [], totalCount: 1, successCount: 1, failedCount: 0, status: "success", createdAt: "2026-05-25 13:53:48", completedAt: "2026-05-25 13:55:00", details: [] },
  { id: "3f2c1e9b48a24d8ea87e2b4f9c1a5d67", apkName: "tk", packageName: "tiktok-45-3-3 (1)", apkVersion: "45.3.3", targetDevices: [], totalCount: 5, successCount: 5, failedCount: 0, status: "success", createdAt: "2026-05-20 10:20:10", completedAt: "2026-05-20 10:25:00", details: [] },
  { id: "b74a91d582e34c7bb0198f6d3c48a2ef", apkName: "tiktok", packageName: "com.zhiliaoapp.musically", apkVersion: "45.4.3", targetDevices: [], totalCount: 4, successCount: 4, failedCount: 0, status: "success", createdAt: "2026-05-18 09:14:22", completedAt: "2026-05-18 09:16:00", details: [] },
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
  // ---- Install tasks tab state ----
  const [installTasks, setInstallTasks] = useState<InstallTask[]>(installTasksSeed);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskAppFilter, setTaskAppFilter] = useState<string>("all");
  const [taskVersionFilter, setTaskVersionFilter] = useState<string>("all");
  const [taskSortAsc, setTaskSortAsc] = useState(false);
  const [taskFiltersExpanded, setTaskFiltersExpanded] = useState(false);
  const [deleteTask, setDeleteTask] = useState<InstallTask | null>(null);
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

        {/* 卸载任务 */}
        <TabsContent value="uninstall" className="space-y-4">
          <Card>
            <CardContent className="p-10">
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Inbox className="w-12 h-12" />
                <div className="text-sm">暂无卸载任务</div>
              </div>
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

      {/* 上传任务列表 */}
      <Dialog open={showUploadTasks} onOpenChange={setShowUploadTasks}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>上传任务列表</DialogTitle>
            <DialogDescription>仅显示最近24小时内的上传任务</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5 flex-1 min-w-[240px]">
                <Label className="text-xs text-muted-foreground">搜索</Label>
                <Input placeholder="请输入任务ID/应用名称/错误消息搜索" />
              </div>
              <div className="space-y-1.5 w-48">
                <Label className="text-xs text-muted-foreground">状态</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="running">进行中</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button className="gap-1"><Search className="w-4 h-4" />搜索</Button>
                <Button variant="outline" className="gap-1"><RotateCw className="w-4 h-4" />重置</Button>
              </div>
            </div>
            <div>
              <Button size="sm" className="gap-1"><RotateCw className="w-3 h-3" />刷新列表</Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>任务ID</TableHead>
                    <TableHead>应用名称</TableHead>
                    <TableHead>包名</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>文件大小</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>错误信息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-14">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="w-10 h-10" />
                        <div className="text-xs">暂无数据</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 上传到指定节点 */}
      <Dialog open={!!uploadToNode} onOpenChange={(o) => !o && setUploadToNode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传到指定节点</DialogTitle>
          </DialogHeader>
          {uploadToNode && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm flex flex-wrap items-center gap-x-6 gap-y-1">
                <div><span className="text-muted-foreground">应用：</span><span className="text-lg mr-1">{uploadToNode.icon}</span>{uploadToNode.name}</div>
                <div><span className="text-muted-foreground">包名：</span><span className="font-mono text-xs">{uploadToNode.packageName}</span></div>
                <div><span className="text-muted-foreground">版本：</span><span className="font-mono text-xs">{uploadToNode.version}</span></div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-10"></TableHead>
                      <TableHead>节点ID</TableHead>
                      <TableHead>节点名称</TableHead>
                      <TableHead>上传状态</TableHead>
                      <TableHead>节点状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceNodes.map(n => (
                      <TableRow key={n.id} className="cursor-pointer" onClick={() => setSelectedNodeId(n.id)}>
                        <TableCell>
                          <input type="radio" checked={selectedNodeId === n.id} onChange={() => setSelectedNodeId(n.id)} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{n.id}</TableCell>
                        <TableCell>{n.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                            n.uploaded ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>{n.uploaded ? "已上传" : "未上传"}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                            n.online ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>{n.online ? "在线" : "离线"}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadToNode(null)}>取消</Button>
            <Button
              disabled={!selectedNodeId}
              onClick={() => {
                toast({ title: "已发起上传任务" });
                setUploadToNode(null);
              }}
            >确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单个 APK 批量卸载 */}
      <Dialog open={!!singleUninstall} onOpenChange={(o) => !o && setSingleUninstall(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>批量卸载 - {singleUninstall?.name} v{singleUninstall?.version}</DialogTitle>
          </DialogHeader>
          {singleUninstall && (() => {
            const list = cloudDevices.slice(0, singleUninstall.installedCount);
            const allSelected = list.length > 0 && singleUninstallSelected.length === list.length;
            const toggleAll = () => setSingleUninstallSelected(allSelected ? [] : list.map(d => d.id));
            const toggleOne = (id: string) =>
              setSingleUninstallSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
            return (
              <div className="space-y-3 py-1">
                <div className="text-sm text-muted-foreground">
                  已安装 {singleUninstall.name} v{singleUninstall.version} 的设备列表，勾选需要卸载的设备后确认
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">已选择 <span className="font-semibold text-primary">{singleUninstallSelected.length}</span> / {list.length} 台设备</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSingleUninstallSelected(list.map(d => d.id))}>全选</Button>
                    <Button variant="outline" size="sm" onClick={() => setSingleUninstallSelected([])}>取消全选</Button>
                  </div>
                </div>
                <div className="border rounded-md max-h-72 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>设备名称</TableHead>
                        <TableHead>设备ID</TableHead>
                        <TableHead>容器UUID</TableHead>
                        <TableHead>节点</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>安装版本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((d, i) => (
                        <TableRow key={d.id}>
                          <TableCell><Checkbox checked={singleUninstallSelected.includes(d.id)} onCheckedChange={() => toggleOne(d.id)} /></TableCell>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="text-xs">{d.name}</TableCell>
                          <TableCell className="font-mono text-xs">{d.id.slice(0, 12)}...</TableCell>
                          <TableCell className="font-mono text-xs">{d.hostServerId.slice(0, 16)}...</TableCell>
                          <TableCell className="text-xs">yaan-test</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border bg-emerald-50 text-emerald-600 border-emerald-200">
                              {d.status === "running" ? "运行中" : d.status === "idle" ? "空闲" : "在线"}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{singleUninstall.version}</TableCell>
                        </TableRow>
                      ))}
                      {list.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">暂无已安装设备</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSingleUninstall(null)}>取消</Button>
            <Button
              disabled={singleUninstallSelected.length === 0}
              onClick={() => {
                toast({ title: `已发起卸载任务（${singleUninstallSelected.length} 台设备）` });
                setSingleUninstall(null);
              }}
            >
              确认卸载（{singleUninstallSelected.length} 台设备）
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量卸载确认 (multi apk) */}
      <Dialog open={batchUninstallConfirm} onOpenChange={setBatchUninstallConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>批量卸载确认</DialogTitle></DialogHeader>
          <div className="flex items-start gap-2 py-2 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              将对 <span className="font-semibold">{selectedApks.length}</span> 个APK的全部已安装设备（共 <span className="font-semibold">{totalInstalledForSelected}</span> 台）发起卸载，确定继续？
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchUninstallConfirm(false)}>取消</Button>
            <Button
              onClick={() => {
                toast({ title: `已发起 ${selectedApks.length} 个APK的批量卸载任务` });
                setSelectedApks([]);
                setBatchUninstallConfirm(false);
              }}
            >确定卸载</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认废弃 */}
      <Dialog open={!!deprecateTarget} onOpenChange={(o) => !o && setDeprecateTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>确认废弃</DialogTitle></DialogHeader>
          <div className="flex items-start gap-2 py-2 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>确定要废弃应用 "{deprecateTarget?.name}" 吗?</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeprecateTarget(null)}>取消</Button>
            <Button onClick={confirmDeprecate}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除 */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <div className="flex items-start gap-2 py-2 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>确定要删除应用 "{deleteTarget?.name}" 吗? 删除后将无法恢复。</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
