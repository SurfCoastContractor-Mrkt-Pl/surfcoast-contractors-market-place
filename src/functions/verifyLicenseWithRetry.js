/**
 * Verify License With Exponential Backoff Retry
 * Handles API failures gracefully with 3 retries
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { license_number, contractor_id, state } = await req.json();

    if (!license_number || !state) {
      return Response.json({ error: 'license_number and state required' }, { status: 400 });
    }

    // Attempt verification with exponential backoff retry
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Simulate license verification API call
        const verificationResponse = await fetch(
          `https://license-api.example.com/verify?number=${license_number}&state=${state}`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (!verificationResponse.ok) {
          if (verificationResponse.status === 503) {
            throw new Error('License API temporarily unavailable');
          }
          throw new Error(`Verification failed: ${verificationResponse.status}`);
        }

        const data = await verificationResponse.json();

        if (data.valid) {
          // Update contractor with verified status
          if (contractor_id) {
            await base44.asServiceRole.entities.Contractor.update(contractor_id, {
              license_verified: true,
              license_verification_method: 'api',
              license_status: 'active',
              license_verified_at: new Date().toISOString()
            });
          }

          console.log(`License verified: ${license_number} (attempt ${attempt + 1})`);
          return Response.json({ 
            success: true, 
            verified: true,
            status: 'active',
            attempt: attempt + 1
          });
        }

        throw new Error('License not found or inactive');
      } catch (error) {
        lastError = error;
        console.warn(`License verification attempt ${attempt + 1} failed: ${error.message}`);

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential: 1s, 2s, 4s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted
    console.error(`License verification failed after ${maxRetries + 1} attempts`);
    return Response.json({ 
      success: false,
      verified: false,
      status: 'unverified',
      error: lastError.message,
      attempts: maxRetries + 1
    }, { status: 500 });
  } catch (error) {
    console.error('verifyLicenseWithRetry error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});