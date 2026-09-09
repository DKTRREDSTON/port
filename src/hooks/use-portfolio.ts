import { useCallback, useEffect, useState } from 'react';
import { defaultPortfolio, fetchPublishedPortfolio, loadPortfolio, publishPortfolio, savePortfolio, type PortfolioData } from '@/lib/portfolio';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => loadPortfolio());

  // Pull the published version so every device shows the same content
  useEffect(() => {
    fetchPublishedPortfolio().then((remote) => {
      if (remote) setPortfolio(remote);
    });
  }, []);

  const updatePortfolio = useCallback((next: PortfolioData, password?: string) => {
    setPortfolio(next);
    savePortfolio(next); // keep an offline copy on this device
    if (password) return publishPortfolio(next, password);
    return Promise.resolve(true);
  }, []);

  const resetPortfolio = useCallback((password?: string) => {
    const fresh = structuredClone(defaultPortfolio);
    setPortfolio(fresh);
    savePortfolio(fresh);
    if (password) return publishPortfolio(fresh, password);
    return Promise.resolve(true);
  }, []);

  return { portfolio, updatePortfolio, resetPortfolio };
}
