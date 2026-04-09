import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { physicalDevices, romImages, proxyItems, type VirtualDeviceType } from "@/data/mock-data";
import { ArrowLeft, Plus, Trash2, HelpCircle } from "lucide-react";

interface EnvVariable {
  id: string;
  name: string;
  value: string;
  nameError?: string;
}

export default function CreateContainer() {
  const navigate = useNavigate();
  const [createType, setCreateType] = useState<VirtualDeviceType>("cloud");
  const [createImageVisibility, setCreateImageVisibility] = useState<"public" | "custom">("public");
  const [createImageId, setCreateImageId] = useState("");
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);

  const availableDevicesForCreate = createType === "cloud"
    ? physicalDevices.filter(d => d.type === "board" && d.status === "online" && d.activeSlots < d.totalSlots)
    : physicalDevices.filter(d => d.type === "windows" && d.status === "online" && d.activeSlots < d.totalSlots);

  const createFilteredImages = useMemo(() => {
    const typeFilter = createType === "cloud" ? "cloud_engine" : "windows_vm";
    return romImages.filter(r => r.type === typeFilter && r.imageStatus === "normal" && r.visibility === createImageVisibility);
  }, [createType, createImageVisibility]);

  const getAvailableIps = () => proxyItems.filter(p => p.virtualDeviceIds.length === 0 && p.status === "available");

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

  return (
    <div className="space-y-6">
      {/* 顶部返回栏 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices/virtual")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建虚拟机实例</h1>
          <p className="text-sm text-muted-foreground mt-0.5">在物理设备上创建新的云机或Windows虚拟机实例</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-5 max-w-2xl">
            <div className="space-y-2">
              <Label>实例类型</Label>
              <Select value={createType} onValueChange={(v) => setCreateType(v as VirtualDeviceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">云机</SelectItem>
                  <SelectItem value="windows">Windows虚拟机</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createType === "cloud" && (
              <div className="space-y-2">
                <Label>所属板卡</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择板卡" /></SelectTrigger>
                  <SelectContent>
                    {physicalDevices.filter(d => d.type === "board" && d.status === "online").map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} · {d.ip} · 剩余 {d.totalSlots - d.activeSlots}/{d.totalSlots} 槽位
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>目标物理设备</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择物理设备" /></SelectTrigger>
                <SelectContent>
                  {availableDevicesForCreate.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.id} · {d.ip} · 剩余 {d.totalSlots - d.activeSlots}/{d.totalSlots} 槽位
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label><span className="text-destructive mr-0.5">*</span>{createType === "cloud" ? "镜像模版" : "镜像模版"}</Label>
              <div className="flex items-center gap-0">
                <Button
                  type="button"
                  variant={createImageVisibility === "public" ? "default" : "outline"}
                  className="rounded-r-none"
                  size="sm"
                  onClick={() => { setCreateImageVisibility("public"); setCreateImageId(""); }}
                >
                  公有镜像模版
                </Button>
                <Button
                  type="button"
                  variant={createImageVisibility === "custom" ? "default" : "outline"}
                  className="rounded-l-none"
                  size="sm"
                  onClick={() => { setCreateImageVisibility("custom"); setCreateImageId(""); }}
                >
                  私有镜像模版
                </Button>
              </div>
              <Select value={createImageId} onValueChange={setCreateImageId}>
                <SelectTrigger><SelectValue placeholder="请选择镜像模版" /></SelectTrigger>
                <SelectContent>
                  {createFilteredImages.map(img => (
                    <SelectItem key={img.id} value={img.id}>
                      {img.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createImageVisibility === "custom" && (
                <p className="text-xs text-muted-foreground">未同步的镜像模版无法使用，需先在自定义镜像模版列表将镜像同步至节点，镜像文件才可用</p>
              )}
            </div>
            {createType === "cloud" ? (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><span className="text-destructive">*</span>存储类型</Label>
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
                  <p className="text-xs text-muted-foreground">虚拟机需要先绑定云盘，才允许启动</p>
                </div>
                <div className="space-y-2">
                  <Label>自定义屏幕布局</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="选择屏幕布局" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id1">ID1 (720*1280/320dpi/30fps)</SelectItem>
                      <SelectItem value="id2">ID2 (1280*720/320dpi/30fps)</SelectItem>
                      <SelectItem value="id3">ID3 (1080*1920/320dpi/60fps)</SelectItem>
                      <SelectItem value="id4">ID4 (1920*1080/320dpi/60fps)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">虚拟机规格已默认屏幕布局，如需改动请选择自定义屏幕布局</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>模拟机型</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择机型" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pixel6">Pixel 6</SelectItem>
                        <SelectItem value="pixel7">Pixel 7</SelectItem>
                        <SelectItem value="s22">Samsung S22</SelectItem>
                        <SelectItem value="s23">Samsung S23</SelectItem>
                        <SelectItem value="oneplus10">OnePlus 10</SelectItem>
                        <SelectItem value="xiaomi12">Xiaomi 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>创建数量</Label>
                    <Input type="number" placeholder="1" defaultValue={1} min={1} max={10} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>分辨率</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择分辨率" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080x2400">1080×2400 (FHD+)</SelectItem>
                        <SelectItem value="1080x1920">1080×1920 (FHD)</SelectItem>
                        <SelectItem value="720x1280">720×1280 (HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>内存分配</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择内存" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 GB</SelectItem>
                        <SelectItem value="4">4 GB</SelectItem>
                        <SelectItem value="6">6 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>浏览器内核</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择内核" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chromium120">Chromium 120</SelectItem>
                        <SelectItem value="chromium122">Chromium 122</SelectItem>
                        <SelectItem value="chromium124">Chromium 124</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>创建数量</Label>
                    <Input type="number" placeholder="1" defaultValue={1} min={1} max={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User-Agent 模式</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择模式" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">随机生成</SelectItem>
                        <SelectItem value="windows">Windows桌面</SelectItem>
                        <SelectItem value="mac">macOS桌面</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>语言</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="选择语言" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="ja-JP">日本語</SelectItem>
                        <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>代理IP（可选）</Label>
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

            {/* 环境变量 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">android实例高级设置(环境变量、开发模式)</p>
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
                        <Input
                          placeholder="请输入变量名称"
                          value={ev.name}
                          onChange={e => updateEnvVar(ev.id, "name", e.target.value)}
                          className={ev.nameError ? "border-destructive" : ""}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="请输入变量值"
                          value={ev.value}
                          onChange={e => updateEnvVar(ev.id, "value", e.target.value)}
                        />
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
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center gap-3 mt-8 pt-5 border-t max-w-2xl">
            <Button variant="outline" onClick={() => navigate("/devices/virtual")}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
