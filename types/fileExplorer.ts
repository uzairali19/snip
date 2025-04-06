import { FileNode } from "./file";

export interface FileExplorerProps {
  tree: FileNode[];
  onFileSelect: (fileId: string) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  selectedFolderId?: string | null;
  onUpdateTree: (tree: FileNode[]) => void;
  showToast: (msg: string) => void;
}
