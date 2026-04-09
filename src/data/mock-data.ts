// ============ 主机服务器 ============
export type HostServerType = "arm" | "x86";
export type HostServerStatus = "online" | "offline" | "error" | "maintenance" | "shielded";

export interface HostServer {
  id: string; // UUID
  name: string;
  type: HostServerType;
  clusterId: string;
  ip: string;
  mac: string;
  network: string;
  os: string;
  cpuModel: string;
  cpuCores: number;
  cpu: number;
  memory: number;
  memoryUsed: number;
  memoryTotal: number;
  disk: number;
  diskUsed: number;
  diskTotal: number;
  temperature: number;
  networkBandwidth: string;
  lastHeartbeat: string;
  status: HostServerStatus;
  uptime: string;
  createdAt: string;
  sn: string;
  rack: string;
  manager: string;
  remark: string;
}

export const hostServers: HostServer[] = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801", name: "ARM生产服务器-01", type: "arm", clusterId: "CLU-ARM-001", ip: "10.0.1.10", mac: "00:1A:2B:3C:4D:01", network: "内网A区", os: "Armbian 23.11", cpuModel: "RK3588", cpuCores: 8, cpu: 52, memory: 68, memoryUsed: 43, memoryTotal: 64, disk: 45, diskUsed: 0.9, diskTotal: 2, temperature: 42, networkBandwidth: "850Mbps/1Gbps", lastHeartbeat: "2026-04-09 14:30:12", status: "online", uptime: "45天12小时", createdAt: "2026-01-15 09:30:00", sn: "SN2026011501", rack: "A区-01机架", manager: "张伟", remark: "" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802", name: "ARM生产服务器-02", type: "arm", clusterId: "CLU-ARM-001", ip: "10.0.1.11", mac: "00:1A:2B:3C:4D:02", network: "内网A区", os: "Armbian 23.11", cpuModel: "RK3588", cpuCores: 8, cpu: 38, memory: 55, memoryUsed: 35, memoryTotal: 64, disk: 32, diskUsed: 0.6, diskTotal: 2, temperature: 38, networkBandwidth: "620Mbps/1Gbps", lastHeartbeat: "2026-04-09 14:29:58", status: "online", uptime: "45天12小时", createdAt: "2026-01-15 10:15:00", sn: "SN2026011502", rack: "A区-01机架", manager: "张伟", remark: "" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803", name: "X86主集群节点-01", type: "x86", clusterId: "CLU-X86-001", ip: "10.0.2.1", mac: "00:1A:2B:3C:4D:03", network: "内网B区", os: "Ubuntu 22.04 LTS", cpuModel: "Xeon E5-2690 v4", cpuCores: 28, cpu: 45, memory: 62, memoryUsed: 160, memoryTotal: 256, disk: 88, diskUsed: 7.0, diskTotal: 8, temperature: 40, networkBandwidth: "8.5Gbps/10Gbps", lastHeartbeat: "2026-04-09 14:30:05", status: "online", uptime: "32天8小时", createdAt: "2026-02-01 14:00:00", sn: "SN2026020101", rack: "B区-02机架", manager: "陈刚", remark: "X86集群主节点" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804", name: "X86备用节点-02", type: "x86", clusterId: "CLU-X86-001", ip: "10.0.2.2", mac: "00:1A:2B:3C:4D:04", network: "内网B区", os: "Ubuntu 22.04 LTS", cpuModel: "Xeon E5-2690 v4", cpuCores: 28, cpu: 0, memory: 0, memoryUsed: 0, memoryTotal: 256, disk: 20, diskUsed: 1.6, diskTotal: 8, temperature: 25, networkBandwidth: "-", lastHeartbeat: "2026-04-07 08:15:00", status: "offline", uptime: "-", createdAt: "2026-02-01 14:30:00", sn: "SN2026020102", rack: "B区-02机架", manager: "陈刚", remark: "待上架" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805", name: "ARM测试服务器-03", type: "arm", clusterId: "CLU-ARM-002", ip: "10.0.1.12", mac: "00:1A:2B:3C:4D:05", network: "内网A区", os: "Armbian 23.11", cpuModel: "RK3588", cpuCores: 8, cpu: 85, memory: 92, memoryUsed: 59, memoryTotal: 64, disk: 78, diskUsed: 1.56, diskTotal: 2, temperature: 63, networkBandwidth: "950Mbps/1Gbps", lastHeartbeat: "2026-04-09 14:28:30", status: "error", uptime: "12天3小时", createdAt: "2026-02-10 08:00:00", sn: "SN2026021001", rack: "A区-02机架", manager: "李娜", remark: "温度异常待检修" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806", name: "X86维护节点-03", type: "x86", clusterId: "CLU-X86-002", ip: "10.0.2.3", mac: "00:1A:2B:3C:4D:06", network: "内网B区", os: "Ubuntu 22.04 LTS", cpuModel: "Xeon E5-2690 v4", cpuCores: 28, cpu: 20, memory: 30, memoryUsed: 77, memoryTotal: 256, disk: 40, diskUsed: 3.2, diskTotal: 8, temperature: 35, networkBandwidth: "-", lastHeartbeat: "2026-04-05 20:00:00", status: "maintenance", uptime: "-", createdAt: "2026-02-15 11:00:00", sn: "SN2026021501", rack: "B区-03机架", manager: "赵敏", remark: "计划维护至3月底" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807", name: "X86扩展节点-04", type: "x86", clusterId: "CLU-X86-001", ip: "10.0.3.1", mac: "00:1A:2B:3C:4D:07", network: "内网C区", os: "CentOS 7.9", cpuModel: "Xeon Gold 6248R", cpuCores: 24, cpu: 35, memory: 48, memoryUsed: 123, memoryTotal: 256, disk: 55, diskUsed: 4.4, diskTotal: 8, temperature: 37, networkBandwidth: "4.2Gbps/10Gbps", lastHeartbeat: "2026-04-09 14:30:01", status: "online", uptime: "28天6小时", createdAt: "2026-03-01 10:00:00", sn: "SN2026030101", rack: "C区-01机架", manager: "王磊", remark: "X86服务器" },
];

// ============ 物理设备 ============
export type DeviceType = "board" | "windows";
export type DeviceStatus = "online" | "offline" | "abnormal" | "processing" | "shielded";

export interface PhysicalDevice {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  server: string;
  osVersion: string;
  operator: string;
  cpu: number;
  memory: number;
  temperature: number;
  status: DeviceStatus;
  totalSlots: number;
  activeSlots: number;
  totalImages: number;
}

export const physicalDevices: PhysicalDevice[] = [
  { id: "DEV-001", name: "ARM主板-A1", type: "board", ip: "192.168.1.101", mac: "AA:BB:CC:DD:EE:01", server: "10.0.1.10", osVersion: "Android 12", operator: "张伟", cpu: 45, memory: 62, temperature: 38, status: "online", totalSlots: 4, activeSlots: 3, totalImages: 20 },
  { id: "DEV-002", name: "ARM主板-A2", type: "board", ip: "192.168.1.102", mac: "AA:BB:CC:DD:EE:02", server: "10.0.1.10", osVersion: "Android 12", operator: "张伟", cpu: 78, memory: 85, temperature: 52, status: "online", totalSlots: 4, activeSlots: 4, totalImages: 18 },
  { id: "DEV-003", name: "ARM主板-A3", type: "board", ip: "192.168.1.103", mac: "AA:BB:CC:DD:EE:03", server: "10.0.1.10", osVersion: "Android 11", operator: "李娜", cpu: 12, memory: 30, temperature: 28, status: "online", totalSlots: 4, activeSlots: 1, totalImages: 15 },
  { id: "DEV-004", name: "ARM主板-A4", type: "board", ip: "192.168.1.104", mac: "AA:BB:CC:DD:EE:04", server: "10.0.1.11", osVersion: "Android 12", operator: "李娜", cpu: 0, memory: 0, temperature: 22, status: "offline", totalSlots: 4, activeSlots: 0, totalImages: 20 },
  { id: "DEV-005", name: "ARM主板-A5", type: "board", ip: "192.168.1.105", mac: "AA:BB:CC:DD:EE:05", server: "10.0.1.11", osVersion: "Android 11", operator: "王磊", cpu: 92, memory: 88, temperature: 65, status: "abnormal", totalSlots: 4, activeSlots: 2, totalImages: 12 },
  { id: "DEV-006", name: "ARM主板-A6", type: "board", ip: "192.168.1.106", mac: "AA:BB:CC:DD:EE:06", server: "10.0.1.11", osVersion: "Android 12", operator: "王磊", cpu: 55, memory: 70, temperature: 42, status: "online", totalSlots: 4, activeSlots: 3, totalImages: 20 },
  { id: "DEV-007", name: "Win主机-W1", type: "windows", ip: "10.0.2.50", mac: "BB:CC:DD:EE:FF:01", server: "10.0.2.1", osVersion: "Windows 11", operator: "陈刚", cpu: 35, memory: 55, temperature: 40, status: "online", totalSlots: 20, activeSlots: 12, totalImages: 20 },
  { id: "DEV-008", name: "Win主机-W2", type: "windows", ip: "10.0.2.51", mac: "BB:CC:DD:EE:FF:02", server: "10.0.2.1", osVersion: "Windows 10", operator: "陈刚", cpu: 60, memory: 72, temperature: 45, status: "processing", totalSlots: 20, activeSlots: 8, totalImages: 15 },
  { id: "DEV-009", name: "Win主机-W3", type: "windows", ip: "10.0.2.52", mac: "BB:CC:DD:EE:FF:03", server: "10.0.2.2", osVersion: "Windows 11", operator: "赵敏", cpu: 0, memory: 0, temperature: 25, status: "offline", totalSlots: 20, activeSlots: 0, totalImages: 10 },
];

// ============ ROM/镜像模版库 ============
export type ImageType = "cloud_engine" | "browser" | "windows_vm" | "plugin";
export type ImageArchitecture = "ARM64" | "x86_64";
export type ImageOS = "Linux" | "Windows" | "Android";
export type ImageStatus = "normal" | "pending" | "disabled" | "corrupted";
export type ImageVisibility = "public" | "custom";
export type ImageTrustStatus = "trusted" | "untrusted" | "scanning";

export interface ResourceSpec {
  cpu: string;
  memory: string;
  disk: string;
}

export interface RomImage {
  id: string;
  name: string;
  type: ImageType;
  visibility: ImageVisibility;
  version: string;
  size: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  architecture: ImageArchitecture;
  os: ImageOS;
  osVersion: string;
  imageStatus: ImageStatus;
  resourceSpec: ResourceSpec;
  entrypoint: string;
  ports: string;
  envVars: string;
  tenant: string;
  trustStatus: ImageTrustStatus;
  maxInstances: number;
  remark: string;
}

export const romImages: RomImage[] = [
  { id: "IMG-001", name: "arm64-light-cloud机-v1.0", type: "cloud_engine", visibility: "public", version: "3.2.1", size: "2.4GB", description: "基础云机镜像，用于跑TikTok脚本", createdAt: "2026-03-15", updatedAt: "2026-03-20", architecture: "ARM64", os: "Android", osVersion: "Android 12", imageStatus: "normal", resourceSpec: { cpu: "0.5核", memory: "1GB", disk: "20GB" }, entrypoint: "/start.sh", ports: "5555", envVars: "API_URL=https://api.example.com", tenant: "默认项目", trustStatus: "trusted", maxInstances: 100, remark: "基础镜像" },
  { id: "IMG-002", name: "arm64-tiktok-cloud机-v2.0", type: "cloud_engine", visibility: "custom", version: "3.2.1-tt", size: "2.6GB", description: "TikTok定制云机镜像", createdAt: "2026-03-20", updatedAt: "2026-03-25", architecture: "ARM64", os: "Android", osVersion: "Android 12", imageStatus: "normal", resourceSpec: { cpu: "1核", memory: "2GB", disk: "30GB" }, entrypoint: "/start.sh", ports: "5555,9222", envVars: "API_URL=https://api.example.com\nPROXY_IP=auto", tenant: "TikTok项目组", trustStatus: "trusted", maxInstances: 50, remark: "TikTok定制版" },
  { id: "IMG-003", name: "arm64-legacy-cloud机-v0.8", type: "cloud_engine", visibility: "public", version: "2.8.0", size: "2.1GB", description: "旧版云机镜像", createdAt: "2025-12-01", updatedAt: "2025-12-01", architecture: "ARM64", os: "Android", osVersion: "Android 11", imageStatus: "disabled", resourceSpec: { cpu: "0.5核", memory: "1GB", disk: "20GB" }, entrypoint: "/start.sh", ports: "5555", envVars: "", tenant: "默认项目", trustStatus: "untrusted", maxInstances: 0, remark: "" },
  { id: "IMG-004", name: "arm64-pro-cloud机-v3.0", type: "cloud_engine", visibility: "custom", version: "3.3.0", size: "2.8GB", description: "高性能云机镜像", createdAt: "2026-03-28", updatedAt: "2026-04-01", architecture: "ARM64", os: "Android", osVersion: "Android 13", imageStatus: "normal", resourceSpec: { cpu: "2核", memory: "4GB", disk: "50GB" }, entrypoint: "/start.sh", ports: "5555,8080", envVars: "API_URL=https://api.example.com", tenant: "默认项目", trustStatus: "trusted", maxInstances: 200, remark: "高性能版本" },
  { id: "IMG-005", name: "x86-win10-env", type: "windows_vm", visibility: "public", version: "2.0.0", size: "15GB", description: "Windows 10虚拟机基础镜像", createdAt: "2026-03-10", updatedAt: "2026-03-15", architecture: "x86_64", os: "Windows", osVersion: "Windows Server 2019", imageStatus: "normal", resourceSpec: { cpu: "4核", memory: "8GB", disk: "100GB" }, entrypoint: "", ports: "3389", envVars: "", tenant: "默认项目", trustStatus: "trusted", maxInstances: 50, remark: "" },
  { id: "IMG-006", name: "x86-win11-tiktok", type: "windows_vm", visibility: "custom", version: "2.1.0", size: "18GB", description: "TikTok专用Windows虚拟机", createdAt: "2026-03-25", updatedAt: "2026-03-28", architecture: "x86_64", os: "Windows", osVersion: "Windows 11", imageStatus: "normal", resourceSpec: { cpu: "4核", memory: "8GB", disk: "120GB" }, entrypoint: "", ports: "3389,9222", envVars: "", tenant: "TikTok项目组", trustStatus: "trusted", maxInstances: 30, remark: "TikTok专用" },
  { id: "IMG-007", name: "arm64-browser-chromium", type: "browser", visibility: "public", version: "1.5.0", size: "520MB", description: "指纹浏览器基础镜像", createdAt: "2025-11-01", updatedAt: "2025-11-01", architecture: "ARM64", os: "Linux", osVersion: "Ubuntu 22.04", imageStatus: "disabled", resourceSpec: { cpu: "0.5核", memory: "512MB", disk: "5GB" }, entrypoint: "/start-browser.sh", ports: "9222", envVars: "", tenant: "默认项目", trustStatus: "untrusted", maxInstances: 0, remark: "" },
  { id: "IMG-008", name: "plugin-proxy-tool", type: "plugin", visibility: "custom", version: "1.0.0", size: "50MB", description: "代理工具插件镜像", createdAt: "2026-04-01", updatedAt: "2026-04-01", architecture: "ARM64", os: "Linux", osVersion: "Alpine 3.18", imageStatus: "pending", resourceSpec: { cpu: "0.1核", memory: "128MB", disk: "1GB" }, entrypoint: "/run.sh", ports: "8080", envVars: "PROXY_MODE=socks5", tenant: "默认项目", trustStatus: "scanning", maxInstances: 500, remark: "代理工具" },
];

// ============ 虚拟设备 ============
export type InstanceStatus = "offline" | "idle" | "warming" | "running" | "error";
export type VirtualDeviceType = "cloud" | "windows";

export interface BoundAccount {
  platform: Platform;
  username: string;
  accountId: string;
}

export interface VirtualInstance {
  id: string;
  type: VirtualDeviceType;
  deviceId: string; // 云机→主板ID, Windows→Windows主机ID(即某Windows主机下的VM)
  boardCardId: string; // 所属板卡ID
  imageId: string; // 镜像ID
  status: InstanceStatus;
  imei: string;
  androidId: string;
  model: string;
  romVersion: string;
  lastActive: string;
  proxyIp: string | null;
}

export const virtualInstances: VirtualInstance[] = [
  { id: "VM-001", type: "cloud", deviceId: "DEV-001", boardCardId: "DEV-001", imageId: "IMG-001", status: "running", imei: "861234567890001", androidId: "a1b2c3d4e5f6", model: "Pixel 6", romVersion: "3.2.1", lastActive: "2026-04-02 10:30", proxyIp: "45.32.100.1" },
  { id: "VM-002", type: "cloud", deviceId: "DEV-001", boardCardId: "DEV-001", imageId: "IMG-002", status: "running", imei: "861234567890002", androidId: "b2c3d4e5f6g7", model: "Samsung S22", romVersion: "3.2.1", lastActive: "2026-04-02 10:28", proxyIp: "45.32.100.2" },
  { id: "VM-003", type: "cloud", deviceId: "DEV-001", boardCardId: "DEV-001", imageId: "IMG-001", status: "idle", imei: "861234567890003", androidId: "c3d4e5f6g7h8", model: "Pixel 6", romVersion: "3.2.1-tt", lastActive: "2026-04-01 22:15", proxyIp: null },
  { id: "VM-004", type: "cloud", deviceId: "DEV-002", boardCardId: "DEV-002", imageId: "IMG-004", status: "running", imei: "861234567890004", androidId: "d4e5f6g7h8i9", model: "OnePlus 10", romVersion: "3.2.1", lastActive: "2026-04-02 10:32", proxyIp: "103.21.50.8" },
  { id: "VM-005", type: "cloud", deviceId: "DEV-002", boardCardId: "DEV-002", imageId: "IMG-002", status: "warming", imei: "861234567890005", androidId: "e5f6g7h8i9j0", model: "Xiaomi 12", romVersion: "3.2.1-tt", lastActive: "2026-04-02 10:25", proxyIp: "103.21.50.9" },
  { id: "VM-006", type: "cloud", deviceId: "DEV-002", boardCardId: "DEV-002", imageId: "IMG-001", status: "running", imei: "861234567890006", androidId: "f6g7h8i9j0k1", model: "Pixel 7", romVersion: "3.2.1", lastActive: "2026-04-02 10:31", proxyIp: "103.21.50.10" },
  { id: "VM-007", type: "cloud", deviceId: "DEV-002", boardCardId: "DEV-002", imageId: "IMG-004", status: "running", imei: "861234567890007", androidId: "g7h8i9j0k1l2", model: "Samsung S23", romVersion: "3.2.1", lastActive: "2026-04-02 10:29", proxyIp: "103.21.50.11" },
  { id: "VM-008", type: "cloud", deviceId: "DEV-003", boardCardId: "DEV-003", imageId: "IMG-001", status: "running", imei: "861234567890008", androidId: "h8i9j0k1l2m3", model: "Pixel 6", romVersion: "2.8.0", lastActive: "2026-04-02 09:50", proxyIp: "185.92.30.5" },
  { id: "VM-009", type: "cloud", deviceId: "DEV-005", boardCardId: "DEV-005", imageId: "IMG-002", status: "error", imei: "861234567890009", androidId: "i9j0k1l2m3n4", model: "OnePlus 9", romVersion: "3.2.1", lastActive: "2026-04-01 15:20", proxyIp: null },
  { id: "VM-010", type: "cloud", deviceId: "DEV-005", boardCardId: "DEV-005", imageId: "IMG-004", status: "running", imei: "861234567890010", androidId: "j0k1l2m3n4o5", model: "Xiaomi 11", romVersion: "3.2.1-tt", lastActive: "2026-04-02 10:20", proxyIp: "185.92.30.6" },
  { id: "VM-011", type: "windows", deviceId: "DEV-007", boardCardId: "", imageId: "IMG-006", status: "running", imei: "-", androidId: "-", model: "Chrome/122", romVersion: "2.1.0", lastActive: "2026-04-02 10:33", proxyIp: "45.32.100.15" },
  { id: "VM-012", type: "windows", deviceId: "DEV-007", boardCardId: "", imageId: "IMG-006", status: "running", imei: "-", androidId: "-", model: "Chrome/122", romVersion: "2.1.0", lastActive: "2026-04-02 10:30", proxyIp: "91.108.56.25" },
  { id: "VM-013", type: "windows", deviceId: "DEV-007", boardCardId: "", imageId: "IMG-005", status: "idle", imei: "-", androidId: "-", model: "Chrome/120", romVersion: "2.0.0", lastActive: "2026-04-01 18:00", proxyIp: null },
  { id: "VM-014", type: "windows", deviceId: "DEV-008", boardCardId: "", imageId: "IMG-006", status: "running", imei: "-", androidId: "-", model: "Chrome/122", romVersion: "2.1.0", lastActive: "2026-04-02 10:28", proxyIp: "103.21.50.30" },
];

// ============ 社交账号 ============
export type Platform = "tiktok" | "facebook" | "twitter" | "instagram";
export type AccountStatus = "alive" | "banned" | "limited";
export type AccountType = "cloud" | "windows";

export interface SocialAccount {
  id: string;
  type: AccountType;
  platform: Platform;
  nickname: string;
  username: string;
  weight: number;
  status: AccountStatus;
  virtualDeviceId: string | null; // 虚拟设备ID
  physicalDeviceId: string | null; // 物理设备ID
  proxyIp: string | null;
  timezone: string;
  language: string;
  location: string;
  lastCheck: string;
}

export const socialAccounts: SocialAccount[] = [
  { id: "ACC-001", type: "cloud", platform: "tiktok", nickname: "TechVibes", username: "@techvibes_01", weight: 85, status: "alive", virtualDeviceId: "VM-001", physicalDeviceId: "DEV-001", proxyIp: "45.32.100.1", timezone: "America/New_York", language: "en-US", location: "40.7128,-74.0060", lastCheck: "2026-04-02 10:00" },
  { id: "ACC-002", type: "cloud", platform: "tiktok", nickname: "DanceQueen", username: "@dancequeen_x", weight: 72, status: "alive", virtualDeviceId: "VM-002", physicalDeviceId: "DEV-001", proxyIp: "45.32.100.2", timezone: "America/Los_Angeles", language: "en-US", location: "34.0522,-118.2437", lastCheck: "2026-04-02 10:00" },
  { id: "ACC-003", type: "cloud", platform: "facebook", nickname: "GlobalNews", username: "globalnews.page", weight: 90, status: "alive", virtualDeviceId: "VM-001", physicalDeviceId: "DEV-001", proxyIp: "45.32.100.1", timezone: "Europe/London", language: "en-GB", location: "51.5074,-0.1278", lastCheck: "2026-04-02 09:30" },
  { id: "ACC-004", type: "cloud", platform: "twitter", nickname: "CryptoKing", username: "@cryptoking_eth", weight: 65, status: "limited", virtualDeviceId: "VM-005", physicalDeviceId: "DEV-002", proxyIp: "103.21.50.9", timezone: "Asia/Singapore", language: "en-SG", location: "1.3521,103.8198", lastCheck: "2026-04-02 08:00" },
  { id: "ACC-005", type: "cloud", platform: "instagram", nickname: "FoodieLife", username: "@foodielife_sg", weight: 78, status: "alive", virtualDeviceId: "VM-004", physicalDeviceId: "DEV-002", proxyIp: "103.21.50.8", timezone: "Asia/Tokyo", language: "ja-JP", location: "35.6762,139.6503", lastCheck: "2026-04-02 09:00" },
  { id: "ACC-006", type: "cloud", platform: "tiktok", nickname: "GamerPro", username: "@gamerpro_gg", weight: 55, status: "banned", virtualDeviceId: "VM-006", physicalDeviceId: "DEV-002", proxyIp: "103.21.50.10", timezone: "Europe/Berlin", language: "de-DE", location: "52.5200,13.4050", lastCheck: "2026-04-01 20:00" },
  { id: "ACC-007", type: "cloud", platform: "facebook", nickname: "ShopDaily", username: "shopdaily.store", weight: 88, status: "alive", virtualDeviceId: "VM-008", physicalDeviceId: "DEV-003", proxyIp: "185.92.30.5", timezone: "Asia/Bangkok", language: "th-TH", location: "13.7563,100.5018", lastCheck: "2026-04-02 07:30" },
  { id: "ACC-008", type: "cloud", platform: "twitter", nickname: "AIResearch", username: "@airesearch_lab", weight: 95, status: "alive", virtualDeviceId: "VM-010", physicalDeviceId: "DEV-005", proxyIp: "185.92.30.6", timezone: "America/Chicago", language: "en-US", location: "41.8781,-87.6298", lastCheck: "2026-04-02 10:15" },
  { id: "ACC-009", type: "windows", platform: "facebook", nickname: "Michael", username: "@michael_fb", weight: 80, status: "alive", virtualDeviceId: "VM-011", physicalDeviceId: "DEV-007", proxyIp: "45.32.100.15", timezone: "America/New_York", language: "en-US", location: "40.7128,-74.0060", lastCheck: "2026-04-02 10:20" },
  { id: "ACC-010", type: "windows", platform: "tiktok", nickname: "Michael_TT", username: "@michael_tt", weight: 70, status: "alive", virtualDeviceId: "VM-011", physicalDeviceId: "DEV-007", proxyIp: "45.32.100.15", timezone: "America/New_York", language: "en-US", location: "40.7128,-74.0060", lastCheck: "2026-04-02 10:20" },
  { id: "ACC-011", type: "windows", platform: "instagram", nickname: "StyleDaily", username: "@style_daily", weight: 75, status: "alive", virtualDeviceId: "VM-012", physicalDeviceId: "DEV-007", proxyIp: "91.108.56.25", timezone: "Europe/Paris", language: "fr-FR", location: "48.8566,2.3522", lastCheck: "2026-04-02 09:45" },
  { id: "ACC-012", type: "windows", platform: "twitter", nickname: "NewsBot", username: "@news_bot", weight: 60, status: "limited", virtualDeviceId: "VM-014", physicalDeviceId: "DEV-008", proxyIp: "103.21.50.30", timezone: "Asia/Tokyo", language: "ja-JP", location: "35.6762,139.6503", lastCheck: "2026-04-02 08:30" },
];

// ============ 代理IP ============
export type ProxyProtocol = "SOCKS5" | "HTTP" | "HTTPS";
export type ProxyStatus = "available" | "unavailable" | "blacklisted";

export interface ProxyItem {
  id: string;
  ip: string;
  port: number;
  protocol: ProxyProtocol;
  region: string;
  country: string;
  status: ProxyStatus;
  virtualDeviceIds: string[]; // 绑定的虚拟设备
  boundAccountIds: string[]; // 绑定的账号
  latency: number;
  anonymity: "high" | "medium" | "low";
  lastCheck: string;
  trafficUsed: number;
}

export const proxyItems: ProxyItem[] = [
  { id: "PX-001", ip: "45.32.100.1", port: 1080, protocol: "SOCKS5", region: "US-East", country: "美国", status: "available", virtualDeviceIds: ["VM-001"], boundAccountIds: ["ACC-001", "ACC-003"], latency: 85, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 1250 },
  { id: "PX-002", ip: "45.32.100.2", port: 1080, protocol: "SOCKS5", region: "US-West", country: "美国", status: "available", virtualDeviceIds: ["VM-002"], boundAccountIds: ["ACC-002"], latency: 120, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 890 },
  { id: "PX-003", ip: "103.21.50.8", port: 8080, protocol: "HTTP", region: "EU-West", country: "英国", status: "available", virtualDeviceIds: ["VM-004"], boundAccountIds: ["ACC-005"], latency: 45, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 2100 },
  { id: "PX-004", ip: "103.21.50.9", port: 8080, protocol: "HTTP", region: "Asia-East", country: "日本", status: "available", virtualDeviceIds: ["VM-005"], boundAccountIds: ["ACC-004"], latency: 65, anonymity: "medium", lastCheck: "2026-04-02 10:30", trafficUsed: 560 },
  { id: "PX-005", ip: "103.21.50.10", port: 443, protocol: "HTTPS", region: "Asia-SE", country: "新加坡", status: "available", virtualDeviceIds: ["VM-006"], boundAccountIds: ["ACC-006"], latency: 35, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 1780 },
  { id: "PX-006", ip: "103.21.50.11", port: 1080, protocol: "SOCKS5", region: "Asia-SE", country: "新加坡", status: "available", virtualDeviceIds: ["VM-007"], boundAccountIds: [], latency: 40, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 430 },
  { id: "PX-007", ip: "185.92.30.5", port: 8080, protocol: "HTTP", region: "EU-Central", country: "德国", status: "unavailable", virtualDeviceIds: ["VM-008"], boundAccountIds: ["ACC-007"], latency: 999, anonymity: "low", lastCheck: "2026-04-02 09:00", trafficUsed: 3200 },
  { id: "PX-008", ip: "185.92.30.6", port: 1080, protocol: "SOCKS5", region: "Asia-SE", country: "泰国", status: "available", virtualDeviceIds: ["VM-010"], boundAccountIds: ["ACC-008"], latency: 75, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 980 },
  { id: "PX-009", ip: "45.32.100.15", port: 443, protocol: "HTTPS", region: "US-Central", country: "美国", status: "available", virtualDeviceIds: ["VM-011"], boundAccountIds: ["ACC-009", "ACC-010"], latency: 90, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 1560 },
  { id: "PX-010", ip: "91.108.56.20", port: 8080, protocol: "HTTP", region: "EU-East", country: "俄罗斯", status: "blacklisted", virtualDeviceIds: [], boundAccountIds: [], latency: 200, anonymity: "low", lastCheck: "2026-04-01 15:00", trafficUsed: 5800 },
  { id: "PX-011", ip: "91.108.56.25", port: 1080, protocol: "SOCKS5", region: "EU-West", country: "法国", status: "available", virtualDeviceIds: ["VM-012"], boundAccountIds: ["ACC-011"], latency: 55, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 720 },
  { id: "PX-012", ip: "103.21.50.30", port: 443, protocol: "HTTPS", region: "Asia-East", country: "日本", status: "available", virtualDeviceIds: ["VM-014"], boundAccountIds: ["ACC-012"], latency: 50, anonymity: "high", lastCheck: "2026-04-02 10:30", trafficUsed: 340 },
];

// ============ 脚本 ============
export type ScriptType = "android" | "windows";

export interface Script {
  id: string;
  name: string;
  type: ScriptType;
  version: string;
  compatibleRom: string;
  description: string;
  remark: string;
  updatedAt: string;
  status: "active" | "testing" | "deprecated";
  canaryPercent: number;
}

export const scripts: Script[] = [
  { id: "SCR-001", name: "TikTok 养号脚本", type: "android", version: "2.5.0", compatibleRom: "3.2.1-tt", description: "自动浏览视频、点赞、关注，模拟真实用户行为", remark: "稳定版本，已全量推送", updatedAt: "2026-04-01", status: "active", canaryPercent: 100 },
  { id: "SCR-002", name: "TikTok 私信群发", type: "android", version: "1.8.3", compatibleRom: "3.2.1-tt", description: "批量发送私信，支持模板变量和随机延迟", remark: "注意频率限制", updatedAt: "2026-03-28", status: "active", canaryPercent: 100 },
  { id: "SCR-003", name: "Facebook 点赞互动", type: "windows", version: "3.0.1", compatibleRom: "N/A", description: "浏览器端自动点赞、评论互动脚本", remark: "", updatedAt: "2026-03-30", status: "active", canaryPercent: 100 },
  { id: "SCR-004", name: "Instagram 涨粉", type: "android", version: "1.2.0-beta", compatibleRom: "3.2.1", description: "关注/取关策略养号，提升账号权重", remark: "测试阶段，慎用", updatedAt: "2026-04-02", status: "testing", canaryPercent: 10 },
  { id: "SCR-005", name: "Twitter 自动发帖", type: "windows", version: "2.1.0", compatibleRom: "N/A", description: "定时发布推文，支持图文混排", remark: "", updatedAt: "2026-03-25", status: "active", canaryPercent: 100 },
  { id: "SCR-006", name: "通用签到脚本", type: "android", version: "1.0.0", compatibleRom: "2.8.0", description: "各平台每日签到任务自动完成", remark: "已废弃，请使用新版", updatedAt: "2025-11-20", status: "deprecated", canaryPercent: 0 },
];

// ============ 任务 ============
export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  name: string;
  scriptId: string;
  scriptName: string;
  targetAccounts: string[];
  status: TaskStatus;
  progress: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  params: Record<string, string>;
  logs: string[];
}

export const tasks: Task[] = [
  { id: "TASK-001", name: "TikTok批量养号-A组", scriptId: "SCR-001", scriptName: "TikTok 养号脚本", targetAccounts: ["ACC-001", "ACC-002"], status: "running", progress: 65, createdAt: "2026-04-02 08:00", startedAt: "2026-04-02 08:05", completedAt: null, params: { duration: "30min", likeCount: "50" }, logs: ["[10:25] ACC-001: 已浏览 32 个视频", "[10:26] ACC-001: 点赞 18 个", "[10:28] ACC-002: 已浏览 28 个视频", "[10:30] ACC-002: 点赞 15 个"] },
  { id: "TASK-002", name: "Facebook互动-英国组", scriptId: "SCR-003", scriptName: "Facebook 点赞互动", targetAccounts: ["ACC-003"], status: "completed", progress: 100, createdAt: "2026-04-02 06:00", startedAt: "2026-04-02 06:05", completedAt: "2026-04-02 07:30", params: { targetPosts: "20" }, logs: ["[06:05] 任务启动", "[07:30] 完成，成功互动 20 条帖子"] },
  { id: "TASK-003", name: "私信群发-美国组", scriptId: "SCR-002", scriptName: "TikTok 私信群发", targetAccounts: ["ACC-001", "ACC-002"], status: "pending", progress: 0, createdAt: "2026-04-02 10:00", startedAt: null, completedAt: null, params: { template: "Hi {{name}}, check out our new product!", count: "100" }, logs: [] },
  { id: "TASK-004", name: "Instagram涨粉测试", scriptId: "SCR-004", scriptName: "Instagram 涨粉", targetAccounts: ["ACC-005"], status: "failed", progress: 35, createdAt: "2026-04-01 14:00", startedAt: "2026-04-01 14:10", completedAt: "2026-04-01 14:45", params: { followCount: "200" }, logs: ["[14:10] 任务启动", "[14:35] 已关注 70 人", "[14:45] 错误：脚本异常退出，API限流"] },
  { id: "TASK-005", name: "Twitter批量发帖", scriptId: "SCR-005", scriptName: "Twitter 自动发帖", targetAccounts: ["ACC-004", "ACC-008"], status: "running", progress: 40, createdAt: "2026-04-02 09:00", startedAt: "2026-04-02 09:10", completedAt: null, params: { postCount: "10", interval: "15min" }, logs: ["[09:10] ACC-004: 发布第 1 条推文", "[09:25] ACC-008: 发布第 1 条推文", "[09:40] ACC-004: 发布第 2 条推文"] },
  { id: "TASK-006", name: "TikTok养号-B组", scriptId: "SCR-001", scriptName: "TikTok 养号脚本", targetAccounts: ["ACC-006"], status: "failed", progress: 10, createdAt: "2026-04-01 20:00", startedAt: "2026-04-01 20:05", completedAt: "2026-04-01 20:15", params: { duration: "60min" }, logs: ["[20:05] 任务启动", "[20:10] ACC-006: 检测到账号已封禁", "[20:15] 任务终止"] },
];

// ============ Dashboard 统计 ============
export const dashboardStats = {
  onlineDevices: 6,
  totalDevices: 9,
  activeInstances: 10,
  totalInstances: 14,
  taskSuccessRate: 67,
  accountSurvivalRate: 75,
  alertCount: 3,
  totalProxies: 12,
  healthyProxies: 10,
};

export const trendData = [
  { date: "03-27", devices: 7, instances: 12, tasks: 15 },
  { date: "03-28", devices: 7, instances: 14, tasks: 22 },
  { date: "03-29", devices: 8, instances: 13, tasks: 18 },
  { date: "03-30", devices: 8, instances: 16, tasks: 25 },
  { date: "03-31", devices: 6, instances: 11, tasks: 12 },
  { date: "04-01", devices: 7, instances: 13, tasks: 20 },
  { date: "04-02", devices: 6, instances: 10, tasks: 16 },
];

// ============ 告警通知 ============
export interface AlertItem {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  time: string;
  read: boolean;
}

export const alerts: AlertItem[] = [
  { id: "ALT-001", type: "error", message: "设备 DEV-005 温度过高 (65°C)，建议检查散热", time: "10:20", read: false },
  { id: "ALT-002", type: "error", message: "代理 PX-007 (185.92.30.5) 连接失败，已持续 1.5 小时", time: "09:00", read: false },
  { id: "ALT-003", type: "warning", message: "账号 ACC-006 (@gamerpro_gg) 已被 TikTok 封禁", time: "昨天 20:10", read: true },
  { id: "ALT-004", type: "warning", message: "实例 VM-009 启动失败，ROM 可能损坏", time: "昨天 15:20", read: true },
  { id: "ALT-005", type: "info", message: "脚本 SCR-004 灰度发布已覆盖 10% 设备", time: "今天 08:00", read: true },
];
