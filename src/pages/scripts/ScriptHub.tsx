import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { scripts, type Script } from "@/data/mock-data";
import { Plus, Upload, History, Rocket, Code, Globe, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [10, 20, 50];

export default function ScriptHub() {
  const [scriptList] = useState(scripts);
  const [showUpload, setShowUpload] = useState(false);
  const [showHistory, setShowHistory] = useState<Script | null>(null);
  const [showCanary, setShowCanary] = useState<Script | null>(null);
  const [canaryPercent, setCanaryPercent] = useState([10]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredScripts = useMemo(() => {
    if (!searchText.trim()) return scriptList;
    const q = searchText.trim().toLowerCase();
    return scriptList.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [scriptList, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredScripts.length / pageSize));
  const pagedScripts = filteredScripts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">脚本仓库</h1>
          <p className="text-sm text-muted-foreground mt-1">管理自动化脚本的版本与分发</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-1" />
          上传脚本
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="搜索脚本名称或描述..." className="pl-8 h-8 text-xs" value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                 <TableRow>
                     <TableHead>脚本名称</TableHead>
                     <TableHead>类型</TableHead>
                     <TableHead>版本</TableHead>
                     <TableHead>兼容ROM</TableHead>
                     <TableHead>灰度比例</TableHead>
                     <TableHead>备注</TableHead>
                     <TableHead>状态</TableHead>
                     <TableHead>更新时间</TableHead>
                     <TableHead>操作</TableHead>
                   </TableRow>
            </TableHeader>
            <TableBody>
              {pagedScripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{script.name}</p>
                      <p className="text-xs text-muted-foreground">{script.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {script.type === "android" ? <><Code className="h-3 w-3 mr-1" />Auto.js</> : <><Globe className="h-3 w-3 mr-1" />Browser</>}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{script.version}</TableCell>
                  <TableCell className="font-mono text-xs">{script.compatibleRom}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${script.canaryPercent}%` }} />
                      </div>
                      <span className="text-xs">{script.canaryPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{script.remark || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={script.status === "active" ? "default" : script.status === "testing" ? "outline" : "secondary"} className="text-[10px]">
                      {script.status === "active" ? "活跃" : script.status === "testing" ? "测试中" : "已废弃"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{script.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(script)} title="版本历史">
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowCanary(script); setCanaryPercent([script.canaryPercent]); }} title="灰度发布" disabled={script.status === "deprecated"}>
                        <Rocket className="h-3.5 w-3.5" />
                      </Button>
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
        <span>共 {filteredScripts.length} 条记录</span>
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
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传新脚本</DialogTitle>
            <DialogDescription>创建或上传自动化脚本文件</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>脚本名称</Label><Input placeholder="TikTok 新功能脚本" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="android">Android (Auto.js)</SelectItem>
                    <SelectItem value="windows">Windows (JS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>兼容ROM版本</Label><Input placeholder="3.2.1-tt" /></div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Input placeholder="可选备注信息" /></div>
            <div className="space-y-2">
              <Label>脚本文件</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 mx-auto mb-2" />
                点击上传 .js 文件
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>取消</Button>
            <Button onClick={() => setShowUpload(false)}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 版本历史抽屉 */}
      <Sheet open={!!showHistory} onOpenChange={() => setShowHistory(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>版本历史 - {showHistory?.name}</SheetTitle>
            <SheetDescription>查看和回滚历史版本</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {[
              { version: showHistory?.version || "", date: showHistory?.updatedAt || "", current: true },
              { version: "2.4.0", date: "2026-03-25", current: false },
              { version: "2.3.2", date: "2026-03-15", current: false },
              { version: "2.3.0", date: "2026-03-01", current: false },
            ].map((v) => (
              <div key={v.version} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-mono font-medium">v{v.version}</p>
                  <p className="text-xs text-muted-foreground">{v.date}</p>
                </div>
                {v.current ? (
                  <Badge>当前版本</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs">回滚</Button>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 灰度发布弹窗 */}
      <Dialog open={!!showCanary} onOpenChange={() => setShowCanary(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>灰度发布 - {showCanary?.name}</DialogTitle>
            <DialogDescription>控制脚本 v{showCanary?.version} 的分发比例</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-3">
              <Label>灰度比例: {canaryPercent[0]}%</Label>
              <Slider value={canaryPercent} onValueChange={setCanaryPercent} min={0} max={100} step={5} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              将对约 <span className="font-bold text-foreground">{Math.round(12 * canaryPercent[0] / 100)}</span> 个实例推送此版本脚本
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCanary(null)}>取消</Button>
            <Button onClick={() => setShowCanary(null)}>确认发布</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
