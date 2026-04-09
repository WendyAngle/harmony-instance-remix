import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { tasks, scripts, socialAccounts, type Task, type TaskStatus } from "@/data/mock-data";
import { Plus, Play, RotateCcw, Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

const statusLabel: Record<TaskStatus, string> = { pending: "待执行", running: "执行中", completed: "已完成", failed: "失败" };
const statusIcon: Record<TaskStatus, typeof Clock> = { pending: Clock, running: Loader2, completed: CheckCircle, failed: XCircle };
const columnColors: Record<TaskStatus, string> = { pending: "border-muted-foreground/30", running: "border-primary", completed: "border-success", failed: "border-destructive" };

export default function TaskOrchestration() {
  const [taskList] = useState(tasks);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null);

  const columns: TaskStatus[] = ["pending", "running", "completed", "failed"];

  // 任务模板
  const templates = [
    { name: "养号任务", icon: "🌱", desc: "自动浏览、点赞、关注" },
    { name: "点赞互动", icon: "❤️", desc: "批量点赞指定内容" },
    { name: "私信群发", icon: "💬", desc: "发送模板化私信" },
    { name: "自动发帖", icon: "📝", desc: "定时发布图文内容" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任务编排</h1>
          <p className="text-sm text-muted-foreground mt-1">创建、管理和监控自动化任务</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-1" />
          创建任务
        </Button>
      </div>

      {/* 任务模板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {templates.map((tpl) => (
          <Card key={tpl.name} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateTask(true)}>
            <CardContent className="p-4 text-center">
              <span className="text-2xl">{tpl.icon}</span>
              <p className="text-sm font-medium mt-2">{tpl.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{tpl.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 看板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((status) => {
          const Icon = statusIcon[status];
          const columnTasks = taskList.filter(t => t.status === status);
          return (
            <div key={status}>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${columnColors[status]}`}>
                <Icon className={`h-4 w-4 ${status === "running" ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold">{statusLabel[status]}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{columnTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTaskDetail(task)}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium mb-1">{task.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{task.scriptName}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {task.targetAccounts.map(accId => {
                            const acc = socialAccounts.find(a => a.id === accId);
                            return <Badge key={accId} variant="outline" className="text-[9px]">{acc?.nickname || accId}</Badge>;
                          })}
                        </div>
                        {task.status === "running" && (
                          <span className="text-[10px] font-mono text-primary">{task.progress}%</span>
                        )}
                      </div>
                      {task.status === "running" && (
                        <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6 border rounded-lg border-dashed">暂无任务</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 创建任务弹窗 */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>创建自动化任务</DialogTitle>
            <DialogDescription>配置脚本、目标账号和执行策略</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>任务名称</Label><Input placeholder="TikTok养号-C组" /></div>
            <div className="space-y-2">
              <Label>选择脚本</Label>
              <Select><SelectTrigger><SelectValue placeholder="选择脚本" /></SelectTrigger>
                <SelectContent>
                  {scripts.filter(s => s.status !== "deprecated").map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} (v{s.version})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>目标账号</Label>
              <Select><SelectTrigger><SelectValue placeholder="选择账号（支持多选）" /></SelectTrigger>
                <SelectContent>
                  {socialAccounts.filter(a => a.status === "alive").map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.nickname} ({a.username})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>执行策略</Label>
                <Select><SelectTrigger><SelectValue placeholder="选择策略" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">立即执行</SelectItem>
                    <SelectItem value="scheduled">定时执行</SelectItem>
                    <SelectItem value="loop">循环执行</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>定时时间</Label><Input type="datetime-local" /></div>
            </div>
            <div className="space-y-2">
              <Label>参数配置（JSON）</Label>
              <Textarea rows={3} placeholder='{"duration": "30min", "likeCount": "50"}' className="font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>取消</Button>
            <Button onClick={() => setShowCreateTask(false)}>
              <Play className="h-4 w-4 mr-1" />
              创建任务
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 任务详情弹窗 */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showTaskDetail?.name}</DialogTitle>
            <DialogDescription>{showTaskDetail?.scriptName} · 创建于 {showTaskDetail?.createdAt}</DialogDescription>
          </DialogHeader>
          {showTaskDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">状态</p><Badge variant={showTaskDetail.status === "completed" ? "default" : showTaskDetail.status === "failed" ? "destructive" : "outline"} className="mt-1">{statusLabel[showTaskDetail.status]}</Badge></div>
                <div><p className="text-xs text-muted-foreground">进度</p><p className="font-bold mt-1">{showTaskDetail.progress}%</p></div>
                <div><p className="text-xs text-muted-foreground">目标账号</p><p className="mt-1">{showTaskDetail.targetAccounts.length} 个</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">执行参数</p>
                <div className="bg-muted rounded-lg p-2 font-mono text-xs">
                  {JSON.stringify(showTaskDetail.params, null, 2)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">执行日志</p>
                <div className="bg-muted rounded-lg p-3 font-mono text-[11px] max-h-40 overflow-auto space-y-1">
                  {showTaskDetail.logs.length === 0 && <p className="text-muted-foreground">暂无日志</p>}
                  {showTaskDetail.logs.map((log, i) => <p key={i}>{log}</p>)}
                </div>
              </div>
              {showTaskDetail.status === "failed" && (
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  重试任务
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
