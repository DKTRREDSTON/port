import { useCallback, useState } from 'react';
import { defaultPortfolio, loadPortfolio, savePortfolio, type PortfolioData } from '@/lib/portfolio';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => loadPortfolio());

  const updatePortfolio = useCallback((next: PortfolioData) => {
    setPortfolio(next);
    savePortfolio(next);
  }, []);

  const resetPortfolio = useCallback(() => {
    const fresh = structuredClone(defaultPortfolio);
    setPortfolio(fresh);
    savePortfolio(fresh);
  }, []);

  return { portfolio, updatePortfolio, resetPortfolio };
}