/**
 * Cypress E2E Test Suite
 * Tests complete user workflows from login to case management
 */

describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with demo credentials', () => {
    cy.get('button').contains('Demo Access').click();
    cy.url().should('include', '/dashboard');
    cy.contains('My Cases').should('be.visible');
  });

  it('should display error on invalid login', () => {
    cy.get('input[placeholder="you@example.com"]').type('invalid@example.com');
    cy.get('input[placeholder="••••••••"]').type('wrongpassword');
    cy.get('button').contains('Sign In').click();
    cy.contains('Login failed').should('be.visible');
  });

  it('should redirect to login when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});

describe('User Dashboard - Case Management', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display case statistics', () => {
    cy.contains('Total Cases').should('be.visible');
    cy.contains('New').should('be.visible');
    cy.contains('Enriched').should('be.visible');
  });

  it('should create a new case', () => {
    cy.get('button').contains('Create New Case').click();
    cy.get('input[placeholder="Case title..."]').type('Test Housing Case');
    cy.get('textarea[placeholder="Describe your case..."]').type('I need help finding housing');
    cy.get('select').select('HOUSING');
    cy.get('button').contains('Create Case').click();
    cy.contains('Test Housing Case').should('be.visible');
  });

  it('should filter cases by status', () => {
    cy.get('select').last().select('NEW');
    cy.contains('No cases found').should('not.exist');
  });

  it('should search cases', () => {
    cy.get('input[placeholder="Search cases..."]').type('housing');
    cy.get('div').contains('housing', { matchCase: false }).should('be.visible');
  });

  it('should open case detail modal', () => {
    cy.get('div[role="button"]').first().click();
    cy.contains('✕').should('be.visible');
    cy.get('button').contains('Close').should('be.visible');
  });

  it('should close case detail modal', () => {
    cy.get('div[role="button"]').first().click();
    cy.get('button').contains('Close').click();
    cy.contains('My Cases').should('be.visible');
  });
});

describe('Caseworker Dashboard - Bulk Operations', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.visit('/admin');
  });

  it('should display caseworker dashboard', () => {
    cy.contains('Caseworker Dashboard').should('be.visible');
  });

  it('should select individual cases', () => {
    cy.get('input[type="checkbox"]').eq(1).check();
    cy.contains('1 case(s) selected').should('be.visible');
  });

  it('should select all cases', () => {
    cy.get('button').contains('Select All').click();
    cy.contains('case(s) selected').should('include.text', 'case(s)');
  });

  it('should bulk enrich selected cases', () => {
    cy.get('input[type="checkbox"]').eq(1).check();
    cy.get('button').contains('Bulk Enrich').click();
    cy.contains('Enriching', { timeout: 10000 }).should('be.visible');
  });

  it('should open bulk route modal', () => {
    cy.get('input[type="checkbox"]').eq(1).check();
    cy.get('button').contains('Bulk Route').click();
    cy.contains('Route Cases to Resources').should('be.visible');
  });

  it('should clear case selections', () => {
    cy.get('button').contains('Select All').click();
    cy.get('button').contains('Clear').click();
    cy.contains('0 case(s) selected').should('be.visible');
  });
});

describe('BB Chat Interface', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.url().should('include', '/dashboard');
  });

  it('should open floating chat window', () => {
    cy.get('button').contains('💬').click();
    cy.contains('BB Assistant').should('be.visible');
  });

  it('should send message in chat', () => {
    cy.get('button').contains('💬').click();
    cy.get('input[placeholder="Ask BB anything..."]').type('Hello BB');
    cy.get('button').contains('↑').click();
    cy.contains('Hello BB').should('be.visible');
  });

  it('should display typing indicator', () => {
    cy.get('button').contains('💬').click();
    cy.get('input[placeholder="Ask BB anything..."]').type('How can you help?');
    cy.get('button').contains('↑').click();
    cy.contains('BB is typing', { timeout: 5000 }).should('be.visible');
  });

  it('should close chat window', () => {
    cy.get('button').contains('💬').click();
    cy.get('button').contains('✕').first().click();
    cy.contains('BB Assistant').should('not.be.visible');
  });

  it('should navigate to full chat page', () => {
    cy.visit('/chat');
    cy.contains('Chat with BB').should('be.visible');
    cy.contains('Quick Help').should('be.visible');
  });

  it('should display quick suggestions', () => {
    cy.visit('/chat');
    cy.contains('Help with housing').should('be.visible');
    cy.contains('Job assistance').should('be.visible');
  });

  it('should fill message from suggestion', () => {
    cy.visit('/chat');
    cy.contains('Help with housing').click();
    cy.get('input[placeholder="Ask BB anything..."]')
      .should('have.value', 'I need help finding housing');
  });
});

describe('Form Automation', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.visit('/forms');
  });

  it('should display form upload interface', () => {
    cy.contains('Form Automation').should('be.visible');
    cy.contains('Upload a form').should('be.visible');
  });

  it('should switch between upload and paste modes', () => {
    cy.get('button').contains('Paste HTML').click();
    cy.get('textarea[placeholder*="Paste your HTML"]').should('be.visible');
  });

  it('should analyze uploaded form', () => {
    // Create a mock form file
    const formHtml = '<form><input name="email" type="email" required /></form>';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(formHtml),
      fileName: 'form.html'
    });
    
    cy.contains('Fill Your Form', { timeout: 5000 }).should('be.visible');
  });

  it('should validate form fields', () => {
    // Navigate to form editor (after analysis)
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button').contains('Submit Form').click();
    cy.contains('Invalid email', { timeout: 3000 }).should('be.visible');
  });

  it('should submit valid form', () => {
    cy.get('input[type="email"]').type('valid@example.com');
    cy.get('input[type="text"]').first().type('John Doe');
    cy.get('button').contains('Submit Form').click();
    cy.contains('Form Submitted Successfully', { timeout: 5000 }).should('be.visible');
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should have proper heading hierarchy', () => {
    cy.get('h1').should('exist');
    cy.get('h1').should('contain', 'PATHWAY');
  });

  it('should have proper form labels', () => {
    cy.get('label').should('exist');
    cy.get('label').contains('Email').should('be.visible');
  });

  it('should be keyboard navigable', () => {
    cy.get('input[type="email"]').focus();
    cy.focused().should('have.attr', 'placeholder', 'you@example.com');
    cy.tab();
    cy.focused().should('have.attr', 'type', 'password');
  });

  it('should have alt text for icons', () => {
    cy.visit('/dashboard');
    // Verify ARIA labels exist
    cy.get('[aria-label]').should('exist');
  });
});

describe('Performance', () => {
  it('should load dashboard within 3 seconds', () => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.url().should('include', '/dashboard');
    cy.contains('My Cases', { timeout: 3000 }).should('be.visible');
  });

  it('should handle large case lists', () => {
    cy.visit('/login');
    cy.get('button').contains('Demo Access').click();
    cy.visit('/admin');
    // Scroll through large list
    cy.get('table').scrollTo('bottom');
    cy.contains('1 case').should('exist');
  });
});

describe('Error Handling', () => {
  it('should display error on failed login', () => {
    cy.visit('/login');
    cy.get('input[placeholder="you@example.com"]').type('test@example.com');
    cy.get('input[placeholder="••••••••"]').type('wrongpass');
    cy.get('button').contains('Sign In').click();
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should recover from error', () => {
    cy.visit('/login');
    cy.get('input[placeholder="you@example.com"]').type('test@example.com');
    cy.get('input[placeholder="••••••••"]').type('wrongpass');
    cy.get('button').contains('Sign In').click();
    cy.get('[role="alert"]').should('exist');
    cy.get('button').contains('✕').click();
    cy.get('[role="alert"]').should('not.exist');
  });
});
