import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      admin: user.email,
      tests: {},
      issues: [],
    };

    // Test 1: Contractor Entity Operations
    console.log('Testing Contractor entity operations...');
    try {
      const contractors = await base44.asServiceRole.entities.Contractor.list('-updated_date', 5);
      results.tests.contractor_list = {
        status: 'pass',
        count: contractors?.length || 0,
      };

      if (contractors && contractors.length > 0) {
        const contractor = contractors[0];
        results.tests.contractor_read = {
          status: 'pass',
          id: contractor.id,
          name: contractor.name,
          email: contractor.email,
        };

        // Test contractor update
        const updatedContractor = await base44.asServiceRole.entities.Contractor.update(
          contractor.id,
          { bio: `Test update at ${new Date().toISOString()}` }
        );
        results.tests.contractor_update = { status: 'pass' };
      }
    } catch (error) {
      results.tests.contractor_ops = { status: 'fail', error: error.message };
      results.issues.push(`Contractor entity error: ${error.message}`);
    }

    // Test 2: Customer Entity Operations
    console.log('Testing Customer entity operations...');
    try {
      const customers = await base44.asServiceRole.entities.CustomerProfile.list('-updated_date', 5);
      results.tests.customer_list = {
        status: 'pass',
        count: customers?.length || 0,
      };

      if (customers && customers.length > 0) {
        results.tests.customer_read = {
          status: 'pass',
          email: customers[0].email,
          name: customers[0].full_name,
        };
      }
    } catch (error) {
      results.tests.customer_ops = { status: 'fail', error: error.message };
      results.issues.push(`Customer entity error: ${error.message}`);
    }

    // Test 3: Messages Entity
    console.log('Testing Messages...');
    try {
      const messages = await base44.asServiceRole.entities.Message.list('-created_date', 5);
      results.tests.messages = {
        status: 'pass',
        count: messages?.length || 0,
      };
    } catch (error) {
      results.tests.messages = { status: 'fail', error: error.message };
      results.issues.push(`Messages error: ${error.message}`);
    }

    // Test 4: ScopeOfWork Entity
    console.log('Testing ScopeOfWork...');
    try {
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.list('-updated_date', 5);
      results.tests.scope_of_work = {
        status: 'pass',
        count: scopes?.length || 0,
      };

      if (scopes && scopes.length > 0) {
        const scope = scopes[0];
        results.tests.scope_detail = {
          status: 'pass',
          id: scope.id,
          status: scope.status,
          job_title: scope.job_title,
        };
      }
    } catch (error) {
      results.tests.scope_of_work = { status: 'fail', error: error.message };
      results.issues.push(`ScopeOfWork error: ${error.message}`);
    }

    // Test 5: Payments Entity
    console.log('Testing Payments...');
    try {
      const payments = await base44.asServiceRole.entities.Payment.list('-created_date', 5);
      results.tests.payments = {
        status: 'pass',
        count: payments?.length || 0,
      };
    } catch (error) {
      results.tests.payments = { status: 'fail', error: error.message };
      results.issues.push(`Payments error: ${error.message}`);
    }

    // Test 6: Reviews Entity
    console.log('Testing Reviews...');
    try {
      const reviews = await base44.asServiceRole.entities.Review.list('-created_date', 5);
      results.tests.reviews = {
        status: 'pass',
        count: reviews?.length || 0,
      };
    } catch (error) {
      results.tests.reviews = { status: 'fail', error: error.message };
      results.issues.push(`Reviews error: ${error.message}`);
    }

    // Test 7: Jobs Entity
    console.log('Testing Jobs...');
    try {
      const jobs = await base44.asServiceRole.entities.Job.list('-created_date', 5);
      results.tests.jobs = {
        status: 'pass',
        count: jobs?.length || 0,
      };
    } catch (error) {
      results.tests.jobs = { status: 'fail', error: error.message };
      results.issues.push(`Jobs error: ${error.message}`);
    }

    // Test 8: ContentReport Entity
    console.log('Testing ContentReports...');
    try {
      const reports = await base44.asServiceRole.entities.ContentReport.list('-created_date', 5);
      results.tests.content_reports = {
        status: 'pass',
        count: reports?.length || 0,
      };
    } catch (error) {
      results.tests.content_reports = { status: 'fail', error: error.message };
      results.issues.push(`ContentReport error: ${error.message}`);
    }

    // Test 9: QuoteRequest Entity
    console.log('Testing QuoteRequests...');
    try {
      const quotes = await base44.asServiceRole.entities.QuoteRequest.list('-created_date', 5);
      results.tests.quote_requests = {
        status: 'pass',
        count: quotes?.length || 0,
      };
    } catch (error) {
      results.tests.quote_requests = { status: 'fail', error: error.message };
      results.issues.push(`QuoteRequest error: ${error.message}`);
    }

    // Test 10: Disputes Entity
    console.log('Testing Disputes...');
    try {
      const disputes = await base44.asServiceRole.entities.Dispute.list('-created_date', 5);
      results.tests.disputes = {
        status: 'pass',
        count: disputes?.length || 0,
      };
    } catch (error) {
      results.tests.disputes = { status: 'fail', error: error.message };
      results.issues.push(`Disputes error: ${error.message}`);
    }

    // Test 11: Error Logs
    console.log('Testing ErrorLogs...');
    try {
      const errorLogs = await base44.asServiceRole.entities.ErrorLog.list('-created_date', 5);
      results.tests.error_logs = {
        status: 'pass',
        count: errorLogs?.length || 0,
      };
    } catch (error) {
      results.tests.error_logs = { status: 'fail', error: error.message };
      results.issues.push(`ErrorLog error: ${error.message}`);
    }

    // Test 12: SecurityAlerts
    console.log('Testing SecurityAlerts...');
    try {
      const alerts = await base44.asServiceRole.entities.SecurityAlert.list('-created_date', 5);
      results.tests.security_alerts = {
        status: 'pass',
        count: alerts?.length || 0,
      };
    } catch (error) {
      results.tests.security_alerts = { status: 'fail', error: error.message };
      results.issues.push(`SecurityAlert error: ${error.message}`);
    }

    // Test 13: ProgressPayments
    console.log('Testing ProgressPayments...');
    try {
      const progressPayments = await base44.asServiceRole.entities.ProgressPayment.list('-created_date', 5);
      results.tests.progress_payments = {
        status: 'pass',
        count: progressPayments?.length || 0,
      };
    } catch (error) {
      results.tests.progress_payments = { status: 'fail', error: error.message };
      results.issues.push(`ProgressPayment error: ${error.message}`);
    }

    // Summary
    const passCount = Object.values(results.tests).filter(t => t.status === 'pass').length;
    const failCount = Object.values(results.tests).filter(t => t.status === 'fail').length;

    results.summary = {
      total_tests: Object.keys(results.tests).length,
      passed: passCount,
      failed: failCount,
      success_rate: `${Math.round((passCount / Object.keys(results.tests).length) * 100)}%`,
    };

    console.log('Comprehensive test suite completed:', results.summary);

    return Response.json(results);
  } catch (error) {
    console.error('Comprehensive test error:', error);
    return Response.json(
      { error: 'Test suite failed' },
      { status: 500 }
    );
  }
});