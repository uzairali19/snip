export interface RenameDialogProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}
