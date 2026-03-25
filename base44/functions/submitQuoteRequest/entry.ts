import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    // Create QuoteRequest record in database
    const quoteRequest = await base44.asServiceRole.entities.QuoteRequest.create({
      contractor_id: contractorId,
      contractor_name: contractorName,
      contractor_email: contractorEmail,
      customer_email: customerEmail,
      customer_name: customerName,
      job_title: jobTitle,
      work_description: description,
      status: 'pending',
      read_by_contractor: false,
      created_at: new Date().toISOString()
    });

    // Send email to contractor
    try {
      const photoText = photos && photos.length > 0
        ? `\n\nPhotos Attached: ${photos.length}\nCustomer provided photos for reference.\n\nProject Details:\n${description}`
        : `\n\nProject Details:\n${description}`;

      const emailBody = `Hello ${contractorName},

You have received a new quote request from a customer!

CUSTOMER INFORMATION:
Name: ${customerName}
Email: ${customerEmail}

PROJECT DETAILS:
Title: ${jobTitle}
Trade: ${tradeCategory}
${budget ? `Budget: ${budget}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}

${photoText}

Please review this request and contact the customer directly to discuss and provide a quote.

Quote Request ID: ${quoteRequest.id}

---
SurfCoast Marketplace
`;

      await base44.integrations.Core.SendEmail({
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
      const customerEmailBody = `Hello ${customerName},

Thank you for submitting your quote request on SurfCoast Marketplace!

We've sent your project details and photos to ${contractorName}. They will review your request and contact you directly within 24-48 hours to discuss your project and provide a quote.

PROJECT SUMMARY:
Title: ${jobTitle}
Contractor: ${contractorName}
Quote Request ID: ${quoteRequest.id}

In the meantime, you can:
- Review other contractors on our platform
- Post additional projects
- Track all your quote requests from your dashboard

If you don't hear back within 48 hours, feel free to reach out to another contractor or contact our support team.

Best regards,
SurfCoast Marketplace Team
`;

      await base44.integrations.Core.SendEmail({
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