/**
 * useDialog hook.
 * Generic dialog state management replacing Redux openDialog/closeDialog pattern.
 */

import { useState, useCallback } from "react";

interface DialogState<T = unknown> {
  open: boolean;
  data: T | null;
}

export function useDialog<T = unknown>(initialOpen = false) {
  const [state, setState] = useState<DialogState<T>>({
    open: initialOpen,
    data: null,
  });

  const openDialog = useCallback((data?: T) => {
    setState({ open: true, data: data ?? (null as T | null) });
  }, []);

  const closeDialog = useCallback(() => {
    setState({ open: false, data: null });
  }, []);

  return {
    open: state.open,
    data: state.data,
    openDialog,
    closeDialog,
  };
}
