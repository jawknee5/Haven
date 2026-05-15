import { EligibilityRequest, EligibilityResult, AddressValidationResult, Note } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const toolsApi = {
  checkEligibility: (payload: EligibilityRequest): Promise<EligibilityResult> =>
    fetch(`${API_BASE}/tools/eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  validateAddress: (address: string): Promise<AddressValidationResult> =>
    fetch(`${API_BASE}/tools/address-validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ address }),
    }).then((r) => r.json()),

  saveNote: (payload: { taskId?: string; content: string }): Promise<Note> =>
    fetch(`${API_BASE}/tools/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
};
