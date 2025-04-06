"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";

interface NewItemDialogProps {
  open: boolean;
  type: "file" | "folder";
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function NewItemDialog({
  open,
  type,
  onClose,
  onSubmit,
}: NewItemDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create new {type}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label={`${type === "file" ? "File" : "Folder"} name`}
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
