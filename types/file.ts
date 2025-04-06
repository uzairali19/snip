export type FileType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  children?: FileNode[];
  content?: string; // For files only
}
