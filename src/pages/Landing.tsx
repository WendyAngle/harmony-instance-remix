import { ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGIN_URL = "https://id.bohaiyun.com/login";

const stats = [
  { value: "10,000+", label: "在线设备" },
  { value: "50,000+", label: "并发实例" },
  { value: "99.95%", label: "服务可用性" },
  { value: "24/7", label: "运维保障" },
];

export default function Landing() {
  const goLogin = () => {
    window.location.href = LOGIN_URL;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50/40 to-sky-100/40">
      {/* Header */}
      <header className="flex items-center justify-between px-8 md:px-16 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Matrix Device</h1>
            <p className="text-xs text-muted-foreground">矩阵设备服务平台</p>
          </div>
        </div>
        <Button onClick={goLogin} className="rounded-full px-6 shadow-md shadow-primary/20">
          开始使用 <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-16 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-border/60 px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          云资源 · 设备资源 · 一体化管控平台
        </div>

        <h2 className="mt-8 text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          让每一台设备与每一个云实例
        </h2>
        <h2 className="mt-2 text-5xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
          尽在掌控之中
        </h2>

        <p className="mt-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Matrix Device 提供从物理板卡、主机服务器到虚拟机、镜像模版与镜像实例的一站式管理能力，
          为大规模矩阵化业务提供稳定、灵活、可扩展的基础设施底座。
        </p>

        <div className="mt-10">
          <Button size="lg" onClick={goLogin} className="rounded-lg px-8 h-12 text-base shadow-lg shadow-primary/20">
            开始使用 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/90 backdrop-blur border border-border/50 px-6 py-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border/40">
        © 2026 Matrix Device · 矩阵设备服务平台
      </footer>
    </div>
  );
}