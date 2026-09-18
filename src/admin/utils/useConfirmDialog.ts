import { useState } from 'react';

export interface ConfirmDialogState {
  isOpen: boolean;
  actionType: 'create' | 'edit' | 'delete';
  title?: string;
  itemName?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
}

export const useConfirmDialog = () => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const requestConfirm = (options: {
    actionType: 'create' | 'edit' | 'delete';
    title?: string;
    itemName?: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      ...options
    });
  };

  const closeConfirm = () => setConfirmDialog(null);

  return {
    confirmDialog,
    requestConfirm,
    closeConfirm
  };
};

export default useConfirmDialog;
