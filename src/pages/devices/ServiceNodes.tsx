import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ServiceNode {
  id: string;
  name: string;
  address: string;
  online: "online" | "offline";
  lastSyncAt: string;
  createdAt: string;
  linkedCount: number;
}

const initialNodes: ServiceNode[] = [
  {
    id: "172.30.11.173",
    name: "雅安测试节点",
    address: "https://172.30.11.173:8444/",
    online: "online",
    lastSyncAt: "2026-07-21 11:21:12",
    createdAt: "2026-05-18 05:52:07",
    linkedCount: 1,
  },
  {
    id: "192.168.110.48",
    name: "本地测试节点",
    address: "",
    online: "online",
    lastSyncAt: "2026-07-06 11:03:13",
    createdAt: "2026-06-30 14:22:51",
    linkedCount: 0,
  },
];

const PAGE_SIZES = [10, 25, 50];

export default function ServiceNodes() {
  const [nodes, setNodes] = useState(initialNodes);
  const [nameFilter, setNameFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [onlineFilter, setOnlineFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [detailNode, setDetailNode] = useState<ServiceNode | null>(null);
  const [editNode, setEditNode] = useState<ServiceNode | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [deleteNode, setDeleteNode] = useState<ServiceNode | null>(null);

  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      if (nameFilter && !n.name.includes(nameFilter)) return false;
      if (idFilter && !n.id.includes(idFilter)) return false;
      if (onlineFilter !== "all" && n.online !== onlineFilter) return false;
      return true;
    });
  }, [nodes, nameFilter, idFilter, onlineFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (n: ServiceNode) => {
    setEditNode(n);
    setEditName(n.name);
    setEditAddress(n.address);
  };

  const saveEdit = () => {
    if (!editNode) return;
    if (!editName.trim()) {
      toast({ title: "请输入节点名称", variant: "destructive" });
      return;
    }
    setNodes((list) => list.map((n) => (n.id === editNode.id ? { ...n, name: editName, address: editAddress } : n)));
    toast({ title: "保存成功" });
    setEditNode(null);
  };

  const confirmDelete = () => {
    if (!deleteNode) return;
    if (deleteNode.linkedCount > 0) return;
    setNodes((list) => list.filter((n) => n.id !== deleteNode.id));
    toast({ title: "删除成功" });
    setDeleteNode(null);
  };

  const reset = () => {
    setNameFilter("");
    setIdFilter("");
    setOnlineFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">节点名称</Label>
              <Input placeholder="请输入节点名称" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">节点ID</Label>
              <Input placeholder="请输入节点ID" value={idFilter} onChange={(e) => setIdFilter(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">在线状态</Label>
              <Select value={onlineFilter} onValueChange={setOnlineFilter}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setPage(1)} className="gap-1"><Search className="w-4 h-4" />搜索</Button>
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
                <TableHead>节点名称</TableHead>
                <TableHead>节点ID</TableHead>
                <TableHead>节点地址</TableHead>
                <TableHead>在线状态</TableHead>
                <TableHead>最后同步时间</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((n, idx) => (
                <TableRow key={n.id}>
                  <TableCell className="text-muted-foreground">{(page - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell>{n.name}</TableCell>
                  <TableCell className="font-mono text-xs">{n.id}</TableCell>
                  <TableCell>
                    {n.address ? (
                      <a href={n.address} target="_blank" rel="noreferrer" className="text-primary hover:underline">{n.address}</a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                      n.online === "online"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {n.online === "online" ? "在线" : "离线"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{n.lastSyncAt}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{n.createdAt}</TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <button className="text-primary hover:underline" onClick={() => setDetailNode(n)}>详情</button>
                      <button className="text-amber-600 hover:underline" onClick={() => openEdit(n)}>编辑</button>
                      <button className="text-destructive hover:underline" onClick={() => setDeleteNode(n)}>删除</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">暂无数据</TableCell>
                </TableRow>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailNode} onOpenChange={(o) => !o && setDetailNode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>节点详情</DialogTitle></DialogHeader>
          {detailNode && (
            <div className="border border-border rounded-md overflow-hidden text-sm">
              <div className="grid grid-cols-[100px_1fr] border-b border-border">
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">节点ID</div>
                <div className="px-3 py-2">{detailNode.id}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr_100px_1fr] border-b border-border">
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">节点名称</div>
                <div className="px-3 py-2">{detailNode.name}</div>
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">节点地址</div>
                <div className="px-3 py-2">
                  {detailNode.address ? (
                    <a href={detailNode.address} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{detailNode.address}</a>
                  ) : "-"}
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr_100px_1fr] border-b border-border">
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">在线状态</div>
                <div className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                    detailNode.online === "online"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {detailNode.online === "online" ? "在线" : "离线"}
                  </span>
                </div>
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">最后同步时间</div>
                <div className="px-3 py-2">{detailNode.lastSyncAt}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <div className="bg-muted/40 px-3 py-2 text-muted-foreground">创建时间</div>
                <div className="px-3 py-2">{detailNode.createdAt}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editNode} onOpenChange={(o) => !o && setEditNode(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>编辑服务节点</DialogTitle></DialogHeader>
          {editNode && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-[80px_1fr] items-start gap-3">
                <Label className="text-sm text-right pt-2">节点ID</Label>
                <div>
                  <Input value={editNode.id} disabled />
                  <div className="text-xs text-muted-foreground mt-1">节点ID不可修改</div>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-sm text-right"><span className="text-destructive">*</span> 节点名称</Label>
                <div className="relative">
                  <Input value={editName} maxLength={100} onChange={(e) => setEditName(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{editName.length} / 100</span>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-sm text-right">节点地址</Label>
                <div className="relative">
                  <Input value={editAddress} maxLength={500} onChange={(e) => setEditAddress(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{editAddress.length} / 500</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNode(null)}>取消</Button>
            <Button onClick={saveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteNode} onOpenChange={(o) => !o && setDeleteNode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>确认删除节点</DialogTitle></DialogHeader>
          {deleteNode && (
            <div className="space-y-2 py-2 text-sm">
              <div>
                确定要删除节点 <span className="font-semibold">{deleteNode.name}</span> ({deleteNode.id}) 吗?
              </div>
              {deleteNode.linkedCount > 0 && (
                <div className="text-destructive">该节点已关联 {deleteNode.linkedCount} 项配置，不可删除</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteNode(null)}>取消</Button>
            <Button
              variant="destructive"
              disabled={!!deleteNode && deleteNode.linkedCount > 0}
              onClick={confirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}