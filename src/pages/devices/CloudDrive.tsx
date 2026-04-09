import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Plus, Pencil, Trash2, Link, Unlink, ChevronLeft, ChevronRight, HardDrive } from "lucide-react";
import { type BoundAccount } from "@/data/mock-data";

export type CloudDriveStatus = "available" | "mounted" | "error";

export interface CloudDriveItem {
  id: string;
  name: string;
  capacity: number; // GB
  used: number; // GB
  status: CloudDriveStatus;
  mountedTo: string | null; // device id or name
  type: "SSD" | "HDD";
  createdAt: string;
  remark: string;
  boundAccounts: BoundAccount[];
}

export const initialDrives: CloudDriveItem[] = [
  { id: "cd-001", name: "数据盘-A", capacity: 100, used: 45, status: "mounted", mountedTo: "DEV-ARM-001", type: "SSD", createdAt: "2025-03-10", remark: "主数据存储", boundAccounts: [{ platform: "tiktok", username: "@techvibes_01", accountId: "ACC-001" }, { platform: "facebook", username: "globalnews.page", accountId: "ACC-003" }] },
  { id: "cd-002", name: "备份盘-B", capacity: 200, used: 120, status: "mounted", mountedTo: "DEV-ARM-003", type: "HDD", createdAt: "2025-02-15", remark: "定期备份", boundAccounts: [{ platform: "tiktok", username: "@dancequeen_x", accountId: "ACC-002" }] },
  { id: "cd-003", name: "测试盘-C", capacity: 50, used: 0, status: "available", mountedTo: null, type: "SSD", createdAt: "2025-04-01", remark: "测试用途", boundAccounts: [] },
  { id: "cd-004", name: "日志盘-D", capacity: 500, used: 310, status: "mounted", mountedTo: "DEV-WIN-002", type: "HDD", createdAt: "2025-01-20", remark: "日志收集", boundAccounts: [{ platform: "instagram", username: "@foodielife_sg", accountId: "ACC-005" }] },
  { id: "cd-005", name: "临时盘-E", capacity: 30, used: 5, status: "available", mountedTo: null, type: "SSD", createdAt: "2025-03-28", remark: "", boundAccounts: [] },
  { id: "cd-006", name: "异常盘-F", capacity: 100, used: 0, status: "error", mountedTo: null, type: "HDD", createdAt: "2025-02-01", remark: "IO错误", boundAccounts: [] },
];

const statusMap: Record<CloudDriveStatus, { label: string; color: string }> = {
  available: { label: "可用", color: "bg-emerald-500" },
  mounted: { label: "已挂载", color: "bg-blue-500" },
  error: { label: "异常", color: "bg-red-500" },
};

const PAGE_SIZES = [10, 20, 50];

export default function CloudDrive() {
  const [drives, setDrives] = useState<CloudDriveItem[]>(initialDrives);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [showCreate, setShowCreate] = useState(false);
  const [editingDrive, setEditingDrive] = useState<CloudDriveItem | null>(null);
  const [deletingDrive, setDeletingDrive] = useState<CloudDriveItem | null>(null);
  const [mountingDrive, setMountingDrive] = useState<CloudDriveItem | null>(null);
  const [unmountingDrive, setUnmountingDrive] = useState<CloudDriveItem | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formType, setFormType] = useState<"SSD" | "HDD">("SSD");
  const [formRemark, setFormRemark] = useState("");
  const [mountTarget, setMountTarget] = useState("");

  const filteredDrives = useMemo(() => {
    let result = drives;
    if (filterStatus !== "all") result = result.filter(d => d.status === filterStatus);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
    }
    return result;
  }, [drives, filterStatus, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredDrives.length / pageSize));
  const pagedDrives = filteredDrives.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetForm = () => { setFormName(""); setFormCapacity(""); setFormType("SSD"); setFormRemark(""); };

  const openCreate = () => { resetForm(); setShowCreate(true); };

  const openEdit = (d: CloudDriveItem) => {
    setFormName(d.name); setFormCapacity(String(d.capacity)); setFormType(d.type); setFormRemark(d.remark);
    setEditingDrive(d);
  };

  const handleCreate = () => {
    const newDrive: CloudDriveItem = {
      id: `cd-${String(drives.length + 1).padStart(3, "0")}`,
      name: formName, capacity: Number(formCapacity) || 50, used: 0,
      status: "available", mountedTo: null, type: formType,
      createdAt: new Date().toISOString().slice(0, 10), remark: formRemark,
      boundAccounts: [],
    };
    setDrives(prev => [...prev, newDrive]);
    setShowCreate(false); resetForm();
  };

  const handleEdit = () => {
    if (!editingDrive) return;
    setDrives(prev => prev.map(d => d.id === editingDrive.id
      ? { ...d, name: formName, capacity: Number(formCapacity) || d.capacity, type: formType, remark: formRemark }
      : d
    ));
    setEditingDrive(null); resetForm();
  };

  const handleDelete = () => {
    if (!deletingDrive) return;
    setDrives(prev => prev.filter(d => d.id !== deletingDrive.id));
    setDeletingDrive(null);
  };

  const handleMount = () => {
    if (!mountingDrive || !mountTarget.trim()) return;
    setDrives(prev => prev.map(d => d.id === mountingDrive.id
      ? { ...d, status: "mounted" as CloudDriveStatus, mountedTo: mountTarget.trim() }
      : d
    ));
    setMountingDrive(null); setMountTarget("");
  };

  const handleUnmount = () => {
    if (!unmountingDrive) return;
    setDrives(prev => prev.map(d => d.id === unmountingDrive.id
      ? { ...d, status: "available" as CloudDriveStatus, mountedTo: null }
      : d
    ));
    setUnmountingDrive(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">镜像实例管理</h1>
          <p className="text-sm text-muted-foreground mt-1">创建、编辑、删除镜像实例，以及挂载/卸载到设备</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />创建镜像实例
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="搜索镜像实例名称/ID..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="available">可用</SelectItem>
            <SelectItem value="mounted">已挂载</SelectItem>
            <SelectItem value="error">异常</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>镜像实例ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>容量</TableHead>
                <TableHead>已用</TableHead>
                <TableHead>挂载设备</TableHead>
                <TableHead>绑定账号</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedDrives.map((drive) => (
                <TableRow key={drive.id}>
                  <TableCell className="font-mono text-xs">{drive.id}</TableCell>
                  <TableCell className="font-medium">{drive.name}</TableCell>
                  <TableCell>
                    <Badge variant={drive.type === "SSD" ? "default" : "secondary"} className="text-[10px]">{drive.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{drive.capacity} GB</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${drive.capacity > 0 ? (drive.used / drive.capacity) * 100 : 0}%` }} />
                      </div>
                      <span>{drive.used} GB</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{drive.mountedTo || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    {drive.boundAccounts.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {drive.boundAccounts.map((ba, i) => (
                          <span key={i} className="text-[11px]">
                            <Badge variant="outline" className="text-[9px] mr-1 px-1">{ba.platform}</Badge>
                            {ba.username}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">未绑定</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{drive.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${statusMap[drive.status].color}`}>
                      {statusMap[drive.status].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(drive)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑</TooltipContent>
                      </Tooltip>
                      {drive.status === "available" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMountTarget(""); setMountingDrive(drive); }}>
                              <Link className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>挂载</TooltipContent>
                        </Tooltip>
                      )}
                      {drive.status === "mounted" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUnmountingDrive(drive)}>
                              <Unlink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>卸载</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingDrive(drive)} disabled={drive.status === "mounted"}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{drive.status === "mounted" ? "需先卸载才能删除" : "删除"}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagedDrives.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    暂无镜像实例数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filteredDrives.length} 条记录</span>
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

      {/* 创建镜像实例 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建镜像实例</DialogTitle>
            <DialogDescription>配置新镜像实例的基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>镜像实例名称</Label><Input placeholder="输入镜像实例名称" value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>容量 (GB)</Label><Input type="number" placeholder="100" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>磁盘类型</Label>
                <Select value={formType} onValueChange={v => setFormType(v as "SSD" | "HDD")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="HDD">HDD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Input placeholder="可选备注信息" value={formRemark} onChange={e => setFormRemark(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!formName.trim()}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑镜像实例 */}
      <Dialog open={!!editingDrive} onOpenChange={() => { setEditingDrive(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑镜像实例</DialogTitle>
            <DialogDescription>修改镜像实例 {editingDrive?.id} 的信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>镜像实例名称</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>容量 (GB)</Label><Input type="number" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>磁盘类型</Label>
                <Select value={formType} onValueChange={v => setFormType(v as "SSD" | "HDD")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="HDD">HDD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Input value={formRemark} onChange={e => setFormRemark(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingDrive(null); resetForm(); }}>取消</Button>
            <Button onClick={handleEdit} disabled={!formName.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 挂载镜像实例 */}
      <Dialog open={!!mountingDrive} onOpenChange={() => setMountingDrive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>挂载镜像实例</DialogTitle>
            <DialogDescription>将镜像实例 {mountingDrive?.name} 挂载到目标设备</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>目标设备ID</Label>
              <Input placeholder="例如 DEV-ARM-001" value={mountTarget} onChange={e => setMountTarget(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMountingDrive(null)}>取消</Button>
            <Button onClick={handleMount} disabled={!mountTarget.trim()}>挂载</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 卸载确认 */}
      <AlertDialog open={!!unmountingDrive} onOpenChange={() => setUnmountingDrive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认卸载镜像实例？</AlertDialogTitle>
            <AlertDialogDescription>
              将从设备 {unmountingDrive?.mountedTo} 卸载镜像实例 {unmountingDrive?.name}。卸载后数据仍保留，但设备将无法访问该镜像实例。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmount}>确认卸载</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deletingDrive} onOpenChange={() => setDeletingDrive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除镜像实例？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除镜像实例 {deletingDrive?.name} ({deletingDrive?.id})，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
