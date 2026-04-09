import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateWindowsVm() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices/virtual")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建Windows虚拟机</h1>
          <p className="text-sm text-muted-foreground mt-0.5">创建基于X86服务器的Windows虚拟机实例</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">编辑项待定</p>
        </CardContent>
      </Card>
    </div>
  );
}
