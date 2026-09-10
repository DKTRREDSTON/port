import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { PortfolioHome } from '@/pages/PortfolioHome';
import { usePortfolio } from '@/hooks/use-portfolio';
import { loadLang, saveLang, type Lang } from '@/lib/portfolio';
import { useCallback, useState } from 'react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const routerBase = import.meta.env.BASE_URL.startsWith('.')
  ? ''
  : import.meta.env.BASE_URL.replace(/\/$/, '');

function Router() {
  const { portfolio, updatePortfolio, resetPortfolio } = usePortfolio();
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next = current === 'ar' ? 'en' : 'ar';
      saveLang(next);
      return next;
    });
  }, []);

  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/">
          <PortfolioHome portfolio={portfolio} lang={lang} onToggleLang={toggleLang} onSave={updatePortfolio} onReset={resetPortfolio} />
        </Route>
        <Route path="/project/:id">
          <ProjectDetail portfolio={portfolio} lang={lang} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={routerBase}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
