import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { PortfolioHome } from '@/pages/PortfolioHome';
import { usePortfolio } from '@/hooks/use-portfolio';
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
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/">
          <PortfolioHome portfolio={portfolio} onSave={updatePortfolio} onReset={resetPortfolio} />
        </Route>
        <Route path="/project/:id">
          <ProjectDetail portfolio={portfolio} />
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
