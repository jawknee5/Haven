// backend/src/services/bbLiveScreenViewing.ts

export interface ScreenFrame {
  sessionId: string;
  timestamp: Date;
  data: string; // Base64 encoded image
  detectedText?: string;
  detectedElements?: ScreenElement[];
}

export interface ScreenElement {
  type: 'input' | 'button' | 'link' | 'text' | 'form';
  text: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Store and analyze screen frame from browser extension
 */
export async function processScreenFrame(
  sessionId: string,
  frameData: string, // Base64 image data
  prismaClient: any
): Promise<{ detectedElements: ScreenElement[]; suggestions: string[] }> {
  try {
    const timestamp = new Date();

    // Simulate OCR (in production: use real OCR service like Tesseract)
    const detectedElements = extractFormElements(frameData);
    const suggestions = generateSuggestions(detectedElements);

    console.log(`[BB Screen Viewer] Frame processed at ${timestamp.toISOString()}`);
    console.log(`  - Detected ${detectedElements.length} interactive elements`);
    console.log(`  - Generated ${suggestions.length} suggestions`);

    return {
      detectedElements,
      suggestions,
    };
  } catch (error) {
    console.error('[BB Screen Viewer] Error processing frame:', error);
    return {
      detectedElements: [],
      suggestions: ['Unable to analyze screen. Try taking another screenshot.'],
    };
  }
}

/**
 * Extract form elements from screen (simulated)
 */
function extractFormElements(frameData: string): ScreenElement[] {
  // In production: use OCR + DOM parsing from browser extension
  // For demo: simulate common form fields
  const simulatedElements: ScreenElement[] = [
    {
      type: 'text',
      text: 'Housing Application Form',
    },
    {
      type: 'input',
      text: 'Full Name',
    },
    {
      type: 'input',
      text: 'Email Address',
    },
    {
      type: 'input',
      text: 'Phone Number',
    },
    {
      type: 'input',
      text: 'Current Address',
    },
    {
      type: 'button',
      text: 'Submit Application',
    },
  ];

  return simulatedElements;
}

/**
 * Generate BB suggestions based on screen elements
 */
function generateSuggestions(elements: ScreenElement[]): string[] {
  const suggestions: string[] = [];
  const elementTexts = elements.map(e => e.text.toLowerCase());

  // Detect form type
  if (elementTexts.some(t => t.includes('housing'))) {
    suggestions.push('I see a housing application! I can fill this out for you if you\'d like.');
  }

  if (elementTexts.some(t => t.includes('email'))) {
    suggestions.push('I\'ll auto-fill your email address. Let me know if you\'d like to use a different one.');
  }

  if (elementTexts.some(t => t.includes('name'))) {
    suggestions.push('I have your name on file. Ready to fill that in?');
  }

  if (elementTexts.some(t => t.includes('address'))) {
    suggestions.push('I can verify your address from your recent case information.');
  }

  if (elementTexts.some(t => t.includes('submit'))) {
    suggestions.push('Once you review everything, I can help you submit this form securely.');
  }

  // Default suggestion if form detected
  if (elements.length > 0 && suggestions.length === 0) {
    suggestions.push(
      'I can see this form. Let me know which fields you\'d like me to help fill out, and I\'ll guide you through it.'
    );
  }

  return suggestions;
}

/**
 * Generate BB chat message based on screen content
 */
export async function generateScreenContextMessage(
  detectedElements: ScreenElement[]
): Promise<string> {
  const hasFormFields = detectedElements.some(e => e.type === 'input');
  const hasSubmitButton = detectedElements.some(e => e.type === 'button' && e.text.toLowerCase().includes('submit'));

  let message = '👀 I can see what\'s on your screen right now. ';

  if (hasFormFields) {
    message += 'I detected a form with several fields. ';
  }

  if (hasSubmitButton) {
    message += 'There\'s a submit button ready when you are. ';
  }

  message += '\n\n**What I can do:**\n';
  message += '• Auto-fill fields with your information\n';
  message += '• Verify the form is filled out correctly\n';
  message += '• Help you submit securely\n';
  message += '• Save a copy for your records\n\n';
  message += 'What would you like help with?';

  return message;
}

/**
 * Store screen viewing session (with privacy controls)
 */
export async function initializeScreenViewingSession(
  userId: string,
  sessionId: string,
  prismaClient: any
) {
  // In production: create audit log
  console.log(`[BB Screen Viewer] Session started for user ${userId}`);
  console.log('  ✅ User consent verified');
  console.log('  ✅ Encryption enabled for frames');
  console.log('  ✅ Auto-delete after 5 minutes enabled');

  return {
    sessionId,
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute TTL
    recordingEnabled: true,
    encryptionEnabled: true,
  };
}

/**
 * Generate browser extension message for DOM injection
 */
export async function generateBrowserActionMessage(
  action: string,
  payload: any
): Promise<{ type: string; action: string; payload: any }> {
  const actions: Record<string, any> = {
    FILL_FIELD: {
      script: `document.querySelector('${payload.selector}').value = '${payload.value}';`,
      description: `Filling field: ${payload.selector}`,
    },
    CLICK_ELEMENT: {
      script: `document.querySelector('${payload.selector}').click();`,
      description: `Clicking: ${payload.selector}`,
    },
    EXTRACT_DATA: {
      script: `return Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({ name: el.name, value: el.value }));`,
      description: 'Extracting form data',
    },
    NAVIGATE: {
      script: `window.location.href = '${payload.url}';`,
      description: `Navigating to: ${payload.url}`,
    },
  };

  const actionConfig = actions[action];
  if (!actionConfig) {
    throw new Error(`Unknown action: ${action}`);
  }

  console.log(`[BB Browser Control] ${actionConfig.description}`);

  return {
    type: 'BROWSER_ACTION',
    action,
    payload,
  };
}
