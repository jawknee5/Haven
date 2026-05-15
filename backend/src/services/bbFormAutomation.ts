// backend/src/services/bbFormAutomation.ts
import { prisma } from '../utils/prismaVault';
import * as cheerio from 'cheerio';

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label?: string;
  required: boolean;
  options?: string[];
  value?: string;
}

export interface FormAnalysis {
  formName: string;
  fields: FormField[];
  submitButtonSelector?: string;
  formSelector: string;
}

/**
 * Parse HTML form and extract field definitions
 */
export async function analyzeFormHTML(formHTML: string): Promise<FormAnalysis> {
  const $ = cheerio.load(formHTML);
  
  const formElement = $('form').first();
  const formName = formElement.attr('id') || formElement.attr('name') || 'Unknown Form';
  const formSelector = formElement.attr('id') ? `#${formElement.attr('id')}` : 'form';

  const fields: FormField[] = [];

  // Extract all input fields
  formElement.find('input, select, textarea').each((_, element) => {
    const $el = $(element);
    const name = $el.attr('name');
    const type = $el.attr('type') || 'text';
    const label = $el.prev('label').text() || $el.attr('placeholder') || name;
    const required = $el.attr('required') !== undefined;

    if (name) {
      const field: FormField = {
        name,
        type: type as FormField['type'],
        label,
        required,
        value: $el.val() as string || '',
      };

      // For select fields, extract options
      if (element.tagName === 'select') {
        field.options = $el.find('option').map((_, opt) => $(opt).text()).get();
      }

      fields.push(field);
    }
  });

  const submitButtonSelector = formElement.find('button[type="submit"], input[type="submit"]').attr('class') 
    || 'button[type="submit"]';

  return {
    formName,
    fields,
    submitButtonSelector,
    formSelector,
  };
}

/**
 * Map form fields to user data
 */
export async function mapUserDataToForm(
  userId: string,
  formFields: FormField[],
  prismaClient: any
): Promise<Record<string, any>> {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error('User not found');

  const mapping: Record<string, any> = {};

  formFields.forEach(field => {
    const fieldNameLower = field.name.toLowerCase();

    // Map common field names to user data
    if (fieldNameLower.includes('email')) {
      mapping[field.name] = user.email;
    } else if (fieldNameLower.includes('name') && !fieldNameLower.includes('last') && !fieldNameLower.includes('first')) {
      mapping[field.name] = user.name;
    } else if (fieldNameLower.includes('first')) {
      mapping[field.name] = user.name.split(' ')[0];
    } else if (fieldNameLower.includes('last')) {
      mapping[field.name] = user.name.split(' ').slice(1).join(' ');
    }
  });

  return mapping;
}

/**
 * Verify form data accuracy before submission
 */
export async function verifyFormAccuracy(
  mappedData: Record<string, any>,
  formFields: FormField[]
): Promise<{ hasErrors: boolean; errors: string[]; missingDocs: string[] }> {
  const errors: string[] = [];
  const missingDocs: string[] = [];

  formFields.forEach(field => {
    if (field.required && !mappedData[field.name]) {
      errors.push(`Required field "${field.label}" is missing`);
      missingDocs.push(field.label || field.name);
    }

    // Validate email format
    if (field.type === 'email' && mappedData[field.name]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mappedData[field.name])) {
        errors.push(`Invalid email format for "${field.label}"`);
      }
    }

    // Validate date format
    if (field.type === 'date' && mappedData[field.name]) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(mappedData[field.name])) {
        errors.push(`Invalid date format for "${field.label}"`);
      }
    }
  });

  return {
    hasErrors: errors.length > 0,
    errors,
    missingDocs,
  };
}

/**
 * Store form submission in database
 */
export async function storeFormSubmission(
  caseId: string,
  applicationId: string,
  formData: Record<string, any>,
  formName: string,
  prismaClient: any,
  { encrypt }: any
) {
  const submission = await prismaClient.formSubmission.create({
    data: {
      caseId,
      applicationId,
      formName,
      formFields: JSON.stringify(formData),
      filledFields: encrypt(JSON.stringify(formData)),
      eSignatureStatus: 'UNSIGNED',
      verificationStatus: 'VERIFIED',
      createdAt: new Date(),
    },
  });

  return submission;
}

/**
 * Generate e-signature verification document
 */
export async function generateSignatureVerification(
  formData: Record<string, any>,
  userId: string
) {
  const crypto = require('crypto');

  const formHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(formData))
    .digest('hex');

  return {
    formHash,
    userId,
    timestamp: new Date().toISOString(),
    deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
  };
}
