import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, ChevronLeft, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { romImages } from "@/data/mock-data";

interface TagItem {
  id: string;
  name: string;
  count: number;
  remark: string;
  createdAt: string;
}

export const mockTags: TagItem[] = [
  { id: "tag-1", name: "开发", count: 8, remark: "", createdAt: "2026-04-03 03:49:34" },
  { id: "tag-2", name: "生产", count: 12, remark: "生产环境资源", createdAt: "2026-03-15 10:00:00" },
  { id: "tag-3", name: "测试", count: 5, remark: "测试环境资源", createdAt: "2026-03-18 14:20:00" },
  { id: "tag-4", name: "ARM专用", count: 6, remark: "ARM架构专用", createdAt: "2026-03-20 09:30:00" },
  { id: "tag-5", name: "TikTok", count: 4, remark: "TikTok业务", createdAt: "2026-03-22 16:00:00" },
  { id: "tag-6", name: "高性能", count: 3, remark: "高性能配置", createdAt: "2026-03-25 11:15:00" },
];

const PAGE_SIZES = [10, 20, 50];

export default function TagManagement() {
  const [tags, setTags] = useState<TagItem[]>(mockTags);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Create/Edit dialog
  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagRemark, setTagRemark] = useState("");

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const filteredTags = useMemo(() => {
    if (!searchText.trim()) return tags;
    const q = searchText.toLowerCase();
    return tags.filter(t => t.name.toLowerCase().includes(q));
  }, [tags, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const pagedTags = filteredTags.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setEditingTag(null);
    setTagName("");
    setTagRemark("");
    setShowDialog(true);
  };

  const openEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagRemark(tag.remark);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!tagName.trim()) { toast.error("请输入标签名称"); return; }
    if (editingTag) {
      setTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, name: tagName, remark: tagRemark } : t));
      toast.success("标签已更新");
    } else {
      const newTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: tagName,
        count: 0,
        remark: tagRemark,
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      };
      setTags(prev => [...prev, newTag]);
      toast.success("标签已创建");
    }
    setShowDialog(false);
  };

  const openDelete = (tag: TagItem) => {
    setDeletingTag(tag);
    setDeleteConfirm(false);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (deletingTag) {
      setTags(prev => prev.filter(t => t.id !== deletingTag.id));
      toast.success("标签已删除");
    }
    setShowDeleteDialog(false);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">标签</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>标签可用于对板卡或者虚拟机资源进行分组管理，每个资源都可以拥有多个标签</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />创建标签
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-8 text-xs w-64" placeholder="请输入名称搜索" value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">名称 ↕</TableHead>
                  <TableHead className="text-xs">数量</TableHead>
                  <TableHead className="text-xs">备注</TableHead>
                  <TableHead className="text-xs">创建时间 ↕</TableHead>
                  <TableHead className="text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTags.map(tag => (
                  <TableRow key={tag.id}>
                    <TableCell className="text-sm">{tag.name}</TableCell>
                    <TableCell className="text-sm">{tag.count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tag.remark || "-"}</TableCell>
                    <TableCell className="text-sm">{tag.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="link" size="sm" className="h-6 px-1 text-xs" onClick={() => openEdit(tag)}>编辑</Button>
                        <Button variant="link" size="sm" className="h-6 px-1 text-xs text-destructive" onClick={() => openDelete(tag)}>删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <span>共 {filteredTags.length} 条</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}条/页</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="px-2">{currentPage}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
            <span>前往</span>
            <Input className="w-12 h-7 text-xs text-center" defaultValue={1} onKeyDown={e => { if (e.key === "Enter") { const v = Number((e.target as HTMLInputElement).value); if (v >= 1 && v <= totalPages) setCurrentPage(v); } }} />
            <span>页</span>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={open => !open && setShowDialog(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingTag ? "编辑标签" : "创建标签"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <Label className="w-12 text-right text-sm shrink-0"><span className="text-destructive">*</span> 名称</Label>
                <Input placeholder='标签命名1-100 字符，可含英文字母(区分大小写)、数字、汉字、允许下划线"_"、连字符"-"、点。' value={tagName} onChange={e => setTagName(e.target.value)} />
              </div>
              <div className="flex items-start gap-4">
                <Label className="w-12 text-right text-sm shrink-0 mt-2">备注</Label>
                <div className="flex-1 relative">
                  <Textarea placeholder="请输入备注" maxLength={1000} value={tagRemark} onChange={e => setTagRemark(e.target.value)} className="min-h-[100px]" />
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">{tagRemark.length}/1000</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleSave}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={open => !open && setShowDeleteDialog(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>删除标签</DialogTitle></DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
              <div className="flex gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="font-semibold">此操作会导致资源和标签的关联关系也会被删除！</p>
              </div>
            </div>
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">已选择 1 项</p>
                <div className="border rounded-md p-3 text-sm bg-muted/30">{deletingTag?.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="delete-confirm" checked={deleteConfirm} onCheckedChange={v => setDeleteConfirm(!!v)} />
                <Label htmlFor="delete-confirm" className="text-sm">我已知晓此操作会导致资源和标签的关联关系也会被删除</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>取消</Button>
              <Button disabled={!deleteConfirm} onClick={handleDelete}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
