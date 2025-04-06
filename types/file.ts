export type FileType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  children?: FileNode[];
  content?: string; // For files only
}

export interface FileItemProps {
  node: FileNode;
  level: number;
  onFileSelect: (fileId: string) => void;
  selectedFolderId?: string | null;
  onRightClick: (event: React.MouseEvent, node: FileNode) => void;
}
