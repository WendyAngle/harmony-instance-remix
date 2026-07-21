import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, RotateCcw, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface LogEntry {
  id: string;
  module: string;
  action: string;
  service: string;
  serviceFull: string;
  operator: string;
  status: "success" | "failed";
  bizType: string;
  bizId: string;
  traceId: string;
  uri: string;
  ip: string;
  params: string;
  code: number;
  errMsg: string;
  createdAt: string;
  durationMs: number;
}

const modules = ["虚拟机管理", "镜像实例", "ARM板卡", "服务节点", "标签管理", "应用管理"];
const actions = ["云机远控", "#ACTION", "分配用户", "ALLOCATE", "CREATE", "DELETE"];
const services = ["resource-service 资源服务", "device-service 设备服务", "auth-service 认证服务"];

const pad = (n: number) => n.toString().padStart(2, "0");
const seed: LogEntry[] = Array.from({ length: 25 }).map((_, i) => {
  const isImage = i >= 11;
  const isFail = i === 12;
  const module = isImage ? "镜像实例" : "虚拟机管理";
  const action = i === 9 ? "#ACTION" : i === 11 ? "分配用户" : isFail ? "ALLOCATE" : "云机远控";
  const hour = 11 - Math.floor(i / 3);
  const min = pad((60 - i * 3 + 60) % 60);
  const uri = isFail
    ? "POST /resource/cloud-image/allocate"
    : i === 11
    ? "PUT /resource/fingerprint-storage/2070054..."
    : `POST /resource/vm/cloud/instances/2059591332533673985/remote-session`;
  return {
    id: `${i + 1}`,
    module,
    action,
    service: "resource-service 资源服务",
    serviceFull: "mtxdevice-resource-service",
    operator: "admin 行政",
    status: isFail ? "failed" : "success",
    bizType: isImage ? "CLOUD_IMAGE" : "CLOUD_VM",
    bizId: "-",
    traceId: "-",
    uri,
    ip: isFail ? "172.30.11.187" : "172.18.0.1",
    params: isFail
      ? `{\n  "arg0": {\n    "deviceType": 2,\n    "platform": 1,\n    "country": "US",\n    "proxyIp": null,\n    "accountId": "2070058832106795010",\n    "boopilotTenantId": "2069786414618636290"\n  }\n}`
      : `{\n  "arg0": "2059591332533673985"\n}`,
    code: isFail ? 500 : 200,
    errMsg: isFail ? "暂无可用指纹浏览器实例（国家=US，平台=1）" : "-",
    createdAt: `2026-07-${isImage ? "17" : "21"} ${pad(Math.max(hour, 10))}:${min}:${pad((i * 7) % 60)}`,
    durationMs: [278, 697, 277, 469, 210, 238, 346, 422, 354, 275, 379, 100, 17][i] ?? 100 + i,
  };
});

export default function LogCenter() {
  const [module, setModule] = useState("all");
  const [action, setAction] = useState("all");
  const [service, setService] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [viewing, setViewing] = useState<LogEntry | null>(null);

  const filtered = useMemo(() => {
    return seed.filter((l) => {
      if (module !== "all" && l.module !== module) return false;
      if (action !== "all" && l.action !== action) return false;
      if (service !== "all" && l.service !== service) return false;
      return true;
    });
  }, [module, action, service]);

  const reset = () => {
    setModule("all");
    setAction("all");
    setService("all");
  };

  return (
    <div className="p-6 space-y-4">
      <Tabs defaultValue="op">
        <TabsList>
          <TabsTrigger value="op">操作日志</TabsTrigger>
        </TabsList>
        <TabsContent value="op" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">模块</Label>
                  <Select value={module} onValueChange={setModule}>
                    <SelectTrigger><SelectValue placeholder="请选择模块" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">动作</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger><SelectValue placeholder="请选择动作" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">所属服务</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger><SelectValue placeholder="请选择所属服务" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
              <div className="flex justify-end mb-2 gap-1">
                <Button variant="ghost" size="icon"><RefreshCw className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>模块</TableHead>
                    <TableHead>动作</TableHead>
                    <TableHead>所属服务</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>请求地址</TableHead>
                    <TableHead>操作时间</TableHead>
                    <TableHead>耗时(MS)</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l, idx) => (
                    <TableRow key={l.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{l.module}</TableCell>
                      <TableCell>{l.action}</TableCell>
                      <TableCell>{l.service}</TableCell>
                      <TableCell>{l.operator}</TableCell>
                      <TableCell>
                        <Badge variant={l.status === "success" ? "default" : "destructive"}>
                          {l.status === "success" ? "成功" : "失败"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate font-mono text-xs">{l.uri}</TableCell>
                      <TableCell className="text-xs">{l.createdAt}</TableCell>
                      <TableCell>{l.durationMs}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="text-primary" onClick={() => setViewing(l)}>
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center mt-4 text-sm text-muted-foreground">
                <span>共 {filtered.length} 条</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-[720px] sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>操作日志详情</SheetTitle>
          </SheetHeader>
          {viewing && (
            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-base font-semibold mb-3">基本信息</h3>
                <div className="border rounded overflow-hidden text-sm">
                  <div className="grid grid-cols-6 border-b">
                    <div className="bg-muted/50 p-3 border-r">模块</div>
                    <div className="p-3 col-span-1 border-r">{viewing.module}</div>
                    <div className="bg-muted/50 p-3 border-r">动作</div>
                    <div className="p-3 col-span-1 border-r">{viewing.action}</div>
                    <div className="bg-muted/50 p-3 border-r">操作人</div>
                    <div className="p-3">{viewing.operator}</div>
                  </div>
                  <div className="grid grid-cols-6 border-b">
                    <div className="bg-muted/50 p-3 border-r">所属服务</div>
                    <div className="p-3 border-r">{viewing.serviceFull}</div>
                    <div className="bg-muted/50 p-3 border-r">状态</div>
                    <div className="p-3 border-r">
                      <Badge variant={viewing.status === "success" ? "default" : "destructive"}>
                        {viewing.status === "success" ? "成功" : "失败"}
                      </Badge>
                    </div>
                    <div className="bg-muted/50 p-3 border-r">业务类型</div>
                    <div className="p-3">{viewing.bizType}</div>
                  </div>
                  <div className="grid grid-cols-6 border-b">
                    <div className="bg-muted/50 p-3 border-r">业务ID</div>
                    <div className="p-3 border-r">{viewing.bizId}</div>
                    <div className="bg-muted/50 p-3 border-r">TraceId</div>
                    <div className="p-3 border-r">{viewing.traceId}</div>
                    <div className="bg-muted/50 p-3 border-r">操作时间</div>
                    <div className="p-3">{viewing.createdAt}</div>
                  </div>
                  <div className="grid grid-cols-6">
                    <div className="bg-muted/50 p-3 border-r">耗时(ms)</div>
                    <div className="p-3 col-span-5">{viewing.durationMs}</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold mb-3">请求信息</h3>
                <div className="border rounded overflow-hidden text-sm">
                  <div className="grid grid-cols-[120px_1fr_60px_160px] border-b">
                    <div className="bg-muted/50 p-3 border-r">请求URI</div>
                    <div className="p-3 border-r font-mono text-xs break-all">{viewing.uri}</div>
                    <div className="bg-muted/50 p-3 border-r">IP</div>
                    <div className="p-3 font-mono text-xs">{viewing.ip}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="bg-muted/50 p-3 border-r">请求参数</div>
                    <pre className="p-3 font-mono text-xs whitespace-pre-wrap bg-muted/20">{viewing.params}</pre>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold mb-3">执行结果</h3>
                <div className="border rounded overflow-hidden text-sm">
                  <div className="grid grid-cols-[120px_1fr_120px_1fr]">
                    <div className="bg-muted/50 p-3 border-r">返回码</div>
                    <div className="p-3 border-r">{viewing.code}</div>
                    <div className="bg-muted/50 p-3 border-r">错误信息</div>
                    <div className="p-3">{viewing.errMsg}</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}