import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { socialAccounts, proxyItems, type SocialAccount, type Platform, type AccountStatus, type AccountType } from "@/data/mock-data";
import { initialDrives } from "@/pages/devices/CloudDrive";
import { Plus, Search, CheckCircle, RefreshCw, Smartphone, Globe, ChevronLeft, ChevronRight, MonitorSmartphone, Activity, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const platformLabel: Record<Platform, string> = { tiktok: "TikTok", facebook: "Facebook", twitter: "Twitter/X", instagram: "Instagram" };
const platformColor: Record<Platform, string> = { tiktok: "bg-foreground text-background", facebook: "bg-primary", twitter: "bg-foreground text-background", instagram: "bg-destructive" };
const statusConfig: Record<AccountStatus, { label: string; colorClass: string; tooltip: string }> = {
  alive: { label: "存活", colorClass: "bg-status-online", tooltip: "账号正常运行" },
  banned: { label: "封禁", colorClass: "bg-destructive", tooltip: "账号已被平台封禁" },
  limited: { label: "限流", colorClass: "bg-status-abnormal", tooltip: "账号被限流，功能受限" },
};
const typeLabel: Record<AccountType, string> = { cloud: "云机", windows: "Windows" };

const PAGE_SIZES = [10, 20, 50];

export default function AccountManagement() {
  const [accounts] = useState(socialAccounts);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetail, setShowDetail] = useState<SocialAccount | null>(null);
  const [showRemoteControl, setShowRemoteControl] = useState<SocialAccount | null>(null);

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      if (filterPlatform !== "all" && a.platform !== filterPlatform) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      if (searchQuery && !a.nickname.toLowerCase().includes(searchQuery.toLowerCase()) && !a.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [accounts, filterPlatform, filterStatus, filterType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedAccounts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const accountStats = {
    total: accounts.length,
    alive: accounts.filter(a => a.status === "alive").length,
    limited: accounts.filter(a => a.status === "limited").length,
    banned: accounts.filter(a => a.status === "banned").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">账号管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理云机与Windows的社交平台账号资产</p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />新增账号
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "总计", value: accountStats.total, icon: Activity },
          { label: "存活", value: accountStats.alive, icon: ShieldCheck },
          { label: "限流", value: accountStats.limited, icon: ShieldAlert },
          { label: "封禁", value: accountStats.banned, icon: ShieldX },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索昵称或用户名..." className="h-8 pl-8 text-xs" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
            <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="cloud">云机</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlatform} onValueChange={v => { setFilterPlatform(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="平台" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部平台</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="alive">存活</SelectItem>
                <SelectItem value="banned">封禁</SelectItem>
                <SelectItem value="limited">限流</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              {selectedIds.length > 0 && <span className="text-xs text-muted-foreground">已选 {selectedIds.length}</span>}
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedIds.length === 0}>
                <CheckCircle className="h-3 w-3 mr-1" />批量检活
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={selectedIds.length === 0}>
                <RefreshCw className="h-3 w-3 mr-1" />批量换绑
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={pagedAccounts.length > 0 && pagedAccounts.every(a => selectedIds.includes(a.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(prev => [...new Set([...prev, ...pagedAccounts.map(a => a.id)])]);
                      } else {
                        const pageIds = pagedAccounts.map(a => a.id);
                        setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                      }
                    }}
                  />
                </TableHead>
                <TableHead>类型</TableHead>
                <TableHead>平台</TableHead>
                <TableHead>昵称</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead className="text-right">权重</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead>镜像实例</TableHead>
                
                <TableHead>绑定IP</TableHead>
                <TableHead>最后检测</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedAccounts.map((acc) => (
                <TableRow key={acc.id} className="cursor-pointer" onClick={() => setShowDetail(acc)}>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selectedIds.includes(acc.id)} onCheckedChange={() => toggleSelect(acc.id)} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={acc.type === "cloud" ? "default" : "secondary"} className="text-[10px] gap-1">
                      {acc.type === "cloud" ? <Smartphone className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {typeLabel[acc.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${platformColor[acc.platform]}`}>{platformLabel[acc.platform]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{acc.nickname}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.username}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${acc.weight}%` }} />
                      </div>
                      <span className="text-xs font-medium font-mono">{acc.weight}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${statusConfig[acc.status].colorClass}`}>
                          {statusConfig[acc.status].label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{statusConfig[acc.status].tooltip}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{acc.cloudDriveId ? (initialDrives.find(d => d.id === acc.cloudDriveId)?.name || acc.cloudDriveId) : "-"}</TableCell>
                  
                  <TableCell className="font-mono text-xs">{acc.proxyIp || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.lastCheck}</TableCell>
                  <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowRemoteControl(acc)}>
                      <Smartphone className="h-3 w-3 mr-1" />远程控制
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filtered.length} 条记录</span>
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

      {/* 新增账号弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增社交账号</DialogTitle>
            <DialogDescription>配置账号的三元组绑定关系（账号-镜像实例-IP）</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>账号类型 <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud">云机</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>平台 <span className="text-destructive">*</span></Label>
                <Select><SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>昵称 <span className="text-destructive">*</span></Label><Input placeholder="账号昵称" /></div>
              <div className="space-y-2"><Label>用户名 <span className="text-destructive">*</span></Label><Input placeholder="@username" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>权重</Label>
                <Input type="number" placeholder="0-100" min={0} max={100} />
              </div>
              <div className="space-y-2">
                <Label>状态 <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alive">存活</SelectItem>
                    <SelectItem value="banned">封禁</SelectItem>
                    <SelectItem value="limited">限流</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>镜像实例 <span className="text-destructive">*</span></Label>
                <Select><SelectTrigger><SelectValue placeholder="选择镜像实例" /></SelectTrigger>
                  <SelectContent>
                    {initialDrives.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>绑定代理IP <span className="text-destructive">*</span></Label>
                <Select><SelectTrigger><SelectValue placeholder="选择代理" /></SelectTrigger>
                  <SelectContent>
                    {proxyItems.filter(p => p.status === "available").map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.ip}:{p.port}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>时区</Label>
                <Input placeholder="如 America/New_York" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>语言</Label><Input placeholder="如 en-US" /></div>
              <div className="space-y-2"><Label>地理坐标</Label><Input placeholder="如 40.7128,-74.0060" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={() => setShowAddDialog(false)}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 账号详情抽屉 */}
      <Sheet open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{showDetail?.nickname}</SheetTitle>
            <SheetDescription>{showDetail?.username} · {showDetail && platformLabel[showDetail.platform]} · {showDetail && typeLabel[showDetail.type]}</SheetDescription>
          </SheetHeader>
          {showDetail && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["类型", typeLabel[showDetail.type]],
                  ["权重", `${showDetail.weight}/100`],
                  ["状态", statusConfig[showDetail.status].label],
                  ["镜像实例", showDetail.cloudDriveId ? (initialDrives.find(d => d.id === showDetail.cloudDriveId)?.name || showDetail.cloudDriveId) : "未绑定"],
                  ["物理设备", showDetail.physicalDeviceId || "未绑定"],
                  ["代理IP", showDetail.proxyIp || "无"],
                  ["时区", showDetail.timezone],
                  ["语言", showDetail.language],
                  ["地理坐标", showDetail.location],
                  ["最后检测", showDetail.lastCheck],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">操作日志</h4>
                <div className="bg-muted rounded-lg p-3 space-y-1.5 text-xs font-mono max-h-48 overflow-auto">
                  <p>[04-02 10:00] 自动检活: 状态正常</p>
                  <p>[04-01 22:30] 执行任务: TikTok养号</p>
                  <p>[04-01 18:00] 更换代理IP: 旧IP → {showDetail.proxyIp}</p>
                  <p>[03-30 14:00] 首次绑定镜像实例 {showDetail.cloudDriveId}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 远程控制弹窗 */}
      <Dialog open={!!showRemoteControl} onOpenChange={() => setShowRemoteControl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" />
              远程控制 - {showRemoteControl?.nickname}
              <Badge className={`text-[10px] ${showRemoteControl ? platformColor[showRemoteControl.platform] : ""}`}>
                {showRemoteControl && platformLabel[showRemoteControl.platform]}
              </Badge>
              <Badge variant={showRemoteControl?.type === "cloud" ? "default" : "secondary"} className="text-[10px]">
                {showRemoteControl && typeLabel[showRemoteControl.type]}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {showRemoteControl?.type === "cloud" ? "Android云机实时画面 (ADB)" : "Windows实时画面 (VNC)"} · 镜像实例: {showRemoteControl?.cloudDriveId ? (initialDrives.find(d => d.id === showRemoteControl.cloudDriveId)?.name || showRemoteControl.cloudDriveId) : "-"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 ${showRemoteControl?.type === "cloud" ? "aspect-[9/16] max-h-[500px] mx-auto w-[280px]" : "aspect-video w-full"}`}>
              <div className="text-center text-muted-foreground">
                <MonitorSmartphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {showRemoteControl?.type === "cloud" ? "Android 实时画面" : "Windows桌面画面"}
                </p>
                <p className="text-xs mt-1">WebRTC 流连接中...</p>
                <p className="text-xs mt-1 font-mono">{showRemoteControl?.cloudDriveId} · {showRemoteControl?.proxyIp}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {showRemoteControl?.type === "cloud" ? (
                <>
                  <Button size="sm" variant="outline">返回</Button>
                  <Button size="sm" variant="outline">主页</Button>
                  <Button size="sm" variant="outline">多任务</Button>
                  <Button size="sm" variant="outline">截屏</Button>
                  <Button size="sm" variant="outline">输入文本</Button>
                  <Button size="sm" variant="outline">上滑</Button>
                  <Button size="sm" variant="outline">下滑</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline">刷新页面</Button>
                  <Button size="sm" variant="outline">新建标签</Button>
                  <Button size="sm" variant="outline">截屏</Button>
                  <Button size="sm" variant="outline">输入文本</Button>
                  <Button size="sm" variant="outline">清除缓存</Button>
                  <Button size="sm" variant="outline">切换代理</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
