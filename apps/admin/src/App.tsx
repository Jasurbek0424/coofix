import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster, toast } from "sonner";
import { ApiError } from "@/api/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { t } from "@/i18n/ru";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { routes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      retry: (count, err) => {
        if (err instanceof ApiError && err.status > 0 && err.status < 500) return false;
        return count < 2;
      },
    },
    mutations: { retry: false },
  },
  queryCache: new QueryCache({
    onError: (err, query) => {
      // Background refetch failures surface as a toast; first loads render inline errors.
      if (query.state.data !== undefined && !(err instanceof ApiError && err.status === 401)) {
        toast.error(err instanceof ApiError ? err.userMessage : t.errors.generic);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _v, _c, mutation) => {
      if (mutation.options.meta?.silent) return;
      if (err instanceof ApiError && err.code === "validation_error" && err.fields.length) return; // shown inline
      toast.error(err instanceof ApiError ? err.userMessage : t.errors.generic);
    },
  }),
});

const router = createBrowserRouter(routes);

function ThemedToaster() {
  const { resolved } = useTheme();
  return <Toaster theme={resolved} position="bottom-right" richColors closeButton toastOptions={{ duration: 4000 }} />;
}

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            <RouterProvider router={router} />
            <ThemedToaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: { silent?: boolean };
  }
}
