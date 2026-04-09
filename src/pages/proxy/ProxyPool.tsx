import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { proxyItems, socialAccounts, type ProxyStatus } from "@/data/mock-data";
import { initialDrives } from "@/pages/devices/CloudDrive";
import { Plus, Search, Upload, Activity, ShieldCheck, ShieldX, ShieldAlert, ChevronLeft, ChevronRight, Download, FileSpreadsheet } from "lucide-react";

const statusConfig: Record<ProxyStatus, { label: string; colorClass: string; tooltip: string }> = {
  available: { label: "可用", colorClass: "bg-status-online", tooltip: "代理正常可用" },
  unavailable: { label: "不可用", colorClass: "bg-status-offline", tooltip: "代理不可用" },
  blacklisted: { label: "黑名单", colorClass: "bg-destructive", tooltip: "已被目标平台标记" },
};
const anonIcon = { high: ShieldCheck, medium: ShieldAlert, low: ShieldX };

const PAGE_SIZES = [10, 20, 50];

export default function ProxyPool() {
  const [proxies] = useState(proxyItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);

  const filtered = useMemo(() => {
    return proxies.filter(p => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (searchQuery && !p.ip.includes(searchQuery) && !p.region.includes(searchQuery)) return false;
      return true;
    });
  }, [proxies, filterStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedProxies = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = {
    total: proxies.length,
    available: proxies.filter(p => p.status === "available").length,
    unavailable: proxies.filter(p => p.status === "unavailable").length,
    blacklisted: proxies.filter(p => p.status === "blacklisted").length,
  };

  const getAccountNames = (accountIds: string[]) => {
    return accountIds.map(id => {
      const acc = socialAccounts.find(a => a.id === id);
      return acc ? `${acc.platform}:${acc.username}` : id;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IP池管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理代理IP资源池，确保一机一号一IP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBatchImport(true)}>
            <Upload className="h-4 w-4 mr-1" />批量导入
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />新增代理
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "总计", value: stats.total, icon: Activity },
          { label: "可用", value: stats.available, icon: ShieldCheck },
          { label: "不可用", value: stats.unavailable, icon: ShieldAlert },
          { label: "黑名单", value: stats.blacklisted, icon: ShieldX },
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="搜索IP或地区..." className="h-8 pl-8 text-xs" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="available">可用</SelectItem>
            <SelectItem value="unavailable">不可用</SelectItem>
            <SelectItem value="blacklisted">黑名单</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proxy Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP地址</TableHead>
                <TableHead className="text-right">端口</TableHead>
                <TableHead>协议</TableHead>
                <TableHead>地区</TableHead>
                <TableHead className="text-right">延迟 (ms)</TableHead>
                <TableHead className="text-center">匿名度</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground">镜像实例</TooltipTrigger>
                    <TooltipContent>IP绑定的所有镜像实例</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>绑定账号</TableHead>
                <TableHead className="text-right">流量 (GB)</TableHead>
                <TableHead>检测时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedProxies.map((proxy) => {
                const AnonIcon = anonIcon[proxy.anonymity];
                const accountNames = getAccountNames(proxy.boundAccountIds);
                return (
                  <TableRow key={proxy.id}>
                    <TableCell className="font-mono text-xs font-medium">{proxy.ip}</TableCell>
                    <TableCell className="font-mono text-xs text-right">{proxy.port}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{proxy.protocol}</Badge></TableCell>
                    <TableCell className="text-xs">{proxy.country} · {proxy.region}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs font-mono ${proxy.latency > 200 ? "text-threshold-danger font-bold" : proxy.latency > 100 ? "text-warning" : "text-success"}`}>
                        {proxy.latency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><AnonIcon className={`h-4 w-4 mx-auto ${proxy.anonymity === "high" ? "text-success" : proxy.anonymity === "medium" ? "text-warning" : "text-destructive"}`} /></span>
                        </TooltipTrigger>
                        <TooltipContent>{proxy.anonymity === "high" ? "高匿名" : proxy.anonymity === "medium" ? "中等匿名" : "低匿名"}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${statusConfig[proxy.status].colorClass}`}>
                            {statusConfig[proxy.status].label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{statusConfig[proxy.status].tooltip}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {proxy.cloudDriveIds.length > 0 ? proxy.cloudDriveIds.map(id => {
                        const drive = initialDrives.find(d => d.id === id);
                        return drive ? drive.name : id;
                      }).join(", ") : "-"}
                    </TableCell>
                    <TableCell>
                      {accountNames.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {accountNames.map((name, i) => (
                            <span key={i} className="text-[11px]">{name}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">{(proxy.trafficUsed / 1024).toFixed(1)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{proxy.lastCheck}</TableCell>
                  </TableRow>
                );
              })}
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

      {/* 新增代理弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增代理</DialogTitle>
            <DialogDescription>手动录入代理服务器信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>IP地址</Label><Input placeholder="45.32.100.20" /></div>
              <div className="space-y-2"><Label>端口</Label><Input placeholder="1080" /></div>
              <div className="space-y-2">
                <Label>协议</Label>
                <Select><SelectTrigger><SelectValue placeholder="协议" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>用户名（可选）</Label><Input placeholder="username" /></div>
              <div className="space-y-2"><Label>密码（可选）</Label><Input type="password" placeholder="password" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button onClick={() => setShowAddDialog(false)}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入弹窗 */}
      <Dialog open={showBatchImport} onOpenChange={setShowBatchImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量导入代理</DialogTitle>
            <DialogDescription>下载模版文件，按格式填写后上传导入</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>1. 下载导入模版</Label>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                下载模版文件（.xlsx）
              </Button>
              <p className="text-xs text-muted-foreground">模版包含：IP、端口、协议、用户名、密码、地区、运营商</p>
            </div>
            <div className="space-y-2">
              <Label>2. 上传填写好的文件</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">点击或拖拽上传文件</p>
                <p className="text-xs text-muted-foreground mt-1">支持 .xlsx、.xls、.csv 格式</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchImport(false)}>取消</Button>
            <Button onClick={() => setShowBatchImport(false)}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
