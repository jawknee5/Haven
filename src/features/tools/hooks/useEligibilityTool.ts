import { useState } from 'react';
import { toolsApi } from '../api/toolsApi';
import { EligibilityRequest, EligibilityResult } from '../types';

export function useEligibilityTool() {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(payload: EligibilityRequest) {
    setLoading(true);
    setError(null);
    try {
      const res = await toolsApi.checkEligibility(payload);
      setResult(res);
    } catch (e: any) {
      setError(e.message ?? 'Eligibility check failed');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, run };
}
