import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { romImages as initialImages, physicalDevices, type RomImage, type ImageType, type ImageVisibility, type ImageStatus, type ImageArchitecture, type ImageOS, type ImageTrustStatus, type ImageFormat } from "@/data/mock-data";
import { mockTags } from "@/pages/devices/TagManagement";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, RefreshCw, Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, Copy, Check } from "lucide-react";

const SOC_TYPES = ["Orion865", "Orion8G2", "Cruise10", "Aries880"];
const SYNC_NODES = ["yaan-test", "beijing-prod", "shanghai-edge", "shenzhen-node"];

const imageTypeLabel: Record<ImageType, string> = {
  cloud_engine: "云机容器",
  browser: "指纹浏览器",
  windows_vm: "Windows虚拟机",
  plugin: "插件/工具",
};

const imageStatusLabel: Record<ImageStatus, string> = {
  building: "构建中",
  normal: "正常",
  error: "异常",
  locked: "已锁定",
};

const imageStatusVariant: Record<ImageStatus, "default" | "secondary" | "destructive" | "outline"> = {
  normal: "default",
  building: "outline",
  error: "destructive",
  locked: "secondary",
};

const visibilityLabel: Record<ImageVisibility, string> = { public: "公有", private: "私有", shared: "共享" };

const PAGE_SIZES = [10, 20, 50];

export default function ImageLibrary() {
  const [images, setImages] = useState<RomImage[]>(initialImages);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showUploadRom, setShowUploadRom] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<RomImage | null>(null);
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [batchUpdateType, setBatchUpdateType] = useState<ImageType>("cloud_engine");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [toggleConfirm, setToggleConfirm] = useState<RomImage | null>(null);
  const [editImage, setEditImage] = useState<RomImage | null>(null);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    name: "", version: "", imageFileVersion: "", description: "", remark: "",
    architecture: "ARM64" as ImageArchitecture,
    os: "Android" as ImageOS,
    osVersion: "",
    imageFormat: "Docker" as ImageFormat,
    buildScript: "",
    disk: "",
    preinstalledSoftware: "",
    entrypoint: "", ports: "", envVars: "",
    tenant: "", maxInstances: 100,
    tags: [] as string[],
  });
  const [uploadSocType, setUploadSocType] = useState("Orion865");
  const [uploadMethod, setUploadMethod] = useState<"file" | "manual">("file");
  const [uploadFileUrl, setUploadFileUrl] = useState("");
  const [uploadSyncNodes, setUploadSyncNodes] = useState<string[]>([]);
  const [uploadRemark, setUploadRemark] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredImages = useMemo(() => {
    let result = filterType === "all" ? images : images.filter(r => r.type === filterType);
    if (filterStatus !== "all") {
      result = result.filter(r => r.imageStatus === filterStatus);
    }
    if (filterVisibility !== "all") {
      result = result.filter(r => r.visibility === filterVisibility);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.version.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    return result;
  }, [filterType, filterStatus, filterVisibility, searchText, images]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / pageSize));
  const pagedImages = filteredImages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleDeviceSelect = (id: string) => {
    setSelectedDeviceIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleStatus = (rom: RomImage) => {
    setToggleConfirm(rom);
  };

  const confirmToggleStatus = () => {
    if (!toggleConfirm) return;
    setImages(prev => prev.map(img =>
      img.id === toggleConfirm.id
        ? { ...img, imageStatus: (img.imageStatus === "normal" ? "locked" : "normal") as ImageStatus }
        : img
    ));
    setToggleConfirm(null);
  };

  const openEdit = (rom: RomImage) => {
    setEditForm({
      name: rom.name, version: rom.version, imageFileVersion: (rom as any).imageFileVersion || "", description: rom.description, remark: rom.remark,
      architecture: rom.architecture, os: rom.os, osVersion: rom.osVersion,
      imageFormat: rom.imageFormat, buildScript: rom.buildScript,
      disk: rom.resourceSpec.disk, preinstalledSoftware: rom.preinstalledSoftware.join(", "),
      entrypoint: rom.entrypoint, ports: rom.ports, envVars: rom.envVars,
      tenant: rom.tenant, maxInstances: rom.maxInstances,
      tags: [...rom.tags],
    });
    setEditImage(rom);
  };

  const saveEdit = () => {
    if (!editImage) return;
    const { preinstalledSoftware, disk, buildScript, imageFormat, ...rest } = editForm;
    setImages(prev => prev.map(img =>
      img.id === editImage.id
        ? {
            ...img, ...rest,
            imageFormat,
            buildScript,
            preinstalledSoftware: preinstalledSoftware.split(",").map(s => s.trim()).filter(Boolean),
            resourceSpec: { ...img.resourceSpec, disk },
            updatedAt: new Date().toISOString().slice(0, 10),
          }
        : img
    ));
    setEditImage(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">镜像模版管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理云机容器、Windows虚拟机、浏览器及插件镜像模版</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setBatchUpdateType("cloud_engine"); setSelectedDeviceIds([]); setShowBatchUpdate(true); }}>
            <RefreshCw className="h-4 w-4 mr-1" />批量更新
          </Button>
          <Button size="sm" onClick={() => setShowUploadRom(true)}>
            <Upload className="h-4 w-4 mr-1" />上传镜像模版
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="搜索模版名称/版本/ID..." value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="镜像类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="cloud_engine">云机容器</SelectItem>
            <SelectItem value="browser">指纹浏览器</SelectItem>
            <SelectItem value="windows_vm">Windows虚拟机</SelectItem>
            <SelectItem value="plugin">插件/工具</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="building">构建中</SelectItem>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="error">异常</SelectItem>
            <SelectItem value="locked">已锁定</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterVisibility} onValueChange={v => { setFilterVisibility(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="属性" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部属性</SelectItem>
            <SelectItem value="public">公有</SelectItem>
            <SelectItem value="private">私有</SelectItem>
            <SelectItem value="shared">共享</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">模版ID</TableHead>
                <TableHead className="whitespace-nowrap">模版名称</TableHead>
                <TableHead className="whitespace-nowrap">类型</TableHead>
                <TableHead className="whitespace-nowrap">标签</TableHead>
                <TableHead className="whitespace-nowrap">架构</TableHead>
                <TableHead className="whitespace-nowrap">镜像格式</TableHead>
                <TableHead className="whitespace-nowrap">操作系统版本</TableHead>
                <TableHead className="whitespace-nowrap">构建脚本/配置</TableHead>
                <TableHead className="whitespace-nowrap">磁盘大小</TableHead>
                <TableHead className="whitespace-nowrap">预置软件清单</TableHead>
                <TableHead className="whitespace-nowrap">属性</TableHead>
                <TableHead className="whitespace-nowrap">状态</TableHead>
                <TableHead className="whitespace-nowrap">创建时间</TableHead>
                <TableHead className="whitespace-nowrap">备注</TableHead>
                <TableHead className="whitespace-nowrap text-center">启用/禁用</TableHead>
                <TableHead className="whitespace-nowrap">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedImages.map((rom) => (
                <TableRow key={rom.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{rom.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{rom.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={rom.type === "cloud_engine" ? "default" : rom.type === "windows_vm" ? "secondary" : "outline"} className="text-[10px]">
                      {imageTypeLabel[rom.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-1">
                      {rom.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{rom.architecture}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] font-mono">{rom.imageFormat}</Badge>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{rom.osVersion}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {rom.buildScript ? (
                      <div className="flex items-center gap-1">
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded max-w-[120px] truncate block">
                          {rom.buildScript.split('\n')[0]}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyToClipboard(rom.buildScript, `build-${rom.id}`)}
                            >
                              {copiedId === `build-${rom.id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{copiedId === `build-${rom.id}` ? "已复制" : "复制构建脚本"}</TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{rom.size}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {rom.preinstalledSoftware.length > 0 ? (
                      <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {rom.preinstalledSoftware.slice(0, 2).map(sw => (
                          <Badge key={sw} variant="secondary" className="text-[10px]">{sw}</Badge>
                        ))}
                        {rom.preinstalledSoftware.length > 2 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="text-[10px]">+{rom.preinstalledSoftware.length - 2}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>{rom.preinstalledSoftware.join(', ')}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={rom.visibility === "public" ? "outline" : rom.visibility === "private" ? "secondary" : "default"} className="text-[10px]">
                      {visibilityLabel[rom.visibility]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={imageStatusVariant[rom.imageStatus]} className="text-[10px] whitespace-nowrap">
                      {imageStatusLabel[rom.imageStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{rom.createdAt}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{rom.remark || "-"}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={rom.imageStatus === "normal"}
                        onCheckedChange={() => handleToggleStatus(rom)}
                      />
                      <span className={`text-xs font-medium whitespace-nowrap ${rom.imageStatus === "normal" ? "text-green-600" : "text-muted-foreground"}`}>
                        {imageStatusLabel[rom.imageStatus]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(rom)}>
                            <Pencil className="h-3 w-3 mr-1" />编辑
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑镜像模版信息</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(rom)}>
                            <Trash2 className="h-3 w-3 mr-1" />删除
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除此镜像模版</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filteredImages.length} 条记录</span>
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

      {/* 上传镜像模版 */}
      <Dialog open={showUploadRom} onOpenChange={setShowUploadRom}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>上传新镜像模版</DialogTitle>
            <DialogDescription>上传云机容器、Windows虚拟机、浏览器或插件镜像模版</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* 模版名称 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 模版名称</Label>
              <Input placeholder="ARM64-Linux-Web" />
            </div>

            {/* 类型 & 属性 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 类型</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud_engine">云机容器</SelectItem>
                    <SelectItem value="browser">指纹浏览器</SelectItem>
                    <SelectItem value="windows_vm">Windows虚拟机</SelectItem>
                    <SelectItem value="plugin">插件/工具</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 属性</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择属性" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">公有</SelectItem>
                    <SelectItem value="private">私有</SelectItem>
                    <SelectItem value="shared">共享</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal h-10">
                    {uploadTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {uploadTags.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">请选择标签</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  {mockTags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer" onClick={() => setUploadTags(prev => prev.includes(tag.name) ? prev.filter(t => t !== tag.name) : [...prev, tag.name])}>
                      <Checkbox checked={uploadTags.includes(tag.name)} />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* 架构 & 镜像格式 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 架构</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择架构" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARM64">ARM64 (aarch64)</SelectItem>
                    <SelectItem value="x86_64">x86_64</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 镜像格式</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择格式" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qcow2">qcow2</SelectItem>
                    <SelectItem value="raw">raw</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 操作系统版本 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 操作系统版本</Label>
              <Input placeholder="CentOS 9 / Windows 11 / Ubuntu 22.04 / Android 12" />
            </div>

            {/* 构建脚本/配置 */}
            <div className="space-y-2">
              <Label>构建脚本/配置</Label>
              <Textarea placeholder="Dockerfile / 自动化构建脚本内容" className="min-h-[60px] resize-y font-mono text-xs" />
            </div>

            {/* 磁盘大小 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 磁盘大小</Label>
              <Input placeholder="如：40GB" />
            </div>

            {/* 预置软件清单 */}
            <div className="space-y-2">
              <Label>预置软件清单</Label>
              <Input placeholder="Nginx, MySQL, Java（逗号分隔）" />
            </div>

            {/* SoC类型 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> SoC类型</Label>
              <Select value={uploadSocType} onValueChange={setUploadSocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOC_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 上传方式 */}
            <div className="space-y-2">
              <Label>上传方式</Label>
              <RadioGroup value={uploadMethod} onValueChange={(v) => { setUploadMethod(v as "file" | "manual"); setUploadFileUrl(""); }} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="file" id="upload-file" />
                  <Label htmlFor="upload-file" className="cursor-pointer font-normal">上传文件</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="manual" id="upload-manual" />
                  <Label htmlFor="upload-manual" className="cursor-pointer font-normal">手动输入地址</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 镜像文件 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 镜像文件</Label>
              {uploadMethod === "file" ? (
                <div className="flex items-center gap-2">
                  <Input placeholder="文件地址会在上传文件后自动填充" disabled className="flex-1" value={uploadFileUrl} />
                  <Button type="button" size="sm">点击上传</Button>
                </div>
              ) : (
                <Input placeholder="请输入正确的文件地址" value={uploadFileUrl} onChange={e => setUploadFileUrl(e.target.value)} />
              )}
            </div>

            {/* 同步镜像 */}
            <div className="space-y-2">
              <Label>同步镜像</Label>
              <Select value="__trigger__" onValueChange={(v) => {
                if (v === "all") {
                  setUploadSyncNodes([...SYNC_NODES]);
                } else if (!uploadSyncNodes.includes(v)) {
                  setUploadSyncNodes(prev => [...prev, v]);
                }
              }}>
                <SelectTrigger>
                  {uploadSyncNodes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {uploadSyncNodes.map(node => (
                        <Badge key={node} variant="secondary" className="text-xs gap-1">
                          {node}
                          <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); setUploadSyncNodes(prev => prev.filter(n => n !== node)); }} />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">所有节点</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有节点</SelectItem>
                  {SYNC_NODES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label>备注</Label>
              <div className="relative">
                <Textarea placeholder="请输入备注" value={uploadRemark} onChange={e => { if (e.target.value.length <= 200) setUploadRemark(e.target.value); }} className="min-h-[80px] resize-y" />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">{uploadRemark.length}/200</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadRom(false)}>取消</Button>
            <Button onClick={() => setShowUploadRom(false)}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑镜像模版 */}
      <Dialog open={!!editImage} onOpenChange={(open) => !open && setEditImage(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑镜像模版</DialogTitle>
            <DialogDescription>修改镜像模版 {editImage?.id.slice(0, 8)}... 的基本信息</DialogDescription>
          </DialogHeader>
           <div className="grid gap-4 py-2">
            {/* 模版名称 */}
            <div className="space-y-2">
              <Label><span className="text-destructive">*</span> 模版名称</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            {/* 类型 & 属性 (readonly) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 类型</Label>
                <Input value={editImage ? imageTypeLabel[editImage.type] : ""} disabled />
              </div>
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 属性</Label>
                <Input value={editImage ? visibilityLabel[editImage.visibility] : ""} disabled />
              </div>
            </div>
            {/* 标签 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal h-10">
                    {editForm.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {editForm.tags.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">请选择标签</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  {mockTags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer" onClick={() => setEditForm(f => ({ ...f, tags: f.tags.includes(tag.name) ? f.tags.filter(t => t !== tag.name) : [...f.tags, tag.name] }))}>
                      <Checkbox checked={editForm.tags.includes(tag.name)} />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            {/* 架构 & 镜像格式 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 架构</Label>
                <Select value={editForm.architecture} onValueChange={v => setEditForm(f => ({ ...f, architecture: v as ImageArchitecture }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARM64">ARM64 (aarch64)</SelectItem>
                    <SelectItem value="x86_64">x86_64</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 镜像格式</Label>
                <Select value={editForm.imageFormat} onValueChange={v => setEditForm(f => ({ ...f, imageFormat: v as ImageFormat }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="qcow2">qcow2</SelectItem>
                    <SelectItem value="raw">raw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* 操作系统 & 操作系统版本 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 操作系统</Label>
                <Select value={editForm.os} onValueChange={v => setEditForm(f => ({ ...f, os: v as ImageOS }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Linux">Linux</SelectItem>
                    <SelectItem value="Windows">Windows</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 操作系统版本</Label>
                <Input value={editForm.osVersion} onChange={e => setEditForm(f => ({ ...f, osVersion: e.target.value }))} />
              </div>
            </div>
            {/* 构建脚本/配置 */}
            <div className="space-y-2">
              <Label>构建脚本/配置</Label>
              <Textarea value={editForm.buildScript} onChange={e => setEditForm(f => ({ ...f, buildScript: e.target.value }))} placeholder="FROM ubuntu:22.04..." className="min-h-[60px] resize-y font-mono text-xs" />
            </div>
            {/* 磁盘大小 & 最大实例数 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><span className="text-destructive">*</span> 磁盘大小</Label>
                <Input value={editForm.disk} onChange={e => setEditForm(f => ({ ...f, disk: e.target.value }))} placeholder="例: 20GB" />
              </div>
              <div className="space-y-2">
                <Label>最大实例数</Label>
                <Input type="number" value={editForm.maxInstances} onChange={e => setEditForm(f => ({ ...f, maxInstances: Number(e.target.value) }))} />
              </div>
            </div>
            {/* 预置软件清单 */}
            <div className="space-y-2">
              <Label>预置软件清单</Label>
              <Input value={editForm.preinstalledSoftware} onChange={e => setEditForm(f => ({ ...f, preinstalledSoftware: e.target.value }))} placeholder="多个软件用逗号分隔，例: Nginx, MySQL, Redis" />
            </div>
            {/* 版本号 & 描述 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>版本号</Label>
                <Input value={editForm.version} onChange={e => setEditForm(f => ({ ...f, version: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {/* 启动命令 & 暴露端口 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>启动命令</Label>
                <Input value={editForm.entrypoint} onChange={e => setEditForm(f => ({ ...f, entrypoint: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>暴露端口</Label>
                <Input value={editForm.ports} onChange={e => setEditForm(f => ({ ...f, ports: e.target.value }))} />
              </div>
            </div>
            {/* 环境变量 */}
            <div className="space-y-2">
              <Label>环境变量</Label>
              <Textarea value={editForm.envVars} onChange={e => setEditForm(f => ({ ...f, envVars: e.target.value }))} placeholder="KEY=VALUE，每行一个" className="min-h-[60px] resize-y font-mono text-xs" />
            </div>
            {/* 所属项目/租户 */}
            <div className="space-y-2">
              <Label>所属项目/租户</Label>
              <Input value={editForm.tenant} onChange={e => setEditForm(f => ({ ...f, tenant: e.target.value }))} />
            </div>
            {/* 备注 */}
            <div className="space-y-2">
              <Label>备注</Label>
              <div className="relative">
                <Textarea placeholder="请输入备注" value={editForm.remark} onChange={e => { if (e.target.value.length <= 200) setEditForm(f => ({ ...f, remark: e.target.value })); }} className="min-h-[80px] resize-y" />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">{editForm.remark.length}/200</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditImage(null)}>取消</Button>
            <Button onClick={saveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量更新弹窗 */}
      <Dialog open={showBatchUpdate} onOpenChange={setShowBatchUpdate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量更新镜像模版</DialogTitle>
            <DialogDescription>选择需要批量更新的镜像类型和目标版本</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>镜像类型</Label>
              <Select value={batchUpdateType} onValueChange={(v) => { setBatchUpdateType(v as ImageType); setSelectedDeviceIds([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud_engine">云机容器</SelectItem>
                  <SelectItem value="browser">指纹浏览器</SelectItem>
                  <SelectItem value="windows_vm">Windows虚拟机</SelectItem>
                  <SelectItem value="plugin">插件/工具</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>目标版本</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择目标版本" /></SelectTrigger>
                <SelectContent>
                  {images.filter(r => r.type === batchUpdateType && r.imageStatus === "normal").map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} ({r.version})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>选择需要更新的设备</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-auto space-y-2">
                {(batchUpdateType === "cloud_engine" || batchUpdateType === "browser"
                  ? physicalDevices.filter(d => d.type === "board" && d.status !== "offline")
                  : physicalDevices.filter(d => d.type === "windows" && d.status !== "offline")
                ).map(d => (
                  <div key={d.id} className="flex items-center gap-2">
                    <Checkbox checked={selectedDeviceIds.includes(d.id)} onCheckedChange={() => toggleDeviceSelect(d.id)} />
                    <span className="text-sm font-mono">{d.id}</span>
                    <span className="text-xs text-muted-foreground">{d.ip} · {d.server}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchUpdate(false)}>取消</Button>
            <Button onClick={() => setShowBatchUpdate(false)} disabled={selectedDeviceIds.length === 0}>
              更新 {selectedDeviceIds.length} 台设备
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 启用/禁用确认 */}
      <AlertDialog open={!!toggleConfirm} onOpenChange={() => setToggleConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认{toggleConfirm?.imageStatus === "normal" ? "锁定" : "启用"}镜像模版？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleConfirm?.imageStatus === "normal"
                ? `锁定后，镜像模版 ${toggleConfirm?.name} (${toggleConfirm?.version}) 将不可用于创建新实例。`
                : `启用后，镜像模版 ${toggleConfirm?.name} (${toggleConfirm?.version}) 将可用于创建新实例。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              确认{toggleConfirm?.imageStatus === "normal" ? "锁定" : "启用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除镜像模版？</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除镜像模版 {deleteConfirm?.name} ({deleteConfirm?.version}) 吗？删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setImages(prev => prev.filter(img => img.id !== deleteConfirm?.id)); setDeleteConfirm(null); }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}