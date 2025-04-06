"use client";

import { Menu, MenuItem, MenuProps } from "@mui/material";

interface ContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ContextMenu({
  anchorEl,
  onClose,
  onRename,
  onDelete,
}: ContextMenuProps) {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItem
        onClick={() => {
          onRename();
          onClose();
        }}
      >
        Rename
      </MenuItem>
      <MenuItem
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        Delete
      </MenuItem>
    </Menu>
  );
}
