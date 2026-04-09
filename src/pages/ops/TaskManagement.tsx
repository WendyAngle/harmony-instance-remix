import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, Download, Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for tasks
interface HistoryTask {
  id: string;
  taskId: string;
  resourceType: string;
  taskType: string;
  source: string;
  subTaskCount: number;
  success: number;
  fail: number;
  cancelled: number;
  duration: string;
  operator: string;
  createdAt: string;
}

interface CurrentTask {
  id: string;
  taskId: string;
  resourceType: string;
  taskType: string;
  source: string;
  operator: string;
  subTaskCount: number;
  progress: number;
  completed: number;
  cancelled: number;
  duration: string;
  startTime: string;
}

interface SubTask {
  id: string;
  subTaskId: string;
  parentTaskId: string;
  node: string;
  taskType: string;
  resourceId: string;
  status: string;
  returnVal: string;
  source: string;
  operator: string;
  duration: string;
  startTime: string;
  endTime: string;
}

const historyTasks: HistoryTask[] = [
  { id: "1", taskId: "e1f3ce091c554e8e85debea12b5496a9", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "01:02", operator: "hjl", createdAt: "2026-04-07 13:44:02" },
  { id: "2", taskId: "20e43bfa88974ebea2e8c63284eb0f50", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "01:02", operator: "chenrong", createdAt: "2026-04-07 12:08:40" },
  { id: "3", taskId: "88bfb24bb33a40028465480871bc977", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "01:04", operator: "chenrong", createdAt: "2026-04-07 12:02:51" },
  { id: "4", taskId: "5d2f3e5c7a09401abfb2fbbf7df1712b", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "01:02", operator: "chenrong", createdAt: "2026-04-07 11:59:47" },
  { id: "5", taskId: "c9c1473847d24823b8d350eb2cfc90fb", resourceType: "镜像实例", taskType: "创建镜像实例", source: "web", subTaskCount: 1, success: 1, fail: 0, cancelled: 0, duration: "00:13", operator: "chenrong", createdAt: "2026-04-07 11:59:34" },
  { id: "6", taskId: "9b25e67843bb4e0a8743ed5cce30a474", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:03", operator: "chenrong", createdAt: "2026-04-07 11:57:21" },
  { id: "7", taskId: "fcfa145b31dd4c67a9a85d44348a74e8", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:03", operator: "chenrong", createdAt: "2026-04-07 11:35:58" },
  { id: "8", taskId: "26567c16326e4224b554914b7d4c9bc2", resourceType: "虚拟机", taskType: "重启虚拟机", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:00", operator: "lxp", createdAt: "2026-04-07 11:28:50" },
  { id: "9", taskId: "08a79e21a8a1408da549c9b16255bb8c", resourceType: "虚拟机", taskType: "重启虚拟机", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:11", operator: "hjl", createdAt: "2026-04-07 11:11:39" },
  { id: "10", taskId: "c1546484b25742fa814bd979bb8d6b22", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:03", operator: "chenrong", createdAt: "2026-04-07 11:08:02" },
  { id: "11", taskId: "688adf768f54d0b8b793f70093227c9", resourceType: "镜像实例", taskType: "挂载镜像实例", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:03", operator: "hjl", createdAt: "2026-04-07 11:06:19" },
  { id: "12", taskId: "3cb9607d9ae94cbd9abd2b7be49c0d91", resourceType: "虚拟机", taskType: "启动虚拟机", source: "web", subTaskCount: 1, success: 0, fail: 1, cancelled: 0, duration: "00:00", operator: "hjl", createdAt: "2026-04-07 11:06:04" },
];

const currentTasks: CurrentTask[] = [
  { id: "1", taskId: "8a600c5121c24a7f85b8c...", resourceType: "板卡", taskType: "申请板卡", source: "web", operator: "xxl", subTaskCount: 1, progress: 0, completed: 0, cancelled: 0, duration: "01:39", startTime: "2026-04-07 14:48:51" },
];

// Mock request payloads for tasks
const taskRequestPayloads: Record<string, object> = {
  "e1f3ce091c554e8e85debea12b5496a9": { armCardOfferingUuid: "f64a987692a711ef9b070242ac12000d", armServerUuids: [], createType: 1, environment: {}, name: "test_13-2", nodeUuid: "dd407bbd9e2d40745e2e94088e22aac5", num: 1, os: "Android", osVersion: "10", projectId: "project_admin", romVersions: [], snList: [], tagIds: [] },
  "20e43bfa88974ebea2e8c63284eb0f50": { cloudDriveUuid: "cd-001", containerUuid: "vm-002", mountPoint: "/mnt/data", autoStart: true },
  "3cb9607d9ae94cbd9abd2b7be49c0d91": { containerUuid: "vm-005", action: "start", force: false },
  "26567c16326e4224b554914b7d4c9bc2": { containerUuid: "vm-003", action: "restart", force: true },
};

export default function TaskManagement() {
  const [activeTab, setActiveTab] = useState("history");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [requestDetail, setRequestDetail] = useState<{ taskId: string; payload: object } | null>(null);

  // Global search filters
  const [globalTimeFilter, setGlobalTimeFilter] = useState("");
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [filterNode, setFilterNode] = useState("");
  const [filterTaskType, setFilterTaskType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterOperator, setFilterOperator] = useState("");
  const [filterResourceId, setFilterResourceId] = useState("");

  const globalSubTasks: SubTask[] = [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">任务管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-0 h-auto p-0">
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2">
            历史任务
          </TabsTrigger>
          <TabsTrigger value="current" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2">
            当前任务
          </TabsTrigger>
          <TabsTrigger value="global" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2">
            全局搜索
          </TabsTrigger>
        </TabsList>

        {/* 历史任务 */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="3d">最近3天</SelectItem>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="1m">最近1个月</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                placeholder="支持多个条件组合搜索，例如 IPs: ip1|ip2|ip3  Names: name1|name2|name3"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[480px]"
              />
              <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[60px]">序号</TableHead>
                  <TableHead>任务ID</TableHead>
                  <TableHead>资源类型 ▼</TableHead>
                  <TableHead>任务类型</TableHead>
                  <TableHead>来源 ▼</TableHead>
                  <TableHead>子任务总数</TableHead>
                  <TableHead>成功/失败</TableHead>
                  <TableHead>已取消</TableHead>
                  <TableHead>执行时长</TableHead>
                  <TableHead>操作员</TableHead>
                  <TableHead>创建时间 ↕</TableHead>
                  <TableHead>日志</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyTasks.map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span className="text-primary cursor-pointer hover:underline text-sm">{task.taskId}</span>
                    </TableCell>
                    <TableCell>{task.resourceType}</TableCell>
                    <TableCell>{task.taskType}</TableCell>
                    <TableCell>{task.source}</TableCell>
                    <TableCell>{task.subTaskCount}</TableCell>
                    <TableCell>
                      <span className="text-green-600">{task.success}</span>
                      /
                      <span className="text-destructive font-medium">{task.fail}</span>
                    </TableCell>
                    <TableCell>{task.cancelled}</TableCell>
                    <TableCell>{task.duration}</TableCell>
                    <TableCell>{task.operator}</TableCell>
                    <TableCell className="text-sm">{task.createdAt}</TableCell>
                    <TableCell>
                      <span
                        className="text-primary cursor-pointer hover:underline text-sm"
                        onClick={() => setRequestDetail({
                          taskId: task.taskId,
                          payload: taskRequestPayloads[task.taskId] || { message: "暂无请求数据" }
                        })}
                      >请求</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <span>共 278 条</span>
            <Select defaultValue="50">
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
            <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
            <Button variant="outline" size="sm" className="h-8 w-8">4</Button>
            <Button variant="outline" size="sm" className="h-8 w-8">5</Button>
            <Button variant="outline" size="sm" className="h-8 w-8">6</Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            <span>前往</span>
            <Input className="w-12 h-8" defaultValue="1" />
            <span>页</span>
          </div>
        </TabsContent>

        {/* 当前任务 */}
        <TabsContent value="current" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                placeholder="支持多个条件组合搜索，例如 IPs: ip1|ip2|ip3  Names: name1|name2|name3"
                className="w-[480px]"
              />
              <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[60px]">序号</TableHead>
                  <TableHead>任务ID</TableHead>
                  <TableHead>资源类型 ▼</TableHead>
                  <TableHead>任务类型</TableHead>
                  <TableHead>任务来源</TableHead>
                  <TableHead>操作员</TableHead>
                  <TableHead>子任务总数</TableHead>
                  <TableHead>任务进度</TableHead>
                  <TableHead>已完成</TableHead>
                  <TableHead>已取消</TableHead>
                  <TableHead>执行时长</TableHead>
                  <TableHead>开始时间 ↕</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span className="text-primary cursor-pointer hover:underline text-sm">{task.taskId}</span>
                    </TableCell>
                    <TableCell>{task.resourceType}</TableCell>
                    <TableCell>{task.taskType}</TableCell>
                    <TableCell>{task.source}</TableCell>
                    <TableCell>{task.operator}</TableCell>
                    <TableCell>{task.subTaskCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={task.progress} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{task.completed}</TableCell>
                    <TableCell>{task.cancelled}</TableCell>
                    <TableCell>{task.duration}</TableCell>
                    <TableCell className="text-sm">{task.startTime}</TableCell>
                    <TableCell>
                      <span className="text-primary cursor-pointer hover:underline text-sm">请求</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <span>共 {currentTasks.length} 条</span>
            <Select defaultValue="50">
              <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            <span>前往</span>
            <Input className="w-12 h-8" defaultValue="1" />
            <span>页</span>
          </div>
        </TabsContent>

        {/* 全局搜索 */}
        <TabsContent value="global" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Select value={globalTimeFilter} onValueChange={setGlobalTimeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="请选择时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3d">最近3天</SelectItem>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="1m">最近1个月</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="请输入单个或者多个子任务ID查询，多个以','分隔 最多限制为20个。"
              value={globalSearchText}
              onChange={(e) => setGlobalSearchText(e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
            <Button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>
              <Filter className="h-4 w-4 mr-1" />
              高级筛选
            </Button>
          </div>

          {showAdvancedFilter && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-5 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">节点</span>
                  <Select value={filterNode} onValueChange={setFilterNode}>
                    <SelectTrigger><SelectValue placeholder="节点" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="node1">节点1</SelectItem>
                      <SelectItem value="node2">节点2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">任务类型</span>
                  <Select value={filterTaskType} onValueChange={setFilterTaskType}>
                    <SelectTrigger><SelectValue placeholder="任务类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="mount">挂载镜像实例</SelectItem>
                      <SelectItem value="create">创建镜像实例</SelectItem>
                      <SelectItem value="restart">重启虚拟机</SelectItem>
                      <SelectItem value="start">启动虚拟机</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">状态</span>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
                      <SelectItem value="fail">失败</SelectItem>
                      <SelectItem value="running">执行中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">任务来源</span>
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger><SelectValue placeholder="任务来源" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="web">web</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">操作人</span>
                  <Input placeholder="输入操作人" value={filterOperator} onChange={(e) => setFilterOperator(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap text-muted-foreground">资源ID</span>
                <Input
                  placeholder="请输入单个或者多个资源ID 多个以','分隔 最多限制为20个。"
                  value={filterResourceId}
                  onChange={(e) => setFilterResourceId(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => {
                  setFilterNode(""); setFilterTaskType(""); setFilterStatus("");
                  setFilterSource(""); setFilterOperator(""); setFilterResourceId("");
                }}>重置</Button>
                <Button>搜索</Button>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[60px]">序号</TableHead>
                  <TableHead>子任务ID</TableHead>
                  <TableHead>所属任务ID</TableHead>
                  <TableHead>节点</TableHead>
                  <TableHead>任务类型</TableHead>
                  <TableHead>资源ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>返回</TableHead>
                  <TableHead>任务来源</TableHead>
                  <TableHead>操作人</TableHead>
                  <TableHead>执行时间</TableHead>
                  <TableHead>开始时间 ↕</TableHead>
                  <TableHead>结束时间 ↕</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalSubTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-12">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <span>共 0 条</span>
            <Select defaultValue="50">
              <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            <span>前往</span>
            <Input className="w-12 h-8" defaultValue="1" />
            <span>页</span>
          </div>
        </TabsContent>
      </Tabs>

      {/* 请求详情弹窗 */}
      <Dialog open={!!requestDetail} onOpenChange={() => setRequestDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>请求</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[60vh]">
            {requestDetail && JSON.stringify(requestDetail.payload, null, 4)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
