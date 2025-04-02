import { useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export function useLoading() {
  const [loadingText, setLoadingText] = useState<string>('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  const showLoading = useCallback((text?: string) => {
    if (!containerRef.current) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      containerRef.current = container;
      const newRoot = createRoot(container);
      rootRef.current = newRoot;
      newRoot.render(<LoadingSpinner text={text} />);
    }
    setLoadingText(text || '');
  }, []);

  const hideLoading = useCallback(() => {
    if (containerRef.current && rootRef.current) {
      rootRef.current.unmount();
      containerRef.current.remove();
      containerRef.current = null;
      rootRef.current = null;
    }
    setLoadingText('');
  }, []);

  const withLoading = useCallback(async <T extends any>(
    callback: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    try {
      showLoading(text);
      return await callback();
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return {
    loadingText,
    showLoading,
    hideLoading,
    withLoading,
  };
} 