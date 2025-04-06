"use client";

import { Box, Typography, IconButton, alpha } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import React, { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FileNode } from "@/types/file";
import { getFileIcon } from "./fileIcons";

interface FileItemProps {
  node: FileNode;
  level: number;
  onFileSelect: (fileId: string) => void;
  selectedFolderId?: string | null;
  onRightClick: (event: React.MouseEvent, node: FileNode) => void;
}

export default function FileItem({
  node,
  level,
  onFileSelect,
  selectedFolderId,
  onRightClick,
}: FileItemProps) {
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
  } = useDraggable({
    id: node.id,
  });
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: node.id });

  const isSelected = selectedFolderId === node.id;

  const handleSelect = () => {
    onFileSelect(node.id);
    if (node.type === "folder") {
      setOpen((prev) => !prev);
    }
  };

  return (
    <Box ref={dropRef} pl={level * 2}>
      <Box
        ref={dragRef}
        {...attributes}
        {...listeners}
        display="flex"
        alignItems="center"
        onContextMenu={(e) => {
          e.preventDefault();
          onRightClick(e, node);
        }}
        sx={{
          cursor: "pointer",
          px: 0.5,
          py: 0.3,
          borderRadius: 1,
          backgroundColor: isSelected
            ? "#333"
            : isOver
            ? alpha("#888", 0.2)
            : "transparent",
          "&:hover": {
            backgroundColor: "#2a2a2a",
          },
        }}
      >
        {node.type === "folder" ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            {open ? (
              <ExpandMore fontSize="small" />
            ) : (
              <ChevronRight fontSize="small" />
            )}
          </IconButton>
        ) : (
          <Box width={32} />
        )}

        <Typography
          variant="body2"
          color="white"
          onClick={handleSelect}
          sx={{
            fontSize: 13,
            userSelect: "none",
            flexGrow: 1,
            cursor: "pointer",
          }}
        >
          {getFileIcon(node.name, node.type)} {node.name}
        </Typography>
      </Box>

      {open &&
        node.children?.map((child) => (
          <FileItem
            key={child.id}
            node={child}
            level={level + 1}
            onFileSelect={onFileSelect}
            selectedFolderId={selectedFolderId}
            onRightClick={onRightClick}
          />
        ))}
    </Box>
  );
}
