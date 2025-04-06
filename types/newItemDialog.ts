export interface NewItemDialogProps {
  open: boolean;
  type: "file" | "folder";
  onClose: () => void;
  onSubmit: (name: string) => void;
}
