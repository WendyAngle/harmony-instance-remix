import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Home, Monitor, Server, Settings, Cpu, Image as ImageIcon, Wifi, MonitorPlay,
  Database, CircuitBoard, User, Users, Menu as MenuIcon, FolderOpen, Tag, Package,
  Bell, FileText, ChevronRight, Plus, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";

type MenuType = "目录" | "菜单" | "按钮";

interface MenuNode {
  id: string;
  name: string;
  type: MenuType;
  perm?: string;
  routePath?: string;
  componentPath?: string;
  icon?: string;
  order: number;
  visible: boolean;
  status: "正常" | "停用";
  isExternal?: boolean;
  fullscreen?: boolean;
  fixedTab?: boolean;
  cached?: boolean;
  hiddenTab?: boolean;
  children?: MenuNode[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Monitor, Server, Settings, Cpu, Image: ImageIcon, Wifi, MonitorPlay,
  Database, CircuitBoard, User, Users, Menu: MenuIcon, Folder: FolderOpen,
  Tag, Package, Bell, FileText,
};

const seed: MenuNode[] = [
  { id: "1", name: "控制台", type: "菜单", icon: "Home", routePath: "/home/index", componentPath: "/console/index", order: 1, visible: true, status: "正常" },
  {
    id: "2", name: "云资源管理", type: "目录", icon: "Monitor", routePath: "/cloud-resource-center", componentPath: "Layout 布局", order: 2, visible: true, status: "正常",
    children: [
      { id: "2-1", name: "虚拟机管理", type: "菜单", icon: "Cpu", routePath: "/cloud-resource-center/vm-management", componentPath: "/cloud-resource-center/vm-management/index", order: 1, visible: true, status: "正常" },
      { id: "2-2", name: "镜像实例", type: "菜单", icon: "Image", routePath: "/cloud-resource-center/image-instance", componentPath: "/cloud-resource-center/image-instance/index", order: 2, visible: true, status: "正常" },
      { id: "2-3", name: "IP池管理", type: "菜单", icon: "Wifi", routePath: "/cloud-resource-center/ip-pool-management", componentPath: "/cloud-resource-center/ip-pool-management/index", order: 3, visible: true, status: "正常" },
      { id: "2-4", name: "代理会话", type: "菜单", icon: "Wifi", routePath: "/cloud-resource-center/proxy-session", componentPath: "/cloud-resource-center/proxy-session/index", order: 4, visible: true, status: "正常" },
      { id: "2-5", name: "VNC会话", type: "菜单", icon: "MonitorPlay", routePath: "/cloud-resource-center/vnc-session", componentPath: "/cloud-resource-center/vnc-session/index", order: 5, visible: true, status: "正常" },
    ],
  },
  {
    id: "3", name: "设备资源管理", type: "目录", icon: "Server", routePath: "/device-resource-center", componentPath: "Layout 布局", order: 3, visible: true, status: "正常",
    children: [
      { id: "3-1", name: "主机管理", type: "菜单", icon: "Database", routePath: "/device-resource-center/host-management", componentPath: "/device-resource-center/host-management/index", order: 1, visible: true, status: "正常" },
      { id: "3-2", name: "ARM板卡", type: "菜单", icon: "CircuitBoard", routePath: "/device-resource-center/arm-board-card", componentPath: "/device-resource-center/arm-board-card/index", order: 2, visible: true, status: "正常" },
      { id: "3-3", name: "服务节点", type: "菜单", icon: "Server", routePath: "/device-resource-center/server-node-management", componentPath: "/device-resource-center/server-node-management/index", order: 3, visible: true, status: "正常" },
    ],
  },
  {
    id: "4", name: "系统管理", type: "目录", icon: "Settings", routePath: "/system-management", componentPath: "Layout 布局", order: 4, visible: true, status: "正常",
    children: [
      {
        id: "4-1", name: "用户管理", type: "菜单", icon: "User", routePath: "/system/accountManage", componentPath: "/system/accountManage/index", order: 1, visible: true, status: "正常",
        children: [
          { id: "4-1-1", name: "用户查询", type: "按钮", perm: "system:user:query", order: 1, visible: true, status: "正常" },
          { id: "4-1-2", name: "用户新增", type: "按钮", perm: "system:user:add", order: 2, visible: true, status: "正常" },
          { id: "4-1-3", name: "用户修改", type: "按钮", perm: "system:user:edit", order: 3, visible: true, status: "正常" },
          { id: "4-1-4", name: "用户删除", type: "按钮", perm: "system:user:remove", order: 4, visible: true, status: "正常" },
        ],
      },
      {
        id: "4-2", name: "角色管理", type: "菜单", icon: "Users", routePath: "/system/roleManage", componentPath: "/system/roleManage/index", order: 2, visible: true, status: "正常",
        children: [
          { id: "4-2-1", name: "角色查询", type: "按钮", perm: "system:role:query", order: 1, visible: true, status: "正常" },
          { id: "4-2-2", name: "角色新增", type: "按钮", perm: "system:role:add", order: 2, visible: true, status: "正常" },
          { id: "4-2-3", name: "角色修改", type: "按钮", perm: "system:role:edit", order: 3, visible: true, status: "正常" },
          { id: "4-2-4", name: "角色删除", type: "按钮", perm: "system:role:remove", order: 4, visible: true, status: "正常" },
          { id: "4-2-5", name: "角色启停", type: "按钮", perm: "system:role:status", order: 5, visible: true, status: "正常" },
        ],
      },
      {
        id: "4-3", name: "菜单管理", type: "菜单", icon: "Menu", routePath: "/system/menuMange", componentPath: "/system/menuMange/index", order: 3, visible: true, status: "正常",
        children: [
          { id: "4-3-1", name: "菜单查询", type: "按钮", perm: "system:menu:query", order: 1, visible: true, status: "正常" },
          { id: "4-3-2", name: "菜单新增", type: "按钮", perm: "system:menu:add", order: 2, visible: true, status: "正常" },
          { id: "4-3-3", name: "菜单修改", type: "按钮", perm: "system:menu:edit", order: 3, visible: true, status: "正常" },
          { id: "4-3-4", name: "菜单删除", type: "按钮", perm: "system:menu:remove", order: 4, visible: true, status: "正常" },
        ],
      },
      { id: "4-4", name: "云存储配置", type: "菜单", icon: "Folder", routePath: "/system-management/cloud-storage-config", componentPath: "/system-management/cloud-storage-config/index", order: 5, visible: true, status: "正常" },
      { id: "4-5", name: "标签管理", type: "菜单", icon: "Tag", routePath: "/system-management/tag-management", componentPath: "/system-management/tag-management/index", order: 6, visible: true, status: "正常" },
      { id: "4-6", name: "应用管理", type: "菜单", icon: "Package", routePath: "/system-management/app-management", componentPath: "/system-management/app-management/index", order: 7, visible: true, status: "正常" },
      {
        id: "4-7", name: "系统消息", type: "菜单", icon: "Bell", routePath: "/system-management/system-message", componentPath: "/system-management/system-message/index", order: 9, visible: true, status: "正常",
        children: [
          { id: "4-7-1", name: "消息已读", type: "按钮", perm: "system:message:read", order: 1, visible: true, status: "正常" },
          { id: "4-7-2", name: "全部已读", type: "按钮", perm: "system:message:read:all", order: 2, visible: true, status: "正常" },
        ],
      },
      { id: "4-8", name: "日志中心", type: "菜单", icon: "FileText", routePath: "/system-management/log-center", componentPath: "/system-management/log-center/index", order: 10, visible: true, status: "正常" },
    ],
  },
];

const typeBadge = (t: MenuType) => {
  if (t === "菜单") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">菜单</Badge>;
  if (t === "目录") return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">目录</Badge>;
  return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">按钮</Badge>;
};

// Flatten tree honoring expansion + name filter
function flatten(nodes: MenuNode[], depth: number, expanded: Set<string>, filter: string, path: string[] = []): { node: MenuNode; depth: number; hasChildren: boolean }[] {
  const out: { node: MenuNode; depth: number; hasChildren: boolean }[] = [];
  for (const n of nodes) {
    const matches = !filter || n.name.toLowerCase().includes(filter.toLowerCase());
    const childRows = n.children ? flatten(n.children, depth + 1, expanded, filter, [...path, n.name]) : [];
    if (matches || childRows.length > 0) {
      out.push({ node: n, depth, hasChildren: !!(n.children && n.children.length) });
      if (expanded.has(n.id)) out.push(...childRows);
    }
  }
  return out;
}

function collectIds(nodes: MenuNode[]): string[] {
  const ids: string[] = [];
  const walk = (arr: MenuNode[]) => arr.forEach(n => { if (n.children?.length) { ids.push(n.id); walk(n.children); } });
  walk(nodes);
  return ids;
}

// Parent options for dialog
function parentOptions(nodes: MenuNode[], depth = 0, excludeId?: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const n of nodes) {
    if (n.id === excludeId) continue;
    if (n.type !== "按钮") {
      out.push({ id: n.id, label: `${"　".repeat(depth)}${n.name}` });
      if (n.children) out.push(...parentOptions(n.children, depth + 1, excludeId));
    }
  }
  return out;
}

// Immutable tree ops
function updateNode(nodes: MenuNode[], id: string, patch: Partial<MenuNode>): MenuNode[] {
  return nodes.map(n => n.id === id ? { ...n, ...patch } : { ...n, children: n.children ? updateNode(n.children, id, patch) : n.children });
}
function removeNode(nodes: MenuNode[], id: string): MenuNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: n.children ? removeNode(n.children, id) : n.children }));
}
function addNode(nodes: MenuNode[], parentId: string | "0", node: MenuNode): MenuNode[] {
  if (parentId === "0") return [...nodes, node];
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...(n.children ?? []), node] };
    return { ...n, children: n.children ? addNode(n.children, parentId, node) : n.children };
  });
}

const emptyForm = (): MenuNode & { parentId: string } => ({
  parentId: "0",
  id: "",
  name: "",
  type: "目录",
  perm: "",
  routePath: "",
  componentPath: "",
  icon: "",
  order: 0,
  visible: true,
  status: "正常",
  isExternal: false,
  fullscreen: false,
  fixedTab: false,
  cached: false,
  hiddenTab: false,
});

export default function MenuManagement() {
  const [tree, setTree] = useState<MenuNode[]>(seed);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["2", "3", "4", "4-1", "4-2", "4-3", "4-7"]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<MenuNode | null>(null);

  const rows = useMemo(() => flatten(tree, 0, expanded, filter), [tree, expanded, filter]);
  const parents = useMemo(() => parentOptions(tree, 0, editingId ?? undefined), [tree, editingId]);

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const expandAll = () => setExpanded(new Set(collectIds(tree)));
  const collapseAll = () => setExpanded(new Set());

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };
  const openEdit = (node: MenuNode) => {
    // find parent
    let parentId: string = "0";
    const findParent = (arr: MenuNode[], pid: string): boolean => {
      for (const n of arr) {
        if (n.children?.some(c => c.id === node.id)) { parentId = n.id; return true; }
        if (n.children && findParent(n.children, n.id)) return true;
      }
      return false;
    };
    findParent(tree, "0");
    setEditingId(node.id);
    setForm({ ...emptyForm(), ...node, parentId });
    setDialogOpen(true);
  };
  const submit = () => {
    if (!form.name.trim()) { toast.error("请输入菜单名称"); return; }
    if (form.type !== "按钮" && !form.routePath?.trim()) { toast.error("请输入路由地址"); return; }
    if (form.type === "菜单" && !form.componentPath?.trim()) { toast.error("请输入组件路径"); return; }
    if (editingId) {
      setTree(prev => updateNode(prev, editingId, form));
      toast.success("菜单已更新");
    } else {
      const id = `n-${Date.now()}`;
      const node: MenuNode = { ...form, id };
      setTree(prev => addNode(prev, form.parentId, node));
      if (form.parentId !== "0") setExpanded(prev => new Set(prev).add(form.parentId));
      toast.success("菜单已新增");
    }
    setDialogOpen(false);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setTree(prev => removeNode(prev, deleteTarget.id));
    toast.success("删除成功");
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">菜单管理</h1>
        <p className="text-sm text-slate-500 mt-1">维护系统菜单结构、路由与按钮权限</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">菜单列表</h2>
          <div className="flex items-center gap-2">
            <Button onClick={openAdd} className="bg-teal-500 hover:bg-teal-600">
              <Plus className="h-4 w-4 mr-1" /> 新增菜单
            </Button>
            <Input
              placeholder="输入菜单名称过滤"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-56"
            />
            <Button variant="outline" onClick={expandAll}>展开全部</Button>
            <Button variant="outline" onClick={collapseAll}>折叠全部</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[260px]">菜单名称</TableHead>
                <TableHead className="w-[90px]">菜单类型</TableHead>
                <TableHead className="w-[180px]">权限标识</TableHead>
                <TableHead>路由路径</TableHead>
                <TableHead>组件路径</TableHead>
                <TableHead className="w-[60px]">排序</TableHead>
                <TableHead className="w-[70px]">可见</TableHead>
                <TableHead className="w-[130px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ node, depth, hasChildren }) => {
                const Icon = node.icon ? iconMap[node.icon] : undefined;
                const isOpen = expanded.has(node.id);
                return (
                  <TableRow key={node.id}>
                    <TableCell>
                      <div className="flex items-center" style={{ paddingLeft: depth * 20 }}>
                        {hasChildren ? (
                          <button onClick={() => toggle(node.id)} className="mr-1 p-0.5 rounded hover:bg-slate-100">
                            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          </button>
                        ) : (
                          <span className="mr-1 w-5 inline-block" />
                        )}
                        {Icon && <Icon className="h-4 w-4 text-slate-500 mr-2" />}
                        <span className="text-sm text-slate-700">{node.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{typeBadge(node.type)}</TableCell>
                    <TableCell className="text-sm text-slate-500">{node.perm || ""}</TableCell>
                    <TableCell className="text-sm text-slate-500">{node.routePath || ""}</TableCell>
                    <TableCell className="text-sm text-slate-500">{node.componentPath || ""}</TableCell>
                    <TableCell className="text-sm text-slate-500">{node.order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={node.visible}
                        onCheckedChange={(v) => setTree(prev => updateNode(prev, node.id, { visible: v }))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(node)} className="text-teal-600 hover:text-teal-700 text-sm inline-flex items-center gap-1">
                          <Pencil className="h-3.5 w-3.5" /> 编辑
                        </button>
                        <button onClick={() => setDeleteTarget(node)} className="text-red-500 hover:text-red-600 text-sm inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" /> 删除
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">暂无数据</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑菜单" : "新增菜单"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-2">
            <Field label="上级菜单" required className="col-span-2">
              <Select value={form.parentId} onValueChange={(v) => setForm(f => ({ ...f, parentId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">主目录</SelectItem>
                  {parents.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="菜单类型" required className="col-span-2">
              <RadioGroup
                value={form.type}
                onValueChange={(v: MenuType) => setForm(f => ({ ...f, type: v }))}
                className="flex items-center gap-6"
              >
                {(["目录", "菜单", "按钮"] as MenuType[]).map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value={t} /> {t}
                  </label>
                ))}
              </RadioGroup>
            </Field>

            {form.type !== "按钮" && (
              <Field label="菜单图标" required>
                <Input value={form.icon ?? ""} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="如 HomeFilled" />
              </Field>
            )}
            <Field label="菜单名称" required>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            {form.type !== "按钮" && (
              <Field label="路由名称" required>
                <Input value={form.routePath?.split("/").pop() ?? ""} onChange={e => setForm(f => ({ ...f, routePath: e.target.value ? `/${e.target.value}` : "" }))} />
              </Field>
            )}
            <Field label="显示排序" required>
              <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </Field>

            {form.type !== "按钮" && (
              <>
                <Field label="是否外链">
                  <YesNo value={!!form.isExternal} onChange={(v) => setForm(f => ({ ...f, isExternal: v }))} />
                </Field>
                <Field label="路由地址" required>
                  <Input value={form.routePath ?? ""} onChange={e => setForm(f => ({ ...f, routePath: e.target.value }))} />
                </Field>
              </>
            )}

            {form.type === "菜单" && (
              <Field label="组件路径" required>
                <Input value={form.componentPath ?? ""} onChange={e => setForm(f => ({ ...f, componentPath: e.target.value }))} />
              </Field>
            )}
            <Field label="权限字符" required={form.type === "按钮"}>
              <Input value={form.perm ?? ""} onChange={e => setForm(f => ({ ...f, perm: e.target.value }))} />
            </Field>

            {form.type !== "按钮" && (
              <>
                <Field label="详情页高亮菜单">
                  <Input value={""} onChange={() => {}} />
                </Field>
                <Field label="显示状态" required>
                  <YesNo value={form.visible} onChange={(v) => setForm(f => ({ ...f, visible: v }))} yesLabel="显示" noLabel="隐藏" />
                </Field>
                <Field label="菜单状态">
                  <RadioGroup value={form.status} onValueChange={(v: "正常" | "停用") => setForm(f => ({ ...f, status: v }))} className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="正常" /> 正常</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="停用" /> 停用</label>
                  </RadioGroup>
                </Field>
                <Field label="是否全屏"><YesNo value={!!form.fullscreen} onChange={(v) => setForm(f => ({ ...f, fullscreen: v }))} /></Field>
                <Field label="是否固定标签页"><YesNo value={!!form.fixedTab} onChange={(v) => setForm(f => ({ ...f, fixedTab: v }))} /></Field>
                <Field label="是否缓存路由"><YesNo value={!!form.cached} onChange={(v) => setForm(f => ({ ...f, cached: v }))} /></Field>
                <Field label="是否隐藏标签"><YesNo value={!!form.hiddenTab} onChange={(v) => setForm(f => ({ ...f, hiddenTab: v }))} /></Field>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button className="bg-teal-500 hover:bg-teal-600" onClick={submit}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>温馨提示</AlertDialogTitle>
            <AlertDialogDescription>
              是否确认删除菜单名称为"{deleteTarget?.name}"的数据?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-teal-500 hover:bg-teal-600">确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className ?? ""}`}>
      <Label className="w-28 pt-2 text-right text-sm text-slate-600 shrink-0">
        {required && <span className="text-red-500 mr-0.5">*</span>}{label}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function YesNo({ value, onChange, yesLabel = "是", noLabel = "否" }: { value: boolean; onChange: (v: boolean) => void; yesLabel?: string; noLabel?: string }) {
  return (
    <RadioGroup value={value ? "y" : "n"} onValueChange={(v) => onChange(v === "y")} className="flex items-center gap-6">
      <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="y" /> {yesLabel}</label>
      <label className="flex items-center gap-2 text-sm cursor-pointer"><RadioGroupItem value="n" /> {noLabel}</label>
    </RadioGroup>
  );
}