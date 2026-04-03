import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { severity, testType } = body;

    if (!severity || !testType) {
      return Response.json(
        { error: 'Missing required parameters: severity and testType' },
        { status: 400 }
      );
    }

    // Define test error scenarios
    const errorScenarios = {
      payment: {
        message: '[TEST] Payment processing failed due to invalid card',
        stack: 'Error: Payment declined\n  at processPayment (stripe.js:42)\n  at createCheckout (checkout.js:15)\n  at handlePaymentClick (PaymentDemo.jsx:89)',
        context: { attemptedAmount: 99.99, paymentMethod: 'card' }
      },
      login: {
        message: '[TEST] Authentication service temporarily unavailable',
        stack: 'Error: Auth service error\n  at verifyCredentials (auth.js:78)\n  at loginUser (AuthContext.jsx:156)',
        context: { service: 'authentication', endpoint: '/auth/login' }
      },
      form: {
        message: '[TEST] Form validation error on submission',
        stack: 'Error: Invalid form data\n  at validateForm (FormValidator.js:45)\n  at onSubmit (BecomeContractor.jsx:203)',
        context: { formName: 'ContractorOnboarding', missingFields: ['email', 'phone'] }
      },
      api: {
        message: '[TEST] API request timeout or network error',
        stack: 'Error: Timeout on API call\n  at fetchData (apiClient.js:62)\n  at useQuery (useFetch.js:34)',
        context: { endpoint: '/api/contractors', timeout: 30000 }
      }
    };

    const scenario = errorScenarios[testType] || errorScenarios.api;

    // Log the test error to the ErrorLog entity
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      message: scenario.message,
      level: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning',
      category: testType === 'payment' ? 'payment' : testType === 'login' ? 'auth' : 'validation',
      stack: scenario.stack,
      context: scenario.context,
      user_id: 'test-user',
      url: 'https://app.base44.com/platform-tests',
      user_agent: 'Test Error Trigger - Platform Tests',
      resolved: false
    });

    // Invoke the alert function to notify admin
    await base44.asServiceRole.functions.invoke('sendAdminAlerts', {
      errorId: errorLog.id,
      severity: severity,
      message: scenario.message,
      testType: testType,
      isTestError: true
    });

    return Response.json({
      success: true,
      message: `Test ${severity} error (${testType}) triggered successfully`,
      errorId: errorLog.id
    });
  } catch (error) {
    console.error('Error triggering test error:', error);
    return Response.json(
      { error: error.message || 'Failed to trigger test error' },
      { status: 500 }
    );
  }
});