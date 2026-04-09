import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const REGIONS = ["华北", "华东", "华南", "华中", "西南", "西北", "东北"];

export default function CreateNode() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    region: "",
    name: "",
    ip: "",
    port: "",
    callbackPort: "",
    remark: "",
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/ops/nodes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">创建节点</h1>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-[120px_1fr] items-center gap-y-5">
            <Label className="text-right pr-4"><span className="text-destructive">*</span> 所属区域</Label>
            <Select value={form.region} onValueChange={v => update("region", v)}>
              <SelectTrigger><SelectValue placeholder="请选择所属区域" /></SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>

            <Label className="text-right pr-4"><span className="text-destructive">*</span> 节点名称</Label>
            <Input placeholder="请输入节点名称" value={form.name} onChange={e => update("name", e.target.value)} />

            <Label className="text-right pr-4"><span className="text-destructive">*</span> 节点IP</Label>
            <Input placeholder="请输入节点IP" value={form.ip} onChange={e => update("ip", e.target.value)} />

            <Label className="text-right pr-4"><span className="text-destructive">*</span> 节点端口</Label>
            <Input placeholder="请输入节点端口" value={form.port} onChange={e => update("port", e.target.value)} />

            <Label className="text-right pr-4"><span className="text-destructive">*</span> 回调端口</Label>
            <Input placeholder="请输入回调端口" value={form.callbackPort} onChange={e => update("callbackPort", e.target.value)} />

            <Label className="text-right pr-4 self-start pt-2">备注</Label>
            <Textarea placeholder="请输入备注" value={form.remark} onChange={e => update("remark", e.target.value)} className="min-h-[120px]" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 max-w-2xl">
        <Button variant="outline" onClick={() => navigate("/ops/nodes")}>取 消</Button>
        <Button onClick={() => navigate("/ops/nodes")}>确 定</Button>
      </div>
    </div>
  );
}
