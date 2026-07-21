import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, RotateCcw, ChevronDown, ChevronUp, RefreshCw, Inbox, Eye, CheckCheck, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SystemMessage {
  id: string;
  title: string;
  content: string;
  resourceType: string;
  resourceId: string;
  action: string;
  businessType: string;
  notifyType: string;
  status: "normal" | "abnormal";
  read: boolean;
  createdAt: string;
}

const businessTypes = ["虚拟机", "镜像实例", "ARM板卡", "服务节点", "任务", "系统"];
const notifyTypes = ["系统通知", "告警", "操作提醒", "任务结果"];

const seed: SystemMessage[] = [];

export default function SystemMessages() {
  const [title, setTitle] = useState("");
  const [bizType, setBizType] = useState<string>("all");
  const [notifyType, setNotifyType] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<SystemMessage[]>(seed);
  const [viewing, setViewing] = useState<SystemMessage | null>(null);
  const [deleting, setDeleting] = useState<SystemMessage | null>(null);

  const filtered = useMemo(() => {
    return data.filter((m) => {
      if (title && !m.title.toLowerCase().includes(title.toLowerCase())) return false;
      if (bizType !== "all" && m.businessType !== bizType) return false;
      if (notifyType !== "all" && m.notifyType !== notifyType) return false;
      return true;
    });
  }, [data, title, bizType, notifyType]);

  const reset = () => {
    setTitle("");
    setBizType("all");
    setNotifyType("all");
  };

  const markRead = (id: string) => {
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    toast({ title: "已标记为已读" });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setData((prev) => prev.filter((m) => m.id !== deleting.id));
    toast({ title: "删除成功" });
    setDeleting(null);
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">标题</Label>
              <Input placeholder="请输入" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">业务类型</Label>
              <Select value={bizType} onValueChange={setBizType}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {businessTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">通知类型</Label>
              <Select value={notifyType} onValueChange={setNotifyType}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {notifyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button><Search className="w-4 h-4 mr-1" />搜索</Button>
              <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" />重置</Button>
              <Button variant="ghost" onClick={() => setExpanded((v) => !v)}>
                展开{expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="icon" onClick={() => toast({ title: "已刷新" })}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>消息ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>资源类型</TableHead>
                <TableHead>资源ID</TableHead>
                <TableHead>动作</TableHead>
                <TableHead>业务类型</TableHead>
                <TableHead>通知类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>已读</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-80">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="w-16 h-16 mb-2 opacity-40" />
                      <span className="text-sm">暂无数据</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, idx) => (
                  <TableRow key={m.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{m.id}</TableCell>
                    <TableCell>{m.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{m.content}</TableCell>
                    <TableCell>{m.resourceType}</TableCell>
                    <TableCell className="font-mono text-xs">{m.resourceId}</TableCell>
                    <TableCell>{m.action}</TableCell>
                    <TableCell>{m.businessType}</TableCell>
                    <TableCell>{m.notifyType}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "normal" ? "default" : "destructive"}>
                        {m.status === "normal" ? "正常" : "异常"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.read ? "secondary" : "outline"}>
                        {m.read ? "已读" : "未读"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{m.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(m)} title="查看">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!m.read && (
                          <Button size="icon" variant="ghost" onClick={() => markRead(m.id)} title="标为已读">
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(m)} title="删除">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>共 {filtered.length} 条</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>消息详情</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">标题：</span>{viewing.title}</div>
              <div><span className="text-muted-foreground">内容：</span>{viewing.content}</div>
              <div><span className="text-muted-foreground">资源类型：</span>{viewing.resourceType}</div>
              <div><span className="text-muted-foreground">资源ID：</span>{viewing.resourceId}</div>
              <div><span className="text-muted-foreground">动作：</span>{viewing.action}</div>
              <div><span className="text-muted-foreground">创建时间：</span>{viewing.createdAt}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />确认删除
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm">确定要删除此消息吗？此操作不可恢复。</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}