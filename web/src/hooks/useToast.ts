import { useState, useCallback } from "react";

type ToastType = "success" | "error";

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 1500);
  }, []);

  return { toast, showToast };
};
