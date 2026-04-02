import { useCallback, useState } from "react";

const useCrudDialogState = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateForm = useCallback(() => {
    setEditingId(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const requestDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const clearDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  return {
    isFormOpen,
    editingId,
    deletingId,
    openCreateForm,
    openEditForm,
    closeForm,
    requestDelete,
    clearDelete,
  };
};

export default useCrudDialogState;
