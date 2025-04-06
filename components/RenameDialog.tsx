"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";

interface RenameDialogProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}

export default function RenameDialog({
  open,
  initialName,
  onClose,
  onSubmit,
}: RenameDialogProps) {
  const [value, setValue] = useState(initialName);

  useEffect(() => {
    setValue(initialName);
  }, [initialName]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rename</DialogTitle>
      <DialogContent>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          label="New name"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            if (value.trim()) onSubmit(value.trim());
          }}
          variant="contained"
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
}
