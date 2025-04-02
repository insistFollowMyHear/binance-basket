import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export function useLoading() {
  const [loadingText, setLoadingText] = useState<string>('');
  const [loadingContainer, setLoadingContainer] = useState<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<ReturnType<typeof createRoot> | null>(null);

  const showLoading = useCallback((text?: string) => {
    if (!loadingContainer) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      setLoadingContainer(container);
      const newRoot = createRoot(container);
      setRoot(newRoot);
      newRoot.render(<LoadingSpinner text={text} />);
    }
    setLoadingText(text || '');
  }, [loadingContainer]);

  const hideLoading = useCallback(() => {
    if (loadingContainer && root) {
      root.unmount();
      loadingContainer.remove();
      setLoadingContainer(null);
      setRoot(null);
    }
    setLoadingText('');
  }, [loadingContainer, root]);

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