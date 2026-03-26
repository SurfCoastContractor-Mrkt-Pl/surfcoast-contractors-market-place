import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const payload = await req.json();

    const {
      jobTitle,
      description,
      budget,
      timeline,
      contractorId,
      contractorName,
      contractorEmail,
      customerName,
      customerEmail,
      workDescription,
      photos,
      tradeCategory
    } = payload;

    // Validate required fields
    if (!jobTitle || !description || !contractorId || !customerName || !customerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs to prevent email injection
    const sanitize = (str) => String(str).replace(/[\r\n]/g, ' ').slice(0, 1000);
    const safeJobTitle = sanitize(jobTitle);
    const safeDescription = sanitize(description);
    const safeCustomerName = sanitize(customerName);
    const safeContractorName = sanitize(contractorName || '');
    const safeBudget = sanitize(budget || '');
    const safeTimeline = sanitize(timeline || '');
    const safeTradeCategory = sanitize(tradeCategory || '');

    // Authorize: User must be the customer making the request
    if (user.email !== customerEmail) {
      return Response.json({ error: 'Forbidden: You can only submit quote requests for yourself' }, { status: 403 });
    }

    // Create QuoteRequest record in database
    const quoteRequest = await base44.asServiceRole.entities.QuoteRequest.create({
      contractor_id: contractorId,
      contractor_name: safeContractorName,
      contractor_email: contractorEmail,
      customer_email: customerEmail,
      customer_name: safeCustomerName,
      job_title: safeJobTitle,
      work_description: safeDescription,
      status: 'pending',
      read_by_contractor: false,
      created_at: new Date().toISOString()
    });

    // Send email to contractor
    try {
      const photoText = photos && photos.length > 0
        ? `\n\nPhotos Attached: ${photos.length}\nCustomer provided photos for reference.\n\nProject Details:\n${description}`
        : `\n\nProject Details:\n${description}`;

      const emailBody = `Hello ${safeContractorName},

You have received a new quote request from a customer!

CUSTOMER INFORMATION:
Name: ${safeCustomerName}
Email: ${customerEmail}

PROJECT DETAILS:
Title: ${safeJobTitle}
Trade: ${safeTradeCategory}
${safeBudget ? `Budget: ${safeBudget}` : ''}
${safeTimeline ? `Timeline: ${safeTimeline}` : ''}

${photoText}

Please review this request and contact the customer directly to discuss and provide a quote.

Quote Request ID: ${quoteRequest.id}

---
SurfCoast Marketplace
`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: contractorEmail,
        from_name: 'SurfCoast Marketplace',
        subject: `New Quote Request: ${jobTitle}`,
        body: emailBody
      });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
      // Don't fail the submission if email fails
    }

    // Send confirmation email to customer
    try {
      const customerEmailBody = `Hello ${safeCustomerName},

Thank you for submitting your quote request on SurfCoast Marketplace!

We've sent your project details and photos to ${safeContractorName}. They will review your request and contact you directly within 24-48 hours to discuss your project and provide a quote.

PROJECT SUMMARY:
Title: ${safeJobTitle}
Contractor: ${safeContractorName}
Quote Request ID: ${quoteRequest.id}

In the meantime, you can:
- Review other contractors on our platform
- Post additional projects
- Track all your quote requests from your dashboard

If you don't hear back within 48 hours, feel free to reach out to another contractor or contact our support team.

Best regards,
SurfCoast Marketplace Team
`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customerEmail,
        from_name: 'SurfCoast Marketplace',
        subject: `Quote Request Confirmation: ${jobTitle}`,
        body: customerEmailBody
      });
    } catch (emailErr) {
      console.error('Customer confirmation email failed:', emailErr);
    }

    return Response.json({
      success: true,
      quoteRequestId: quoteRequest.id,
      message: 'Quote request submitted successfully'
    });
  } catch (error) {
    console.error('Submit quote request error:', error);
    return Response.json({ error: error.message || 'Failed to submit quote request' }, { status: 500 });
  }
});