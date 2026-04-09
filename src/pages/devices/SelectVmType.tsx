import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Monitor } from "lucide-react";

export default function SelectVmType() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices/virtual")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建虚拟机</h1>
          <p className="text-sm text-muted-foreground mt-0.5">选择虚拟机类型</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card
          className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
          onClick={() => navigate("/devices/virtual/create/cloud")}
        >
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">云机</h3>
              <p className="text-sm text-muted-foreground mt-1">创建基于ARM服务器的云机实例</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
          onClick={() => navigate("/devices/virtual/create/windows")}
        >
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Windows</h3>
              <p className="text-sm text-muted-foreground mt-1">创建基于X86服务器的Windows虚拟机</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
