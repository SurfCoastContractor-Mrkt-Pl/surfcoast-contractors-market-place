import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { severity = 'critical', testType = 'payment' } = body;
    
    let errorMessage = '';
    let errorStack = '';
    let actionAttempted = '';
    
    // Simulate different error types
    switch (testType) {
      case 'payment':
        errorMessage = 'Stripe payment processing failed: Invalid API key or network timeout';
        errorStack = 'Error: stripe.checkout.sessions.create() failed at createPaymentCheckout.js:45';
        actionAttempted = 'Attempting to create Stripe checkout session for payment';
        break;
      case 'login':
        errorMessage = 'Authentication failed: User credentials invalid or database timeout';
        errorStack = 'Error: base44.auth.me() returned null at AuthContext.jsx:32';
        actionAttempted = 'User attempting to log in';
        break;
      case 'form':
        errorMessage = 'Form submission failed: Required fields missing or validation error';
        errorStack = 'Error: handleSubmit() validation failed at TaskForm.jsx:78';
        actionAttempted = 'Submitting contractor profile form';
        break;
      case 'api':
        errorMessage = 'API call failed: Network error or server unreachable (status 503)';
        errorStack = 'Error: fetch() failed at useUserData.js:21';
        actionAttempted = 'Fetching contractor data from API';
        break;
      default:
        errorMessage = 'Unknown error occurred in the system';
        actionAttempted = 'Generic platform operation';
    }
    
    // Log the test error
    const result = await base44.functions.invoke('logFrontendError', {
      userEmail: 'admin@surfcoast.io',
      userName: 'Test Admin User',
      userId: 'admin-test',
      pageOrFeature: `Test Page (${testType})`,
      actionAttempted,
      errorMessage,
      errorStack,
      platform: 'desktop',
      system: 'main_app'
    });
    
    return Response.json({
      success: true,
      message: `Test ${severity} error (${testType}) triggered successfully`,
      errorLogId: result.data?.errorLogId
    });
  } catch (error) {
    console.error('Error in triggerTestError:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});