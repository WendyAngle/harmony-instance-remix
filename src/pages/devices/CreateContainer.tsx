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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { romImages, hostServers } from "@/data/mock-data";
import { mockTags } from "@/pages/devices/TagManagement";
import { ArrowLeft, Plus, Minus, Trash2, HelpCircle } from "lucide-react";

interface EnvVariable {
  id: string;
  name: string;
  value: string;
  nameError?: string;
}

const BOARD_SPECS = [
  { id: "spec1", label: "Orion865 | 8vCPU | 12G内存 | 256G存储(20)" },
  { id: "spec2", label: "Orion865 | 8vCPU | 12G内存 | 128G存储(10)" },
  { id: "spec3", label: "RK3588 | 4vCPU | 8G内存 | 128G存储(8)" },
];

const BOARD_OS_OPTIONS = [
  { id: "os1", label: "Android 12 (AIC)" },
  { id: "os2", label: "Android 13 (AIC)" },
  { id: "os3", label: "Android 14 (AIC)" },
];

const CONTAINER_SPECS = [
  { id: "cs1", spec: "一开-限存储 | 8 vCPU | 12GB内存 | 200G", screen: "1080x1920/60fps/320dpi", count: 1 },
  { id: "cs2", spec: "二开-限存储 | 4 vCPU | 6GB内存 | 100G", screen: "1080x1920/60fps/320dpi", count: 2 },
  { id: "cs3", spec: "二开-限存储 | 4 vCPU | 6GB内存 | 100G", screen: "720x1280/30fps/320dpi", count: 2 },
  { id: "cs4", spec: "三开-限存储 | 3 vCPU | 4GB内存 | 70G", screen: "720x1280/30fps/320dpi", count: 3 },
  { id: "cs5", spec: "四开-限存储 | 2 vCPU | 3GB内存 | 50G", screen: "720x1280/30fps/320dpi", count: 4 },
  { id: "cs6", spec: "五开-限存储 | 2 vCPU | 2GB内存 | 40G", screen: "720x1280/30fps/320dpi", count: 5 },
];

const CONTAINER_ID_RULES = [
  { id: "rule1", label: "节点-16位uuid" },
  { id: "rule2", label: "节点-32位uuid" },
  { id: "rule3", label: "自定义前缀-序号" },
];

export default function CreateContainer() {
  const navigate = useNavigate();

  // 镜像
  const [createImageVisibility, setCreateImageVisibility] = useState<"public" | "private">("public");
  const [createImageId, setCreateImageId] = useState("");

  // 板卡
  const [boardSpec, setBoardSpec] = useState("");
  const [boardOs, setBoardOs] = useState("");
  const [strategy, setStrategy] = useState("random");
  const [quotaExceeded, setQuotaExceeded] = useState("no");

  // 存储 & 规格
  const [storageType, setStorageType] = useState("local");
  const [containerSpecId, setContainerSpecId] = useState("");

  // 屏幕 & ID规则
  const [customScreen, setCustomScreen] = useState("");
  const [containerIdRule, setContainerIdRule] = useState("rule1");

  // 网络
  const [networkMode, setNetworkMode] = useState("none");
  const [businessNetwork, setBusinessNetwork] = useState("");
  const [subnet, setSubnet] = useState("");

  // 指定板卡SN
  const [boardSn, setBoardSn] = useState("");

  // 数量
  const [quantity, setQuantity] = useState(1);

  // 自动开机 & 自动重启
  const [autoStart, setAutoStart] = useState("start");
  const [autoRestart, setAutoRestart] = useState(false);

  // 标签
  const [selectedTag, setSelectedTag] = useState("");

  // 备注
  // (unused but kept for form)

  // 环境变量
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);

  const createFilteredImages = useMemo(() => {
    return romImages.filter(r => r.type === "cloud_engine" && r.imageStatus === "normal" && r.visibility === createImageVisibility);
  }, [createImageVisibility]);

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
          <div className="grid gap-6 max-w-3xl">

            {/* 板卡规格 */}
            <div className="space-y-2">
              <Label>{req} 板卡规格</Label>
              <Select value={boardSpec} onValueChange={setBoardSpec}>
                <SelectTrigger><SelectValue placeholder="请选择板卡规格" /></SelectTrigger>
                <SelectContent>
                  {BOARD_SPECS.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 板卡操作系统 */}
            <div className="space-y-2">
              <Label>{req} 板卡操作系统</Label>
              <Select value={boardOs} onValueChange={setBoardOs}>
                <SelectTrigger><SelectValue placeholder="请选择板卡操作系统" /></SelectTrigger>
                <SelectContent>
                  {BOARD_OS_OPTIONS.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 策略 */}
            <div className="space-y-2">
              <Label>策略</Label>
              <RadioGroup value={strategy} onValueChange={setStrategy} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="random" id="strategy-random" />
                  <Label htmlFor="strategy-random" className="font-normal cursor-pointer">随机调度</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="assign" id="strategy-assign" />
                  <Label htmlFor="strategy-assign" className="font-normal cursor-pointer">指定板卡</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 指定板卡 - 当策略为指定板卡时显示 */}
            {strategy === "assign" && (
              <div className="space-y-2">
                <Label>{req} 指定板卡</Label>
                <Textarea
                  placeholder="输入板卡SN，多个请以","或者"|"分隔。最多输入1000个"
                  value={boardSn}
                  onChange={e => setBoardSn(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* 板卡容器数量超额 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>板卡容器数量超额</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    允许板卡上的容器数量超过规格定义的实例数量上限
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup value={quotaExceeded} onValueChange={setQuotaExceeded} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="quota-no" />
                  <Label htmlFor="quota-no" className="font-normal cursor-pointer">否</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="quota-yes" />
                  <Label htmlFor="quota-yes" className="font-normal cursor-pointer">是</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 存储类型 */}
            <div className="space-y-2">
              <Label>{req} 存储类型</Label>
              <RadioGroup value={storageType} onValueChange={setStorageType} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="local" id="storage-local" />
                  <Label htmlFor="storage-local" className="font-normal cursor-pointer">本地盘</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cloud-drive" id="storage-cloud" />
                  <Label htmlFor="storage-cloud" className="font-normal cursor-pointer">云盘</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {storageType === "local"
                  ? "所有容器实例独占算力资源和本地存储空间，无法实现算力的快速释放，但是存储的成本低"
                  : "存储类型为云盘的虚拟机需先挂载云盘后才允许启动"}
              </p>
            </div>

            {/* 容器规格 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>{req} 容器规格</Label>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>容器规格</TableHead>
                      <TableHead>屏幕布局</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          实例数量
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>每张板卡可创建的实例数量</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CONTAINER_SPECS.map(cs => (
                      <TableRow key={cs.id} className="cursor-pointer" onClick={() => setContainerSpecId(cs.id)}>
                        <TableCell>
                          <RadioGroup value={containerSpecId} onValueChange={setContainerSpecId}>
                            <RadioGroupItem value={cs.id} />
                          </RadioGroup>
                        </TableCell>
                        <TableCell className="text-sm">{cs.spec}</TableCell>
                        <TableCell className="text-sm">{cs.screen}</TableCell>
                        <TableCell className="text-sm text-right">{cs.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* 自定义屏幕布局 */}
            <div className="space-y-2">
              <Label>自定义屏幕布局</Label>
              <Select value={customScreen} onValueChange={setCustomScreen}>
                <SelectTrigger><SelectValue placeholder="请选择屏幕布局" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="720x1280_30_320">720×1280/30fps/320dpi</SelectItem>
                  <SelectItem value="1080x1920_60_320">1080×1920/60fps/320dpi</SelectItem>
                  <SelectItem value="1280x720_30_320">1280×720/30fps/320dpi</SelectItem>
                  <SelectItem value="1920x1080_60_320">1920×1080/60fps/320dpi</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">容器规格已默认屏幕布局，如需改动请选择自定义屏幕布局</p>
            </div>

            {/* 容器ID生成规则 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>容器ID生成规则</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    定义容器实例ID的生成方式，影响容器的唯一标识格式
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={containerIdRule} onValueChange={setContainerIdRule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTAINER_ID_RULES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 镜像 */}
            <div className="space-y-2">
              <Label>{req} 镜像</Label>
              <div className="flex items-center gap-0">
                <Button type="button" variant={createImageVisibility === "public" ? "default" : "outline"} className="rounded-r-none" size="sm" onClick={() => { setCreateImageVisibility("public"); setCreateImageId(""); }}>公有镜像</Button>
                <Button type="button" variant={createImageVisibility === "private" ? "default" : "outline"} className="rounded-l-none" size="sm" onClick={() => { setCreateImageVisibility("private"); setCreateImageId(""); }}>私有镜像</Button>
              </div>
              <Select value={createImageId} onValueChange={setCreateImageId}>
                <SelectTrigger><SelectValue placeholder="请选择镜像" /></SelectTrigger>
                <SelectContent>
                  {createFilteredImages.map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 网络 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>网络</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    选择容器的网络分配方式
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup value={networkMode} onValueChange={(v) => { setNetworkMode(v); setBusinessNetwork(""); setSubnet(""); }} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="none" id="net-none" />
                  <Label htmlFor="net-none" className="font-normal cursor-pointer">不指定</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="business" id="net-business" />
                  <Label htmlFor="net-business" className="font-normal cursor-pointer">指定业务网络</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="subnet" id="net-subnet" />
                  <Label htmlFor="net-subnet" className="font-normal cursor-pointer">指定子网</Label>
                </div>
              </RadioGroup>
              {networkMode === "business" && (
                <div className="flex items-center gap-3">
                  <Select value={businessNetwork} onValueChange={setBusinessNetwork}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="请选择业务网络" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net1">容器业务网络50 | DNAT | 172.31.50.0/24</SelectItem>
                      <SelectItem value="net2">容器业务网络51 | DNAT | 172.31.51.0/24</SelectItem>
                      <SelectItem value="net3">容器业务网络52 | NAT | 172.31.52.0/24</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">可用IP总和: 203</span>
                </div>
              )}
              {networkMode === "subnet" && (
                <div className="flex items-center gap-3">
                  <Select value={businessNetwork} onValueChange={(v) => { setBusinessNetwork(v); setSubnet(""); }}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="请选择业务网络" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net1">容器业务网络50 | DNAT | 172.31.50.0/24</SelectItem>
                      <SelectItem value="net2">容器业务网络51 | DNAT | 172.31.51.0/24</SelectItem>
                      <SelectItem value="net3">容器业务网络52 | NAT | 172.31.52.0/24</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={subnet} onValueChange={setSubnet}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="请选择子网" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sub1">50 | 172.31.50.0/24 (可用IP: 203)</SelectItem>
                      <SelectItem value="sub2">51 | 172.31.51.0/24 (可用IP: 150)</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">可用IP总和: 203</span>
                </div>
              )}
              {networkMode === "none" && (
                <p className="text-xs text-muted-foreground">
                  可用IP总和: 205，默认从已分配的业务网络中选择未被使用的IP
                </p>
              )}
            </div>

            {/* 数量 */}
            <div className="space-y-2">
              <Label>{req} 数量</Label>
              <div className="flex items-center gap-0 max-w-[180px]">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  className="rounded-none text-center h-10 border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={quantity}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1) setQuantity(v);
                  }}
                  min={1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">指板卡的数量，实际可得到的容器数量=板卡数量*规格对应的容器数量</p>
              <p className="text-xs text-muted-foreground">当前最多可创建 0 张</p>
            </div>

            {/* 自动开机 */}
            <div className="space-y-2">
              <Label>自动开机</Label>
              <RadioGroup value={autoStart} onValueChange={setAutoStart} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="start" id="auto-start" />
                  <Label htmlFor="auto-start" className="font-normal cursor-pointer">创建后开机</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="stop" id="auto-stop" />
                  <Label htmlFor="auto-stop" className="font-normal cursor-pointer">创建后关机</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger><SelectValue placeholder="请选择标签" /></SelectTrigger>
                <SelectContent>
                  {mockTags.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Android实例高级设置 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary">Android实例高级设置(环境变量、开发模式)</p>
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
          </div>

          <div className="flex items-center gap-3 mt-8 pt-5 border-t max-w-3xl">
            <Button variant="outline" onClick={() => navigate("/devices/virtual")}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
