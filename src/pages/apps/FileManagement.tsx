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
import { FileUp, Plus, Upload, Search, Image, Film, FileText, File, Clock, CheckCircle, XCircle, Loader2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { virtualInstances } from "@/data/mock-data";

// ============ File Mock Data ============
export type FileCategory = "image" | "video" | "document" | "other";

export interface ManagedFile {
  id: string;
  name: string;
  category: FileCategory;
  mimeType: string;
  size: string;
  sizeBytes: number;
  previewUrl: string | null;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  description: string;
  remark: string;
  pushCount: number;
}

const managedFiles: ManagedFile[] = [
  { id: "FILE-001", name: "product_banner_01.jpg", category: "image", mimeType: "image/jpeg", size: "2.4MB", sizeBytes: 2516582, previewUrl: "🖼️", uploadedAt: "2026-04-02 09:00", uploadedBy: "admin", tags: ["推广", "电商"], description: "产品推广横幅图", remark: "用于TikTok店铺推广", pushCount: 6 },
  { id: "FILE-002", name: "tiktok_intro_15s.mp4", category: "video", mimeType: "video/mp4", size: "18MB", sizeBytes: 18874368, previewUrl: "🎬", uploadedAt: "2026-04-01 16:30", uploadedBy: "admin", tags: ["TikTok", "视频素材"], description: "TikTok 15秒介绍视频", remark: "", pushCount: 8 },
  { id: "FILE-003", name: "avatar_set_01.zip", category: "other", mimeType: "application/zip", size: "5.2MB", sizeBytes: 5452595, previewUrl: null, uploadedAt: "2026-03-30 14:00", uploadedBy: "ops01", tags: ["头像", "素材包"], description: "100个头像素材包", remark: "解压后使用", pushCount: 3 },
  { id: "FILE-004", name: "cover_photo_02.png", category: "image", mimeType: "image/png", size: "1.8MB", sizeBytes: 1887436, previewUrl: "🖼️", uploadedAt: "2026-03-28 11:20", uploadedBy: "admin", tags: ["封面", "Facebook"], description: "Facebook 封面照片", remark: "", pushCount: 2 },
  { id: "FILE-005", name: "promo_video_30s.mp4", category: "video", mimeType: "video/mp4", size: "35MB", sizeBytes: 36700160, previewUrl: "🎬", uploadedAt: "2026-03-25 10:00", uploadedBy: "admin", tags: ["推广", "Instagram"], description: "30秒产品推广视频", remark: "竖屏格式", pushCount: 4 },
  { id: "FILE-006", name: "script_template.txt", category: "document", mimeType: "text/plain", size: "12KB", sizeBytes: 12288, previewUrl: null, uploadedAt: "2026-03-20 08:30", uploadedBy: "ops01", tags: ["文案", "模板"], description: "私信文案模板", remark: "包含多语言变体", pushCount: 10 },
];

export type UploadTaskStatus = "pending" | "uploading" | "success" | "failed";

interface UploadTask {
  id: string;
  fileName: string;
  fileSize: string;
  targetDevices: string[];
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: UploadTaskStatus;
  createdAt: string;
  completedAt: string | null;
  details: { deviceId: string; status: UploadTaskStatus; message: string }[];
}

const uploadTasks: UploadTask[] = [
  {
    id: "UPLD-001", fileName: "product_banner_01.jpg", fileSize: "2.4MB",
    targetDevices: ["VM-001", "VM-002", "VM-004", "VM-006", "VM-008", "VM-010"],
    totalCount: 6, successCount: 6, failedCount: 0, status: "success",
    createdAt: "2026-04-02 09:10", completedAt: "2026-04-02 09:15",
    details: [
      { deviceId: "VM-001", status: "success", message: "传输完成" },
      { deviceId: "VM-002", status: "success", message: "传输完成" },
      { deviceId: "VM-004", status: "success", message: "传输完成" },
      { deviceId: "VM-006", status: "success", message: "传输完成" },
      { deviceId: "VM-008", status: "success", message: "传输完成" },
      { deviceId: "VM-010", status: "success", message: "传输完成" },
    ],
  },
  {
    id: "UPLD-002", fileName: "tiktok_intro_15s.mp4", fileSize: "18MB",
    targetDevices: ["VM-001", "VM-002", "VM-003", "VM-004"],
    totalCount: 4, successCount: 2, failedCount: 0, status: "uploading",
    createdAt: "2026-04-02 10:35", completedAt: null,
    details: [
      { deviceId: "VM-001", status: "success", message: "传输完成" },
      { deviceId: "VM-002", status: "success", message: "传输完成" },
      { deviceId: "VM-003", status: "uploading", message: "传输中 68%" },
      { deviceId: "VM-004", status: "pending", message: "排队中" },
    ],
  },
];

const categoryIcon: Record<FileCategory, typeof Image> = {
  image: Image,
  video: Film,
  document: FileText,
  other: File,
};

const categoryLabel: Record<FileCategory, string> = {
  image: "图片",
  video: "视频",
  document: "文档",
  other: "其他",
};

const PAGE_SIZES = [10, 20, 50];

export default function FileManagement() {
  const [showUpload, setShowUpload] = useState(false);
  const [showBatchPush, setShowBatchPush] = useState<ManagedFile | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState<UploadTask | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const cloudDevices = virtualInstances.filter(v => v.type === "cloud");

  const filteredFiles = useMemo(() => managedFiles.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchSearch && matchCategory;
  }), [searchQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / pageSize));
  const pagedFiles = filteredFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const selectAllDevices = () => {
    setSelectedDevices(prev => prev.length === cloudDevices.length ? [] : cloudDevices.map(d => d.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文件上传</h1>
          <p className="text-sm text-muted-foreground mt-1">管理和批量分发文件到 Android 云机设备</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-1" />
          上传文件
        </Button>
      </div>

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">文件列表</TabsTrigger>
          <TabsTrigger value="tasks">上传任务</TabsTrigger>
        </TabsList>

        {/* 文件列表 */}
        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索文件名称..." className="pl-8 h-8 text-xs" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="flex gap-1">
              {["all", "image", "video", "document", "other"].map(cat => (
                <Button key={cat} variant={categoryFilter === cat ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}>
                  {cat === "all" ? "全部" : categoryLabel[cat as FileCategory]}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                 <TableRow>
                     <TableHead>预览</TableHead>
                     <TableHead>文件名</TableHead>
                     <TableHead>类型</TableHead>
                     <TableHead>大小</TableHead>
                     <TableHead>标签</TableHead>
                     <TableHead>描述</TableHead>
                     <TableHead>备注</TableHead>
                     <TableHead>已推送</TableHead>
                     <TableHead>上传时间</TableHead>
                     <TableHead>上传者</TableHead>
                     <TableHead>操作</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedFiles.map(file => {
                    const Icon = categoryIcon[file.category];
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          {file.previewUrl ? (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-lg">
                              {file.previewUrl}
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">{file.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            <Icon className="h-3 w-3 mr-1" />
                            {categoryLabel[file.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{file.size}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {file.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[9px]">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{file.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{file.remark || "-"}</TableCell>
                        <TableCell className="text-xs">{file.pushCount} 台</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{file.uploadedAt}</TableCell>
                        <TableCell className="text-xs">{file.uploadedBy}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setShowBatchPush(file); setSelectedDevices([]); }}>
                            <Send className="h-3 w-3 mr-1" />
                            批量推送
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
           </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>共 {filteredFiles.length} 条记录</span>
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

        {/* 上传任务 */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>文件名</TableHead>
                    <TableHead>文件大小</TableHead>
                    <TableHead>目标设备数</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadTasks.map(task => {
                    const progress = task.totalCount > 0 ? Math.round(((task.successCount + task.failedCount) / task.totalCount) * 100) : 0;
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono text-xs">{task.id}</TableCell>
                        <TableCell className="text-sm font-medium">{task.fileName}</TableCell>
                        <TableCell className="text-xs">{task.fileSize}</TableCell>
                        <TableCell className="text-xs">{task.totalCount} 台</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1.5 w-20" />
                            <span className="text-xs">{task.successCount}/{task.totalCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.status === "success" ? "default" : task.status === "uploading" ? "outline" : task.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                            {task.status === "success" ? "完成" : task.status === "uploading" ? "传输中" : task.status === "failed" ? "失败" : "等待"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{task.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowTaskDetail(task)}>查看详情</Button>
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

      {/* 上传文件弹窗 */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription>上传图片、视频、文档等文件到平台</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>文件</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>点击或拖拽上传文件</p>
                <p className="text-xs mt-1">支持图片、视频、文档等，最大 200MB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>标签</Label><Input placeholder="用逗号分隔，如：推广,TikTok" /></div>
              <div className="space-y-2"><Label>描述</Label><Input placeholder="文件用途简述" /></div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Input placeholder="可选备注信息" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>取消</Button>
            <Button onClick={() => setShowUpload(false)}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量推送弹窗 */}
      <Dialog open={!!showBatchPush} onOpenChange={() => setShowBatchPush(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批量推送 - {showBatchPush?.name}</DialogTitle>
            <DialogDescription>选择目标 Android 云机设备进行文件推送（{showBatchPush?.size}）</DialogDescription>
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
                    <TableHead>状态</TableHead>
                    <TableHead>所属主板</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cloudDevices.map(dev => (
                    <TableRow key={dev.id} className="cursor-pointer" onClick={() => toggleDevice(dev.id)}>
                      <TableCell><Checkbox checked={selectedDevices.includes(dev.id)} onCheckedChange={() => toggleDevice(dev.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{dev.id}</TableCell>
                      <TableCell className="text-xs">{dev.model}</TableCell>
                      <TableCell>
                        <Badge variant={dev.status === "running" || dev.status === "idle" ? "default" : "secondary"} className="text-[10px]">
                          {dev.status === "running" ? "运行中" : dev.status === "idle" ? "空闲" : dev.status === "warming" ? "预热" : dev.status === "error" ? "异常" : "离线"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dev.deviceId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchPush(null)}>取消</Button>
            <Button onClick={() => setShowBatchPush(null)} disabled={selectedDevices.length === 0}>
              <Send className="h-4 w-4 mr-1" />
              推送到 {selectedDevices.length} 台设备
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 任务详情弹窗 */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>上传任务详情 - {showTaskDetail?.id}</DialogTitle>
            <DialogDescription>{showTaskDetail?.fileName} ({showTaskDetail?.fileSize}) · {showTaskDetail?.createdAt}</DialogDescription>
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
                          {d.status === "uploading" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
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
