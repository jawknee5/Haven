export interface EligibilityRequest {
  zip: string;
  income: number;
  householdSize: number;
}

export interface EligibilityResult {
  eligible: boolean;
  programs: string[];
}

export interface AddressValidationResult {
  valid: boolean;
  normalizedAddress?: string;
  lat?: number;
  lng?: number;
}

export interface Note {
  id: string;
  taskId?: string;
  content: string;
  createdAt: string;
}
