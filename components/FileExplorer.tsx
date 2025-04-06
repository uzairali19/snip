"use client";

import { Box, Typography, IconButton, Tooltip, Snackbar } from "@mui/material";
import { CreateNewFolder, NoteAdd } from "@mui/icons-material";
import React, { useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { FileNode } from "@/types/file";
import FileItem from "./FileItem";
import ContextMenu from "./ContextMenu";
import RenameDialog from "./RenameDialog";

interface FileExplorerProps {
  tree: FileNode[];
  onFileSelect: (fileId: string) => void;
  onAddFile: () => void;
  onAddFolder: () => void;
  selectedFolderId?: string | null;
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateTree: (tree: FileNode[]) => void;
  showToast: (msg: string) => void;
}

export default function FileExplorer({
  tree,
  onFileSelect,
  onAddFile,
  onAddFolder,
  selectedFolderId,
  onDragEnd,
  onUpdateTree,
  showToast,
}: FileExplorerProps) {
  const [contextAnchor, setContextAnchor] = useState<null | HTMLElement>(null);
  const [contextNode, setContextNode] = useState<FileNode | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRightClick = (event: React.MouseEvent, node: FileNode) => {
    event.preventDefault();
    setContextAnchor(event.currentTarget as HTMLElement);
    setContextNode(node);
  };

  const handleDelete = () => {
    if (!contextNode) return;

    const deleteNode = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .map((node) => {
          if (node.id === contextNode.id) return null;
          if (node.children) {
            return {
              ...node,
              children: deleteNode(node.children).filter(Boolean),
            };
          }
          return node;
        })
        .filter(Boolean) as FileNode[];
    };

    const updated = deleteNode(tree);
    onUpdateTree(updated);
    showToast(`Deleted ${contextNode.name}`);
    setContextNode(null);
  };

  const handleRename = (newName: string) => {
    if (!contextNode) return;

    const renameNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === contextNode.id) {
          return { ...node, name: newName };
        }
        if (node.children) {
          return { ...node, children: renameNode(node.children) };
        }
        return node;
      });
    };

    const updated = renameNode(tree);
    onUpdateTree(updated);
    showToast(`Renamed to ${newName}`);
    setContextNode(null);
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={1}
        py={0.5}
        sx={{ backgroundColor: "#1e1e1e", borderBottom: "1px solid #333" }}
      >
        <Typography variant="subtitle2" color="white" fontWeight="bold">
          SNIP
        </Typography>
        <Box display="flex" gap={0.5}>
          <Tooltip title="New File">
            <IconButton size="small" onClick={onAddFile}>
              <NoteAdd fontSize="small" sx={{ color: "#ccc" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Folder">
            <IconButton size="small" onClick={onAddFolder}>
              <CreateNewFolder fontSize="small" sx={{ color: "#ccc" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box px={0.5} py={0.5}>
        {tree.map((node) => (
          <FileItem
            key={node.id}
            node={node}
            level={0}
            onFileSelect={onFileSelect}
            selectedFolderId={selectedFolderId}
            onRightClick={handleRightClick}
          />
        ))}
      </Box>

      <ContextMenu
        anchorEl={contextAnchor}
        onClose={() => setContextAnchor(null)}
        onRename={() => setRenameDialogOpen(true)}
        onDelete={handleDelete}
      />

      <RenameDialog
        open={renameDialogOpen}
        initialName={contextNode?.name || ""}
        onClose={() => setRenameDialogOpen(false)}
        onSubmit={(newName) => {
          setRenameDialogOpen(false);
          handleRename(newName);
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
