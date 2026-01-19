import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getUserFriendlyError, logError } from "@/lib/error-handler";

/**
 * Hook for displaying user-friendly error messages as toasts
 */
export function useErrorToast() {
  const { toast } = useToast();

  const showError = useCallback(
    (error: unknown, context?: Record<string, any>) => {
      const errorDetails = getUserFriendlyError(error);
      logError(error, context);

      toast({
        variant: "destructive",
        title: errorDetails.title,
        description: errorDetails.message,
        duration: 5000,
      });

      return errorDetails;
    },
    [toast],
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Success",
        description: message,
        duration: 3000,
      });
    },
    [toast],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Warning",
        description: message,
        duration: 4000,
      });
    },
    [toast],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Info",
        description: message,
        duration: 3000,
      });
    },
    [toast],
  );

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}
