import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StorageConfig {
  id: string;
  nodeName: string;
  nodeIp: string;
  configName: string;
  provider: string;
  bucket: string;
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  basePath: string;
  enabled: boolean;
  remark: string;
  updatedAt: string;
}

const serviceNodes = [
  { name: "本地测试节点", ip: "192.168.110.48" },
  { name: "雅安测试节点", ip: "172.30.11.173" },
];

const initialData: StorageConfig[] = [
  {
    id: "1",
    nodeName: "本地测试节点",
    nodeIp: "192.168.110.48",
    configName: "matrix2 矩阵2",
    provider: "MINIO",
    bucket: "matrix2 矩阵2",
    endpoint: "http://minio1.bhyy.cc:9000",
    region: "",
    accessKey: "24KquHN8bcQ4CfisAIHQ",
    secretKey: "********",
    basePath: "/matrix2",
    enabled: true,
    remark: "",
    updatedAt: "2026-07-01 11:37:55",
  },
  {
    id: "2",
    nodeName: "雅安测试节点",
    nodeIp: "172.30.11.173",
    configName: "matrix 矩阵",
    provider: "minio 最低",
    bucket: "matrix 矩阵",
    endpoint: "http://minio1.bhyy.cc:9000",
    region: "",
    accessKey: "",
    secretKey: "********",
    basePath: "/matrix",
    enabled: true,
    remark: "",
    updatedAt: "2026-04-29 17:25:59",
  },
];

type FormState = Omit<StorageConfig, "id" | "updatedAt" | "nodeIp"> & { nodeIp: string };

const emptyForm: FormState = {
  nodeName: "",
  nodeIp: "",
  configName: "",
  provider: "MINIO",
  bucket: "",
  endpoint: "",
  region: "",
  accessKey: "",
  secretKey: "",
  basePath: "/profiles",
  enabled: true,
  remark: "",
};

export default function CloudStorageConfig() {
  const [rows, setRows] = useState(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isEdit = editingId !== null;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: StorageConfig) => {
    setEditingId(row.id);
    setForm({
      nodeName: row.nodeName,
      nodeIp: row.nodeIp,
      configName: row.configName,
      provider: row.provider,
      bucket: row.bucket,
      endpoint: row.endpoint,
      region: row.region,
      accessKey: row.accessKey,
      secretKey: "",
      basePath: row.basePath,
      enabled: row.enabled,
      remark: row.remark,
    });
    setDialogOpen(true);
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!form.nodeName) return toast({ title: "请选择服务节点", variant: "destructive" });
    if (!form.configName.trim()) return toast({ title: "请输入配置名称", variant: "destructive" });
    if (!form.bucket.trim()) return toast({ title: "请输入桶名称", variant: "destructive" });
    if (!form.endpoint.trim()) return toast({ title: "请输入访问地址", variant: "destructive" });

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (isEdit) {
      setRows((list) =>
        list.map((r) =>
          r.id === editingId
            ? {
                ...r,
                ...form,
                secretKey: form.secretKey || r.secretKey,
                updatedAt: now,
              }
            : r,
        ),
      );
      toast({ title: "保存成功" });
    } else {
      setRows((list) => [
        ...list,
        {
          id: String(Date.now()),
          ...form,
          secretKey: form.secretKey || "********",
          updatedAt: now,
        },
      ]);
      toast({ title: "新增成功" });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRows((list) => list.filter((r) => r.id !== deleteId));
    toast({ title: "删除成功" });
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-1">
          <Plus className="w-4 h-4" />新增云存储配置
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>服务节点</TableHead>
                <TableHead>配置名称</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>桶名称</TableHead>
                <TableHead>访问地址</TableHead>
                <TableHead>区域</TableHead>
                <TableHead>基础路径</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="text-primary">{r.nodeName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.nodeIp}</div>
                  </TableCell>
                  <TableCell>{r.configName}</TableCell>
                  <TableCell>{r.provider}</TableCell>
                  <TableCell>{r.bucket}</TableCell>
                  <TableCell className="text-xs">{r.endpoint}</TableCell>
                  <TableCell>{r.region || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.basePath}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                        r.enabled
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.enabled ? "启用" : "停用"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.updatedAt}</TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <button
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="w-3 h-3" />编辑
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-destructive hover:underline"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="w-3 h-3" />删除
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "编辑云存储配置" : "新增云存储配置"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormRow required label="服务节点">
              <Select
                value={form.nodeName}
                onValueChange={(v) => {
                  const n = serviceNodes.find((s) => s.name === v);
                  setForm((f) => ({ ...f, nodeName: v, nodeIp: n?.ip ?? "" }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="请选择服务节点" /></SelectTrigger>
                <SelectContent>
                  {serviceNodes.map((n) => (
                    <SelectItem key={n.ip} value={n.name}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow required label="配置名称">
              <Input value={form.configName} onChange={(e) => update("configName", e.target.value)} />
            </FormRow>
            <FormRow label="供应商">
              <Input value={form.provider} onChange={(e) => update("provider", e.target.value)} />
            </FormRow>
            <FormRow required label="桶名称">
              <Input value={form.bucket} onChange={(e) => update("bucket", e.target.value)} />
            </FormRow>
            <FormRow required label="访问地址">
              <Input placeholder="https://storage.example.com" value={form.endpoint} onChange={(e) => update("endpoint", e.target.value)} />
            </FormRow>
            <FormRow label="区域">
              <Input value={form.region} onChange={(e) => update("region", e.target.value)} />
            </FormRow>
            <FormRow label="Access Key 访问密钥">
              <Input value={form.accessKey} onChange={(e) => update("accessKey", e.target.value)} />
            </FormRow>
            <FormRow label="Secret Key 密钥">
              <Input
                type="password"
                placeholder={isEdit ? "留空则保留原 Secret Key" : ""}
                value={form.secretKey}
                onChange={(e) => update("secretKey", e.target.value)}
              />
            </FormRow>
            <FormRow label="Key 钥基础路径">
              <Input value={form.basePath} onChange={(e) => update("basePath", e.target.value)} />
            </FormRow>
            <FormRow label="状态">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!form.enabled ? "text-foreground" : "text-muted-foreground"}`}>停用</span>
                <Switch checked={form.enabled} onCheckedChange={(v) => update("enabled", v)} />
                <span className={`text-sm ${form.enabled ? "text-primary" : "text-muted-foreground"}`}>启用</span>
              </div>
            </FormRow>
            <FormRow label="备注">
              <Textarea rows={3} value={form.remark} onChange={(e) => update("remark", e.target.value)} />
            </FormRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>删除</DialogTitle></DialogHeader>
          <div className="flex items-start gap-2 py-2 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>确认删除该云存储配置吗?</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button onClick={confirmDelete}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-3">
      <Label className="text-sm text-right">
        {required && <span className="text-destructive mr-1">*</span>}
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}