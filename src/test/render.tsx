import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";

import { I18nProvider, type Language } from "@/i18n";
import { AuthProvider } from "@/shared/auth";
import { ThemeProvider } from "@/shared/theme";

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", language = "en" }: { route?: string; language?: Language } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <I18nProvider initialLanguage={language}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>,
  );
}
