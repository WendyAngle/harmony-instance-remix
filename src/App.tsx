import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewDashboard from "./pages/NewDashboard";
import Landing from "./pages/Landing";
import PhysicalDevices from "./pages/devices/PhysicalDevices";
import HostServers from "./pages/devices/HostServers";
import VirtualInstances from "./pages/devices/VirtualInstances";
import CreateContainer from "./pages/devices/CreateContainer";
import SelectVmType from "./pages/devices/SelectVmType";
import CreateWindowsVm from "./pages/devices/CreateWindowsVm";
import ImageLibrary from "./pages/devices/ImageLibrary";
import CloudDrive from "./pages/devices/CloudDrive";
import BoardCardManagement from "./pages/devices/BoardCardManagement";
import TagManagement from "./pages/devices/TagManagement";
import AccountManagement from "./pages/accounts/AccountManagement";
import ProxyPool from "./pages/proxy/ProxyPool";
import ScriptHub from "./pages/scripts/ScriptHub";
import TaskOrchestration from "./pages/scripts/TaskOrchestration";
import AppManagement from "./pages/apps/AppManagement";
import FileManagement from "./pages/apps/FileManagement";
import TaskManagement from "./pages/ops/TaskManagement";
import NodeManagement from "./pages/ops/NodeManagement";
import CreateNode from "./pages/ops/CreateNode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-dashboard" element={<NewDashboard />} />
            <Route path="/devices/servers" element={<HostServers />} />
            <Route path="/devices/physical" element={<PhysicalDevices />} />
            <Route path="/devices/boardcards" element={<BoardCardManagement />} />
            <Route path="/devices/tags" element={<TagManagement />} />
            <Route path="/devices/virtual" element={<VirtualInstances />} />
            <Route path="/devices/virtual/create" element={<SelectVmType />} />
            <Route path="/devices/virtual/create/cloud" element={<CreateContainer />} />
            <Route path="/devices/virtual/create/windows" element={<CreateWindowsVm />} />
            <Route path="/devices/images" element={<ImageLibrary />} />
            <Route path="/devices/clouddrive" element={<CloudDrive />} />
            <Route path="/accounts" element={<AccountManagement />} />
            <Route path="/proxy/pool" element={<ProxyPool />} />
            <Route path="/apps/manage" element={<AppManagement />} />
            <Route path="/apps/files" element={<FileManagement />} />
            <Route path="/scripts/hub" element={<ScriptHub />} />
            <Route path="/scripts/tasks" element={<TaskOrchestration />} />
            <Route path="/ops/tasks" element={<TaskManagement />} />
            <Route path="/ops/nodes" element={<NodeManagement />} />
            <Route path="/ops/nodes/create" element={<CreateNode />} />
          </Route>
          <Route path="/landing" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
