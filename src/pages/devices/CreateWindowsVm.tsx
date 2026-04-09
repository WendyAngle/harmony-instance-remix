import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { hostServers, romImages, proxyItems } from "@/data/mock-data";
import { ArrowLeft } from "lucide-react";

const TABS = ["常规", "操作系统", "系统", "磁盘", "CPU", "内存", "网络", "确认"] as const;
type TabKey = typeof TABS[number];

export default function CreateWindowsVm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("常规");

  // --- 常规 ---
  const [vmName, setVmName] = useState("");
  const [hostServerId, setHostServerId] = useState("");
  const [remark, setRemark] = useState("");

  // --- 操作系统 ---
  const [mediaSource, setMediaSource] = useState<"iso" | "physical" | "none">("iso");
  const [isoStorage, setIsoStorage] = useState("local");
  const [isoImage, setIsoImage] = useState("");
  const [guestOsType, setGuestOsType] = useState("Windows");
  const [guestOsVersion, setGuestOsVersion] = useState("Windows 10");

  // --- 系统 ---
  const [graphicCard, setGraphicCard] = useState("默认");
  const [machineType, setMachineType] = useState("默认 (i440fx)");
  const [scsiController, setScsiController] = useState("VirtIO SCSI single");
  const [bios, setBios] = useState("默认 (SeaBIOS)");
  const [qemuAgent, setQemuAgent] = useState(false);
  const [addTpm, setAddTpm] = useState(false);

  // --- 磁盘 ---
  const [diskBus, setDiskBus] = useState("SCSI");
  const [diskDevice, setDiskDevice] = useState("0");
  const [diskStorage, setDiskStorage] = useState("local-lvm");
  const [diskSize, setDiskSize] = useState("32");
  const [diskCache, setDiskCache] = useState("默认 (无缓存)");
  const [diskDiscard, setDiskDiscard] = useState(false);
  const [diskIoThread, setDiskIoThread] = useState(true);
  const [bwReadLimit, setBwReadLimit] = useState("");
  const [bwWriteLimit, setBwWriteLimit] = useState("");
  const [bwReadOpsLimit, setBwReadOpsLimit] = useState("");
  const [bwWriteOpsLimit, setBwWriteOpsLimit] = useState("");
  const [bwReadBurst, setBwReadBurst] = useState("");
  const [bwWriteBurst, setBwWriteBurst] = useState("");
  const [bwReadOpsBurst, setBwReadOpsBurst] = useState("");
  const [bwWriteOpsBurst, setBwWriteOpsBurst] = useState("");

  // --- CPU ---
  const [cpuSockets, setCpuSockets] = useState("1");
  const [cpuCores, setCpuCores] = useState("1");
  const [cpuType, setCpuType] = useState("x86-64-v2-AES");

  // --- 内存 ---
  const [memory, setMemory] = useState("2048");

  // --- 网络 ---
  const [noNetwork, setNoNetwork] = useState(false);
  const [netBridge, setNetBridge] = useState("vmbr0");
  const [netModel, setNetModel] = useState("VirtIO (半虚拟化)");
  const [netVlanTag, setNetVlanTag] = useState("");
  const [netMacAddress, setNetMacAddress] = useState("auto");
  const [netFirewall, setNetFirewall] = useState(true);
  const [proxyIp, setProxyIp] = useState("none");

  // --- 确认 ---
  const [startAfterCreated, setStartAfterCreated] = useState(false);
  const [autoRestart, setAutoRestart] = useState(false);

  const x86Servers = hostServers.filter(s => s.type === "x86");
  const windowsImages = romImages.filter(r => r.type === "windows_vm" && r.imageStatus === "normal");
  const availableIps = proxyItems.filter(p => p.cloudDriveIds.length === 0 && p.status === "available");

  const totalCores = (parseInt(cpuSockets) || 1) * (parseInt(cpuCores) || 1);

  const req = <span className="text-destructive">*</span>;

  const currentTabIndex = TABS.indexOf(activeTab);
  const goNext = () => { if (currentTabIndex < TABS.length - 1) setActiveTab(TABS[currentTabIndex + 1]); };
  const goBack = () => { if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1]); };

  const confirmData = useMemo(() => {
    const host = hostServers.find(s => s.id === hostServerId);
    return [
      { key: "虚拟机名称", value: vmName || "-" },
      { key: "所属主机", value: host ? `${host.name} · ${host.ip}` : "-" },
      { key: "客户机操作系统类型", value: guestOsType },
      { key: "客户机操作系统版本", value: guestOsVersion },
      { key: "介质来源", value: mediaSource === "iso" ? `ISO镜像 (${isoStorage})` : mediaSource === "physical" ? "物理光驱" : "不使用介质" },
      { key: "ISO镜像", value: mediaSource === "iso" ? (isoImage || "-") : "-" },
      { key: "显卡", value: graphicCard },
      { key: "机型", value: machineType },
      { key: "SCSI控制器", value: scsiController },
      { key: "BIOS", value: bios },
      { key: "QEMU代理", value: qemuAgent ? "是" : "否" },
      { key: "TPM", value: addTpm ? "是" : "否" },
      { key: "磁盘总线/设备", value: `${diskBus} ${diskDevice}` },
      { key: "磁盘存储", value: diskStorage },
      { key: "磁盘大小 (GiB)", value: diskSize },
      { key: "缓存", value: diskCache },
      { key: "丢弃 (Discard)", value: diskDiscard ? "是" : "否" },
      { key: "IO线程", value: diskIoThread ? "是" : "否" },
      { key: "CPU插槽数", value: cpuSockets },
      { key: "CPU核心数", value: cpuCores },
      { key: "CPU类型", value: cpuType },
      { key: "总核心数", value: String(totalCores) },
      { key: "内存 (MiB)", value: memory },
      { key: "网络设备", value: noNetwork ? "无" : "是" },
      ...(!noNetwork ? [
        { key: "网桥", value: netBridge },
        { key: "网卡模型", value: netModel },
        { key: "VLAN标签", value: netVlanTag || "无" },
        { key: "MAC地址", value: netMacAddress },
        { key: "防火墙", value: netFirewall ? "是" : "否" },
      ] : []),
      
      { key: "自动重启", value: autoRestart ? "是" : "否" },
      { key: "备注", value: remark || "-" },
    ];
  }, [vmName, hostServerId, guestOsType, guestOsVersion, mediaSource, isoStorage, isoImage, graphicCard, machineType, scsiController, bios, qemuAgent, addTpm, diskBus, diskDevice, diskStorage, diskSize, diskCache, diskDiscard, diskIoThread, cpuSockets, cpuCores, cpuType, totalCores, memory, noNetwork, netBridge, netModel, netVlanTag, netMacAddress, netFirewall, proxyIp, autoRestart, remark]);

  const handleCreate = () => {
    navigate("/devices/virtual");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "常规":
        return (
          <div className="grid gap-5 max-w-2xl">
            <div className="space-y-2">
              <Label>{req} 虚拟机名称</Label>
              <Input placeholder="请输入虚拟机名称" value={vmName} onChange={e => setVmName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{req} 所属主机</Label>
              <Select value={hostServerId} onValueChange={setHostServerId}>
                <SelectTrigger><SelectValue placeholder="选择X86主机服务器" /></SelectTrigger>
                <SelectContent>
                  {x86Servers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} · {s.ip} · {s.clusterId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Windows虚拟机部署在X86服务器上</p>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea placeholder="选填备注信息" rows={3} value={remark} onChange={e => setRemark(e.target.value)} />
            </div>
          </div>
        );

      case "操作系统":
        return (
          <div className="grid gap-5 max-w-2xl">
            <div className="space-y-3">
              <Label className="font-semibold">安装介质</Label>
              <RadioGroup value={mediaSource} onValueChange={v => setMediaSource(v as any)} className="space-y-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="iso" id="media-iso" />
                  <Label htmlFor="media-iso" className="font-normal cursor-pointer">使用CD/DVD光盘镜像文件 (ISO)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="physical" id="media-physical" />
                  <Label htmlFor="media-physical" className="font-normal cursor-pointer">使用物理CD/DVD光驱</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="none" id="media-none" />
                  <Label htmlFor="media-none" className="font-normal cursor-pointer">不使用任何介质</Label>
                </div>
              </RadioGroup>
            </div>
            {mediaSource === "iso" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>存储位置</Label>
                  <Select value={isoStorage} onValueChange={setIsoStorage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">本地 (local)</SelectItem>
                      <SelectItem value="shared">共享存储</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ISO镜像</Label>
                  <Select value={isoImage} onValueChange={setIsoImage}>
                    <SelectTrigger><SelectValue placeholder="选择ISO镜像" /></SelectTrigger>
                    <SelectContent>
                      {windowsImages.map(img => (
                        <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-semibold">客户机操作系统</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>类型</Label>
                  <Select value={guestOsType} onValueChange={setGuestOsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Windows">Windows</SelectItem>
                      <SelectItem value="Linux">Linux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>版本</Label>
                  <Select value={guestOsVersion} onValueChange={setGuestOsVersion}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Windows 11">Windows 11</SelectItem>
                      <SelectItem value="Windows 10">Windows 10</SelectItem>
                      <SelectItem value="Windows Server 2022">Windows Server 2022</SelectItem>
                      <SelectItem value="Windows Server 2019">Windows Server 2019</SelectItem>
                      <SelectItem value="Windows Server 2016">Windows Server 2016</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case "系统":
        return (
          <div className="grid gap-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>显卡</Label>
                <Select value={graphicCard} onValueChange={setGraphicCard}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="默认">默认</SelectItem>
                    <SelectItem value="VirtIO-GPU">VirtIO-GPU</SelectItem>
                    <SelectItem value="SPICE">SPICE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SCSI控制器</Label>
                <Select value={scsiController} onValueChange={setScsiController}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VirtIO SCSI single">VirtIO SCSI single</SelectItem>
                    <SelectItem value="VirtIO SCSI">VirtIO SCSI</SelectItem>
                    <SelectItem value="LSI 53C895A">LSI 53C895A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>机型</Label>
                <Select value={machineType} onValueChange={setMachineType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="默认 (i440fx)">默认 (i440fx)</SelectItem>
                    <SelectItem value="q35">q35</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>QEMU代理</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox checked={qemuAgent} onCheckedChange={v => setQemuAgent(!!v)} id="qemu-agent" />
                  <Label htmlFor="qemu-agent" className="font-normal cursor-pointer">启用</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>BIOS固件</Label>
                <Select value={bios} onValueChange={setBios}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="默认 (SeaBIOS)">默认 (SeaBIOS)</SelectItem>
                    <SelectItem value="OVMF (UEFI)">OVMF (UEFI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TPM</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox checked={addTpm} onCheckedChange={v => setAddTpm(!!v)} id="add-tpm" />
                  <Label htmlFor="add-tpm" className="font-normal cursor-pointer">添加TPM</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case "磁盘":
        return (
          <div className="grid gap-5 max-w-2xl">
            <p className="text-sm font-semibold text-primary">磁盘配置</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>总线/设备</Label>
                <div className="flex gap-2">
                  <Select value={diskBus} onValueChange={setDiskBus}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCSI">SCSI</SelectItem>
                      <SelectItem value="IDE">IDE</SelectItem>
                      <SelectItem value="VirtIO Block">VirtIO Block</SelectItem>
                      <SelectItem value="SATA">SATA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="w-20" value={diskDevice} onChange={e => setDiskDevice(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>缓存</Label>
                <Select value={diskCache} onValueChange={setDiskCache}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="默认 (无缓存)">默认 (无缓存)</SelectItem>
                    <SelectItem value="Direct sync">Direct sync</SelectItem>
                    <SelectItem value="Write through">Write through</SelectItem>
                    <SelectItem value="Write back">Write back</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>存储</Label>
                <Select value={diskStorage} onValueChange={setDiskStorage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-lvm">local-lvm</SelectItem>
                    <SelectItem value="local">local</SelectItem>
                    <SelectItem value="ceph">ceph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>丢弃 (Discard)</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox checked={diskDiscard} onCheckedChange={v => setDiskDiscard(!!v)} id="disk-discard" />
                  <Label htmlFor="disk-discard" className="font-normal cursor-pointer">启用</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{req} 磁盘大小 (GiB)</Label>
                <Input type="number" value={diskSize} onChange={e => setDiskSize(e.target.value)} min={1} />
              </div>
              <div className="space-y-2">
                <Label>IO线程</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox checked={diskIoThread} onCheckedChange={v => setDiskIoThread(!!v)} id="disk-io" />
                  <Label htmlFor="disk-io" className="font-normal cursor-pointer">启用</Label>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-primary mt-4">带宽限制</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>读取限制 (MB/s)</Label>
                <Input placeholder="不限制" value={bwReadLimit} onChange={e => setBwReadLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>读取最大突发 (MB)</Label>
                <Input placeholder="默认" value={bwReadBurst} onChange={e => setBwReadBurst(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>写入限制 (MB/s)</Label>
                <Input placeholder="不限制" value={bwWriteLimit} onChange={e => setBwWriteLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>写入最大突发 (MB)</Label>
                <Input placeholder="默认" value={bwWriteBurst} onChange={e => setBwWriteBurst(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>读取限制 (ops/s)</Label>
                <Input placeholder="不限制" value={bwReadOpsLimit} onChange={e => setBwReadOpsLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>读取最大突发 (ops)</Label>
                <Input placeholder="默认" value={bwReadOpsBurst} onChange={e => setBwReadOpsBurst(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>写入限制 (ops/s)</Label>
                <Input placeholder="不限制" value={bwWriteOpsLimit} onChange={e => setBwWriteOpsLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>写入最大突发 (ops)</Label>
                <Input placeholder="默认" value={bwWriteOpsBurst} onChange={e => setBwWriteOpsBurst(e.target.value)} />
              </div>
            </div>
          </div>
        );

      case "CPU":
        return (
          <div className="grid gap-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{req} 插槽数</Label>
                <Input type="number" value={cpuSockets} onChange={e => setCpuSockets(e.target.value)} min={1} />
              </div>
              <div className="space-y-2">
                <Label>{req} CPU类型</Label>
                <Select value={cpuType} onValueChange={setCpuType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x86-64-v2-AES">x86-64-v2-AES</SelectItem>
                    <SelectItem value="host">host</SelectItem>
                    <SelectItem value="kvm64">kvm64</SelectItem>
                    <SelectItem value="qemu64">qemu64</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{req} 核心数</Label>
                <Input type="number" value={cpuCores} onChange={e => setCpuCores(e.target.value)} min={1} />
              </div>
              <div className="space-y-2">
                <Label>总核心数</Label>
                <p className="text-sm font-semibold h-10 flex items-center">{totalCores}</p>
              </div>
            </div>
          </div>
        );

      case "内存":
        return (
          <div className="grid gap-5 max-w-md">
            <div className="space-y-2">
              <Label>{req} 内存 (MiB)</Label>
              <Input type="number" value={memory} onChange={e => setMemory(e.target.value)} min={512} step={512} />
              <p className="text-xs text-muted-foreground">建议 Windows 10/11 至少分配 4096 MiB，Windows Server 至少 2048 MiB</p>
            </div>
          </div>
        );

      case "网络":
        return (
          <div className="grid gap-5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Checkbox checked={noNetwork} onCheckedChange={v => setNoNetwork(!!v)} id="no-network" />
              <Label htmlFor="no-network" className="font-normal cursor-pointer">无网络设备</Label>
            </div>
            {!noNetwork && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>网桥</Label>
                    <Select value={netBridge} onValueChange={setNetBridge}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vmbr0">vmbr0</SelectItem>
                        <SelectItem value="vmbr1">vmbr1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>网卡模型</Label>
                    <Select value={netModel} onValueChange={setNetModel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VirtIO (半虚拟化)">VirtIO (半虚拟化)</SelectItem>
                        <SelectItem value="Intel E1000">Intel E1000</SelectItem>
                        <SelectItem value="Realtek RTL8139">Realtek RTL8139</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>VLAN标签</Label>
                    <Input placeholder="无VLAN" value={netVlanTag} onChange={e => setNetVlanTag(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>MAC地址</Label>
                    <Input placeholder="auto" value={netMacAddress} onChange={e => setNetMacAddress(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={netFirewall} onCheckedChange={v => setNetFirewall(!!v)} id="net-firewall" />
                  <Label htmlFor="net-firewall" className="font-normal cursor-pointer">防火墙</Label>
                </div>
              </>
            )}
          </div>
        );

      case "确认":
        return (
          <div className="max-w-2xl space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">配置项</TableHead>
                      <TableHead>值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmData.map(row => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium text-xs">{row.key}</TableCell>
                        <TableCell className="text-xs">{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={startAfterCreated} onCheckedChange={v => setStartAfterCreated(!!v)} id="start-after" />
                <Label htmlFor="start-after" className="font-normal cursor-pointer">创建后立即启动</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={autoRestart} onCheckedChange={setAutoRestart} />
                <Label className="font-normal">自动重启</Label>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices/virtual")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建Windows虚拟机</h1>
          <p className="text-sm text-muted-foreground mt-0.5">创建基于X86服务器的Windows虚拟机实例</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Tab bar */}
          <div className="flex border-b px-6">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 min-h-[400px]">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
            {currentTabIndex > 0 && (
              <Button variant="outline" onClick={goBack}>上一步</Button>
            )}
            {activeTab === "确认" ? (
              <Button onClick={handleCreate}>完成创建</Button>
            ) : (
              <Button onClick={goNext}>下一步</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
