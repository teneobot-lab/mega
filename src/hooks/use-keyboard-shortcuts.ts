import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + D = Dashboard
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        navigate('/');
      }
      // Alt + S = Sales
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        navigate('/sales');
      }
      // Alt + P = Purchasing
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        navigate('/purchasing');
      }
      // Alt + R = Reports
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        navigate('/reports');
      }
      // Alt + M = Master Data
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        navigate('/master');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
