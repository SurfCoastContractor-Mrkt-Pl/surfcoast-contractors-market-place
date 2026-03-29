import { useState } from 'react';

/**
 * Hook to manage "example" entry visibility across pages.
 * Examples show for new users and hide automatically once they hit the threshold.
 * Users can also manually toggle visibility at any time.
 *
 * @param {string} pageKey - Unique key for the page (e.g. 'financial_dashboard')
 * @param {number} completedCount - The user's current completed jobs/sales/listings count
 * @param {number} threshold - How many completions before auto-hiding (default: 10)
 */
export default function useExampleVisibility(pageKey, completedCount = 0, threshold = 10) {
  const storageKey = `surfcoast_examples_hidden_${pageKey}`;

  const [manuallyHidden, setManuallyHidden] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const autoHidden = completedCount >= threshold;
  const showExamples = !autoHidden && !manuallyHidden;

  const hideExamples = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
    setManuallyHidden(true);
  };

  const showExamplesAgain = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setManuallyHidden(false);
  };

  const toggleExamples = () => {
    if (manuallyHidden) {
      showExamplesAgain();
    } else {
      hideExamples();
    }
  };

  return {
    showExamples,
    manuallyHidden,
    autoHidden,
    toggleExamples,
  };
}