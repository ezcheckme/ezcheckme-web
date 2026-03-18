/**
 * useDialog hook.
 * Generic dialog state management replacing Redux openDialog/closeDialog pattern.
 */

import { useState } from "react";

interface DialogState<T = unknown> {
  open: boolean;
  data: T | null;
}

export function useDialog<T = unknown>(initialOpen = false) {
  const [state, setState] = useState<DialogState<T>>({
    open: initialOpen,
    data: null,
  });

  const openDialog = (data?: T) => {
    setState({ open: true, data: data ?? null });
  };

  const closeDialog = () => {
    setState({ open: false, data: null });
  };

  return {
    open: state.open,
    data: state.data,
    openDialog,
    closeDialog,
  };
}
