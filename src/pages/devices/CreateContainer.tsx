import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { romImages, proxyItems, hostServers, type VirtualDeviceType } from "@/data/mock-data";
import { ArrowLeft, Plus, Trash2, HelpCircle } from "lucide-react";

interface EnvVariable {
  id: string;
  name: string;
  value: string;
  nameError?: string;
}

export default function CreateContainer() {
  const navigate = useNavigate();
  const createType = "cloud" as VirtualDeviceType;
  const [createImageVisibility, setCreateImageVisibility] = useState<"public" | "private">("public");
  const [createImageId, setCreateImageId] = useState("");
  const [autoRestart, setAutoRestart] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);

  const createFilteredImages = useMemo(() => {
    const typeMap: Record<string, string> = { cloud: "cloud_engine", windows: "windows_vm", linux: "linux_vm" };
    return romImages.filter(r => r.type === (typeMap[createType] || "cloud_engine") && r.imageStatus === "normal" && r.visibility === createImageVisibility);
  }, [createType, createImageVisibility]);

  const armServers = hostServers.filter(s => s.type === "arm");
  const x86Servers = hostServers.filter(s => s.type === "x86");

  const getAvailableIps = () => proxyItems.filter(p => p.cloudDriveIds.length === 0 && p.status === "available");

  const addEnvVar = () => {
    setEnvVars(prev => [...prev, { id: String(Date.now()), name: "", value: "", nameError: "" }]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars(prev => prev.filter(v => v.id !== id));
  };

  const updateEnvVar = (id: string, field: "name" | "value", val: string) => {
    setEnvVars(prev => prev.map(v => v.id === id ? { ...v, [field]: val, nameError: field === "name" && !val.trim() ? "请输入变量名称" : "" } : v));
  };

  const handleCreate = () => {
    navigate("/devices/virtual");
  };

  const req = <span className="text-destructive">*</span>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices/virtual")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建云机</h1>
          <p className="text-sm text-muted-foreground mt-0.5">创建基于ARM服务器的云机实例</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-5 max-w-2xl">
            {/* 虚拟机名称 */}
            <div className="space-y-2">
              <Label>{req} 虚拟机名称</Label>
              <Input placeholder="请输入虚拟机名称" />
            </div>


            {/* 所属主机 */}
            <div className="space-y-2">
              <Label>{req} 所属主机</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择主机服务器" /></SelectTrigger>
                <SelectContent>
                  {(createType === "cloud" ? armServers : x86Servers).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.ip} · {s.clusterId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">云机部署在ARM服务器上</p>
            </div>

            {/* 镜像模版 */}
            <div className="space-y-2">
              <Label>{req} 镜像模版</Label>
              <div className="flex items-center gap-0">
                <Button type="button" variant={createImageVisibility === "public" ? "default" : "outline"} className="rounded-r-none" size="sm" onClick={() => { setCreateImageVisibility("public"); setCreateImageId(""); }}>公有镜像</Button>
                <Button type="button" variant={createImageVisibility === "private" ? "default" : "outline"} className="rounded-l-none" size="sm" onClick={() => { setCreateImageVisibility("private"); setCreateImageId(""); }}>私有镜像</Button>
              </div>
              <Select value={createImageId} onValueChange={setCreateImageId}>
                <SelectTrigger><SelectValue placeholder="请选择镜像模版" /></SelectTrigger>
                <SelectContent>
                  {createFilteredImages.map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CPU核数 & 内存 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{req} CPU核数</Label>
                <Input type="number" placeholder="如：4" min={1} />
              </div>
              <div className="space-y-2">
                <Label>{req} 内存 (GB)</Label>
                <Input type="number" placeholder="如：8" min={1} />
              </div>
            </div>

            {/* 磁盘 & 操作系统版本 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{req} 磁盘 (TB)</Label>
                <Input type="number" placeholder="如：0.5" min={0} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label>{req} 操作系统版本</Label>
                <Input placeholder={createType === "cloud" ? "Android 12" : createType === "windows" ? "Windows Server 2022" : "Ubuntu 22.04 LTS"} />
              </div>
            </div>

            {/* 云机专属选项 */}
            {createType === "cloud" && (
              <>
                <div className="space-y-2">
                  <Label>存储类型</Label>
                  <RadioGroup defaultValue="cloud-drive" className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="local" id="storage-local" />
                      <Label htmlFor="storage-local" className="font-normal cursor-pointer">本地</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="cloud-drive" id="storage-cloud" />
                      <Label htmlFor="storage-cloud" className="font-normal cursor-pointer">云盘</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">存储类型为云盘的虚拟机需先挂载云盘后才允许启动</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>自定义屏幕布局</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择屏幕布局" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id1">ID1 (720×1280/320dpi/30fps)</SelectItem>
                        <SelectItem value="id2">ID2 (1280×720/320dpi/30fps)</SelectItem>
                        <SelectItem value="id3">ID3 (1080×1920/320dpi/60fps)</SelectItem>
                        <SelectItem value="id4">ID4 (1920×1080/320dpi/60fps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>模拟机型</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择机型" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pixel6">Pixel 6</SelectItem>
                        <SelectItem value="pixel7">Pixel 7</SelectItem>
                        <SelectItem value="s22">Samsung S22</SelectItem>
                        <SelectItem value="s23">Samsung S23</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* 代理IP */}
            <div className="space-y-2">
              <Label>代理IP</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择代理IP或留空" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不绑定</SelectItem>
                  {getAvailableIps().map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.ip}:{p.port} ({p.protocol}) · {p.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 自动重启开关 */}
            <div className="flex items-center justify-between">
              <Label>自动重启开关</Label>
              <Switch checked={autoRestart} onCheckedChange={setAutoRestart} />
            </div>

            {/* 创建数量 */}
            <div className="space-y-2">
              <Label>创建数量</Label>
              <Input type="number" placeholder="1" defaultValue={1} min={1} max={50} className="max-w-[120px]" />
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea placeholder="选填备注信息" rows={3} />
            </div>

            {/* 环境变量 - 仅云机 */}
            {createType === "cloud" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary">Android实例高级设置</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">环境变量</Label>
                    <Button size="sm" onClick={addEnvVar}>
                      <Plus className="h-3.5 w-3.5 mr-1" />新增变量
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        以AIC_开头的环境变量，系统默认会转化ro.aic.*属性进行设置
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {envVars.map(ev => (
                    <div key={ev.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input placeholder="请输入变量名称" value={ev.name} onChange={e => updateEnvVar(ev.id, "name", e.target.value)} className={ev.nameError ? "border-destructive" : ""} />
                        </div>
                        <div className="flex-1">
                          <Input placeholder="请输入变量值" value={ev.value} onChange={e => updateEnvVar(ev.id, "value", e.target.value)} />
                        </div>
                        <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeEnvVar(ev.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {ev.nameError && <p className="text-xs text-destructive">{ev.nameError}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-8 pt-5 border-t max-w-2xl">
            <Button variant="outline" onClick={() => navigate("/devices/virtual")}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
