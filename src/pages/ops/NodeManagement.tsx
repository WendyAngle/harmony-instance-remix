import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, Info, Copy } from "lucide-react";

// ===== Types =====
type OnlineStatus = "online" | "offline";
type EnableStatus = "enabled" | "disabled";
type MaintenanceStatus = "normal" | "maintenance";

interface ClusterNode {
  id: string;
  uuid: string;
  name: string;
  datacenter: string;
  region: string;
  ip: string;
  port: number;
  callbackPort: number;
  onlineStatus: OnlineStatus;
  enableStatus: EnableStatus;
  maintenanceStatus: MaintenanceStatus;
  serverCount: number;
  boardCardCount: number;
  instanceCount: number;
  remark: string;
  createdAt: string;
  lastOperatedAt: string;
}

const initialNodes: ClusterNode[] = [
  {
    id: "NODE-001", uuid: "dd407bbd9e2d40745e2e94088e22aac5", name: "yaan-test",
    datacenter: "雅安", region: "西南", ip: "172.31.11.92", port: 80, callbackPort: 5672,
    onlineStatus: "online", enableStatus: "enabled", maintenanceStatus: "normal",
    serverCount: 1, boardCardCount: 80, instanceCount: 46, remark: "",
    createdAt: "2026-03-12 14:00:19", lastOperatedAt: "2026-03-12 14:00:52",
  },
];

const REGIONS = ["华北", "华东", "华南", "华中", "西南", "西北", "东北"];
const PAGE_SIZES = [10, 20, 50];

export default function NodeManagement() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<ClusterNode[]>(initialNodes);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialogs
  const [editNode, setEditNode] = useState<ClusterNode | null>(null);
  const [editForm, setEditForm] = useState({ name: "", remark: "" });
  const [disableConfirm, setDisableConfirm] = useState<ClusterNode[] | null>(null);
  const [disableAcknowledged, setDisableAcknowledged] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ClusterNode[] | null>(null);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [enableConfirm, setEnableConfirm] = useState<ClusterNode[] | null>(null);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState<ClusterNode[] | null>(null);
  const [maintenanceAcknowledged, setMaintenanceAcknowledged] = useState(false);
  const [cancelMaintenanceConfirm, setCancelMaintenanceConfirm] = useState<ClusterNode[] | null>(null);
  const [detailNode, setDetailNode] = useState<ClusterNode | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "resources">("overview");
  const [resourceCategory, setResourceCategory] = useState<"servers" | "boards" | "containers">("servers");

  const filteredNodes = useMemo(() => {
    if (!searchText.trim()) return nodes;
    const q = searchText.trim().toLowerCase();
    return nodes.filter(n => n.name.toLowerCase().includes(q));
  }, [searchText, nodes]);

  const totalPages = Math.max(1, Math.ceil(filteredNodes.length / pageSize));
  const pagedNodes = filteredNodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allSelected = pagedNodes.length > 0 && pagedNodes.every(n => selectedIds.includes(n.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pagedNodes.some(n => n.id === id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pagedNodes.map(n => n.id)])]);
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedNodes = nodes.filter(n => selectedIds.includes(n.id));

  const openEdit = (node: ClusterNode) => {
    setEditForm({ name: node.name, remark: node.remark });
    setEditNode(node);
  };

  const saveEdit = () => {
    if (!editNode) return;
    setNodes(prev => prev.map(n => n.id === editNode.id ? { ...n, name: editForm.name, remark: editForm.remark } : n));
    setEditNode(null);
  };

  const handleDisable = (targets: ClusterNode[]) => {
    setDisableAcknowledged(false);
    setDisableConfirm(targets);
  };

  const confirmDisable = () => {
    if (!disableConfirm) return;
    const ids = disableConfirm.map(n => n.id);
    setNodes(prev => prev.map(n => ids.includes(n.id) ? { ...n, enableStatus: "disabled" } : n));
    setDisableConfirm(null);
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleEnable = (targets: ClusterNode[]) => {
    setEnableConfirm(targets);
  };

  const confirmEnable = () => {
    if (!enableConfirm) return;
    const ids = enableConfirm.map(n => n.id);
    setNodes(prev => prev.map(n => ids.includes(n.id) ? { ...n, enableStatus: "enabled" } : n));
    setEnableConfirm(null);
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleMaintenance = (targets: ClusterNode[]) => {
    setMaintenanceAcknowledged(false);
    setMaintenanceConfirm(targets);
  };

  const confirmMaintenance = () => {
    if (!maintenanceConfirm) return;
    const ids = maintenanceConfirm.map(n => n.id);
    setNodes(prev => prev.map(n => ids.includes(n.id) ? { ...n, maintenanceStatus: "maintenance" } : n));
    setMaintenanceConfirm(null);
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleCancelMaintenance = (targets: ClusterNode[]) => {
    setCancelMaintenanceConfirm(targets);
  };

  const confirmCancelMaintenance = () => {
    if (!cancelMaintenanceConfirm) return;
    const ids = cancelMaintenanceConfirm.map(n => n.id);
    setNodes(prev => prev.map(n => ids.includes(n.id) ? { ...n, maintenanceStatus: "normal" } : n));
    setCancelMaintenanceConfirm(null);
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleDelete = (targets: ClusterNode[]) => {
    setDeleteAcknowledged(false);
    setDeleteConfirm(targets);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const ids = deleteConfirm.map(n => n.id);
    setNodes(prev => prev.filter(n => !ids.includes(n.id)));
    setDeleteConfirm(null);
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const executeBatchAction = (action: string) => {
    if (selectedNodes.length === 0) return;
    switch (action) {
      case "enable": handleEnable(selectedNodes); break;
      case "disable": handleDisable(selectedNodes); break;
      case "maintenance": handleMaintenance(selectedNodes); break;
      case "cancelMaintenance": handleCancelMaintenance(selectedNodes); break;
      case "delete": handleDelete(selectedNodes); break;
    }
  };

  // Detail view
  if (detailNode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground" onClick={() => setDetailNode(null)}>节点</span>
          <span>&gt;</span>
          <span className="text-foreground">{detailNode.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{detailNode.name}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={detailNode.enableStatus === "enabled"}>
              <span className="text-green-600 mr-1">▶</span> 启用
            </Button>
            <Button variant="outline" size="sm" disabled={detailNode.enableStatus === "disabled"} onClick={() => handleDisable([detailNode])}>
              <span className="text-destructive mr-1">■</span> 停用
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">更多操作 <ChevronDown className="h-3 w-3 ml-1" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleMaintenance([detailNode])}>维护</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCancelMaintenance([detailNode])}>取消维护</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete([detailNode])}>删除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-4 border-b">
          <button className={`pb-2 text-sm font-medium ${detailTab === "overview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`} onClick={() => setDetailTab("overview")}>总览</button>
          <button className={`pb-2 text-sm font-medium ${detailTab === "resources" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`} onClick={() => setDetailTab("resources")}>关联资源</button>
        </div>

        {detailTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">基本信息</h3>
                </div>
                <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-sm">
                  <div><span className="text-muted-foreground">UUID</span><p className="font-mono mt-1">{detailNode.uuid}</p></div>
                  <div><span className="text-muted-foreground">在线状态</span><p className="mt-1 flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${detailNode.onlineStatus === "online" ? "bg-green-500" : "bg-gray-400"}`} />{detailNode.onlineStatus === "online" ? "在线" : "离线"}</p></div>
                  <div><span className="text-muted-foreground">启用状态</span><p className="mt-1 flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${detailNode.enableStatus === "enabled" ? "bg-green-500" : "bg-gray-400"}`} />{detailNode.enableStatus === "enabled" ? "启用" : "停用"}</p></div>
                  <div><span className="text-muted-foreground">维护状态</span><p className="mt-1 flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${detailNode.maintenanceStatus === "normal" ? "bg-green-500" : "bg-orange-500"}`} />{detailNode.maintenanceStatus === "normal" ? "正常" : "维护中"}</p></div>
                  <div><span className="text-muted-foreground">节点IP</span><p className="mt-1">{detailNode.ip}</p></div>
                  <div><span className="text-muted-foreground">节点端口</span><p className="mt-1">{detailNode.port}</p></div>
                  <div><span className="text-muted-foreground">回调端口</span><p className="mt-1">{detailNode.callbackPort}</p></div>
                  <div><span className="text-muted-foreground">服务器数量</span><p className="mt-1">{detailNode.serverCount}</p></div>
                  <div><span className="text-muted-foreground">板卡数量</span><p className="mt-1">{detailNode.boardCardCount}</p></div>
                  <div><span className="text-muted-foreground">实例数量</span><p className="mt-1">{detailNode.instanceCount}</p></div>
                  <div><span className="text-muted-foreground">创建时间</span><p className="mt-1">{detailNode.createdAt}</p></div>
                  <div><span className="text-muted-foreground">最后操作时间</span><p className="mt-1">{detailNode.lastOperatedAt}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">配置信息</h3>
                </div>
                <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-sm">
                  <div><span className="text-muted-foreground">所属区域</span><p className="mt-1 text-primary">{detailNode.region}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {detailTab === "resources" && (
          <div className="flex gap-4">
            {/* Left sidebar */}
            <div className="w-48 shrink-0 space-y-1">
              {([
                { key: "servers" as const, label: "ARM阵列服务器" },
                { key: "boards" as const, label: "ARM板卡" },
                { key: "containers" as const, label: "虚拟机" },
              ]).map(item => (
                <button
                  key={item.key}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${resourceCategory === item.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => setResourceCategory(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {resourceCategory === "servers" ? "添加服务器" : resourceCategory === "boards" ? "添加板卡" : "添加虚拟机"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">批量操作 <ChevronDown className="h-3 w-3 ml-1" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>启用</DropdownMenuItem>
                      <DropdownMenuItem>停用</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8 h-8 text-xs" placeholder="支持多个条件组合搜索，例如 IPs: ip1|ip2|ip5  Names: name1|name2|name3" />
                </div>
              </div>

              {resourceCategory === "servers" && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><Checkbox /></TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>BMC管控IP</TableHead>
                          <TableHead>默认刷机包</TableHead>
                          <TableHead>在线状态</TableHead>
                          <TableHead>启用状态</TableHead>
                          <TableHead>维护状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-primary cursor-pointer hover:underline text-sm truncate max-w-[180px]">西南_yaan_s-6359a683f20...</span>
                              <Copy className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground shrink-0" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-sm truncate max-w-[160px]">s-6359a683f204568a2e...</span>
                              <Copy className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground shrink-0" />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">172.31.14.10</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[180px]">QFIL-SM-OR65L10CDA_V2.2.1 04_20260304_2056</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-sm"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />在线</span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-sm"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />启用</span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-sm"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />正常</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-primary cursor-pointer hover:underline">识别系统信息</span>
                              <span className="text-primary cursor-pointer hover:underline">升级BMC</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <span className="text-primary cursor-pointer hover:underline">更多</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>详情</DropdownMenuItem>
                                  <DropdownMenuItem>停用</DropdownMenuItem>
                                  <DropdownMenuItem>维护</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {resourceCategory === "boards" && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><Checkbox /></TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>IP地址</TableHead>
                          <TableHead>在线状态</TableHead>
                          <TableHead>启用状态</TableHead>
                          <TableHead>维护状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">暂无板卡数据</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {resourceCategory === "containers" && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><Checkbox /></TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>IP地址</TableHead>
                          <TableHead>在线状态</TableHead>
                          <TableHead>启用状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">暂无虚拟机数据</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-end text-xs text-muted-foreground gap-3">
                <span>共1条</span>
                <Select value="50">
                  <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50条/页</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronLeft className="h-3.5 w-3.5" /></Button>
                  <span className="px-2">1</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronRight className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderDisableDialog()}
        {renderDeleteDialog()}
        {renderEnableDialog()}
        {renderMaintenanceDialog()}
        {renderCancelMaintenanceDialog()}
      </div>
    );
  }

  function renderDisableDialog() {
    return (
      <Dialog open={!!disableConfirm} onOpenChange={() => setDisableConfirm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>确定要停用节点？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="text-sm text-destructive">停用节点会停用服务器、公有网络等资源，同时还会停用各资源下的所有子级资源（如Android计算实例），请谨慎操作。</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选择 {disableConfirm?.length} 项</p>
              <div className="border rounded-lg p-3 max-h-32 overflow-auto">
                {disableConfirm?.map(n => (
                  <p key={n.id} className="text-sm py-1">{n.name}</p>
                ))}
              </div>
            </div>
            {disableConfirm && disableConfirm.length > 0 && (
              <p className="text-sm text-muted-foreground">
                当前有 {disableConfirm.reduce((s, n) => s + n.serverCount, 0)} 台服务器、{" "}
                {disableConfirm.reduce((s, n) => s + n.instanceCount, 0)} 台Android计算实例与所选节点相关
              </p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox checked={disableAcknowledged} onCheckedChange={(v) => setDisableAcknowledged(!!v)} id="disable-ack" />
              <Label htmlFor="disable-ack" className="text-sm font-normal cursor-pointer">我已知晓上述风险</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableConfirm(null)}>取 消</Button>
            <Button onClick={confirmDisable} disabled={!disableAcknowledged}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderDeleteDialog() {
    return (
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>确定要删除节点？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="text-sm text-destructive">删除节点会删除服务器、公有网络等资源，同时还会删除各资源下的所有子级资源（如Android计算实例），请谨慎操作。</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选择 {deleteConfirm?.length} 项</p>
              <div className="border rounded-lg p-3 max-h-32 overflow-auto">
                {deleteConfirm?.map(n => (
                  <p key={n.id} className="text-sm py-1">{n.name}</p>
                ))}
              </div>
            </div>
            {deleteConfirm && deleteConfirm.length > 0 && (
              <p className="text-sm text-muted-foreground">
                当前有 {deleteConfirm.reduce((s, n) => s + n.serverCount, 0)} 台服务器、{" "}
                {deleteConfirm.reduce((s, n) => s + n.instanceCount, 0)} 台Android计算实例与所选节点相关
              </p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox checked={deleteAcknowledged} onCheckedChange={(v) => setDeleteAcknowledged(!!v)} id="delete-ack" />
              <Label htmlFor="delete-ack" className="text-sm font-normal cursor-pointer">我已知晓上述风险</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>取 消</Button>
            <Button onClick={confirmDelete} disabled={!deleteAcknowledged}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderEnableDialog() {
    return (
      <Dialog open={!!enableConfirm} onOpenChange={() => setEnableConfirm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>确定要启动节点？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="text-sm text-destructive">确定要启动节点？</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选择 {enableConfirm?.length} 项</p>
              <div className="border rounded-lg p-3 max-h-32 overflow-auto">
                {enableConfirm?.map(n => (
                  <p key={n.id} className="text-sm py-1">{n.name}</p>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnableConfirm(null)}>取 消</Button>
            <Button onClick={confirmEnable}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderMaintenanceDialog() {
    return (
      <Dialog open={!!maintenanceConfirm} onOpenChange={() => setMaintenanceConfirm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>确定要维护节点？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="text-sm text-destructive">维护节点会维护服务器、公有网络等资源，同时还会维护各资源下的所有子级资源（如Android计算实例），请谨慎操作。</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选择 {maintenanceConfirm?.length} 项</p>
              <div className="border rounded-lg p-3 max-h-32 overflow-auto">
                {maintenanceConfirm?.map(n => (
                  <p key={n.id} className="text-sm py-1">{n.name}</p>
                ))}
              </div>
            </div>
            {maintenanceConfirm && maintenanceConfirm.length > 0 && (
              <p className="text-sm text-muted-foreground">
                当前有 {maintenanceConfirm.reduce((s, n) => s + n.serverCount, 0)} 台服务器、{" "}
                {maintenanceConfirm.reduce((s, n) => s + n.instanceCount, 0)} 台Android计算实例与所选节点相关
              </p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox checked={maintenanceAcknowledged} onCheckedChange={(v) => setMaintenanceAcknowledged(!!v)} id="maint-ack" />
              <Label htmlFor="maint-ack" className="text-sm font-normal cursor-pointer">我已知晓上述风险</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceConfirm(null)}>取 消</Button>
            <Button onClick={confirmMaintenance} disabled={!maintenanceAcknowledged}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderCancelMaintenanceDialog() {
    return (
      <Dialog open={!!cancelMaintenanceConfirm} onOpenChange={() => setCancelMaintenanceConfirm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>确定要取消维护节点？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <span className="text-destructive text-lg">⚠</span>
              <p className="text-sm text-destructive">确定要取消维护节点？</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选择 {cancelMaintenanceConfirm?.length} 项</p>
              <div className="border rounded-lg p-3 max-h-32 overflow-auto">
                {cancelMaintenanceConfirm?.map(n => (
                  <p key={n.id} className="text-sm py-1">{n.name}</p>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelMaintenanceConfirm(null)}>取 消</Button>
            <Button onClick={confirmCancelMaintenance}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Create node page
  // We'll handle this via route, but for now use navigate
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">节点</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>管理集群节点，包括创建、编辑、启停用和维护操作</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/ops/nodes/create")}>
            <Plus className="h-4 w-4 mr-1" />创建节点
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
                批量操作 <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => executeBatchAction("enable")}>启用</DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeBatchAction("disable")}>停用</DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeBatchAction("maintenance")}>维护</DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeBatchAction("cancelMaintenance")}>取消维护</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => executeBatchAction("delete")}>删除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="请输入名称搜索" value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead>名称</TableHead>
                <TableHead>机房</TableHead>
                <TableHead>所属区域</TableHead>
                <TableHead>在线状态</TableHead>
                <TableHead>启用状态</TableHead>
                <TableHead>维护状态</TableHead>
                <TableHead className="text-right">服务器数量</TableHead>
                <TableHead className="text-right">实例数量</TableHead>
                <TableHead>备注</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedNodes.map(node => (
                <TableRow key={node.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(node.id)} onCheckedChange={() => toggleSelect(node.id)} />
                  </TableCell>
                  <TableCell>
                    <span className="text-primary cursor-pointer hover:underline" onClick={() => { setDetailTab("overview"); setDetailNode(node); }}>
                      {node.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{node.datacenter}</TableCell>
                  <TableCell className="text-sm">{node.region}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full ${node.onlineStatus === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                      {node.onlineStatus === "online" ? "在线" : "离线"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full ${node.enableStatus === "enabled" ? "bg-green-500" : "bg-gray-400"}`} />
                      {node.enableStatus === "enabled" ? "启用" : "停用"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full ${node.maintenanceStatus === "normal" ? "bg-green-500" : "bg-orange-500"}`} />
                      {node.maintenanceStatus === "normal" ? "正常" : "维护中"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">{node.serverCount}</TableCell>
                  <TableCell className="text-right text-sm">{node.instanceCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{node.remark || ""}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{node.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-primary text-sm cursor-pointer hover:underline" onClick={() => openEdit(node)}>编辑</span>
                      {node.enableStatus === "enabled" ? (
                        <span className="text-primary text-sm cursor-pointer hover:underline" onClick={() => handleDisable([node])}>停用</span>
                      ) : (
                        <span className="text-primary text-sm cursor-pointer hover:underline" onClick={() => handleEnable([node])}>启用</span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="text-primary text-sm cursor-pointer hover:underline">更多</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDetailTab("overview"); setDetailNode(node); }}>详情</DropdownMenuItem>
                          {node.maintenanceStatus === "normal" ? (
                            <DropdownMenuItem onClick={() => handleMaintenance([node])}>维护</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleCancelMaintenance([node])}>取消维护</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete([node])}>删除</DropdownMenuItem>
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

      {/* Pagination */}
      <div className="flex items-center justify-end text-xs text-muted-foreground gap-3">
        <span>共{filteredNodes.length}条</span>
        <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
          <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}条/页</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2">{currentPage}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editNode} onOpenChange={(open) => !open && setEditNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改节点</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 节点名称</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea placeholder="请输入备注" value={editForm.remark} onChange={e => setEditForm(f => ({ ...f, remark: e.target.value }))} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNode(null)}>取 消</Button>
            <Button onClick={saveEdit}>确 定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderDisableDialog()}
      {renderDeleteDialog()}
      {renderEnableDialog()}
      {renderMaintenanceDialog()}
      {renderCancelMaintenanceDialog()}
    </div>
  );
}
