import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title =
    pathname === "/proxy/sessions" ? "代理会话"
    : pathname === "/vnc/sessions" ? "VNC会话"
    : pathname === "/devices/nodes" ? "服务节点"
    : "功能建设中";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground text-sm">该模块正在建设中，敬请期待。</p>
    </div>
  );
}