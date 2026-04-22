import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';
import Stripe from 'npm:stripe@16.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const isAutomation = !!body.event;
    let scope_id = body.scope_id;

    if (isAutomation) {
      // Extract from automation event payload
      scope_id = body.event?.entity_id;
      console.log('[generateInvoicePDF] Automation payload:', JSON.stringify({ scope_id, event_type: body.event?.type }));
    } else {
      // Direct call — require admin or authenticated user
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    if (!scope_id) {
      console.error('[generateInvoicePDF] Missing scope_id. body.event:', JSON.stringify(body.event));
      return Response.json({ error: 'scope_id is required' }, { status: 400 });
    }

    // Fetch scope using service role (works in automations without user session)
    const scopeData = body.data || await base44.asServiceRole.entities.ScopeOfWork.get(scope_id);

    if (!scopeData) {
      return Response.json({ error: 'Scope of work not found' }, { status: 404 });
    }

    if (scopeData.status !== 'closed') {
      return Response.json({ success: true, message: 'Job not yet closed, skipping invoice generation' });
    }

    // Calculate total amount
    const totalAmount = scopeData.cost_type === 'hourly' 
      ? (scopeData.cost_amount * (scopeData.estimated_hours || 0))
      : scopeData.cost_amount;

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('INVOICE', margin, yPos);
    yPos += 15;

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const invoiceDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Date: ${invoiceDate}`, margin, yPos);
    yPos += 6;
    doc.text(`Invoice ID: ${scope_id.substring(0, 8).toUpperCase()}`, margin, yPos);
    yPos += 12;

    // Customer section
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('BILL TO:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(scopeData.customer_name, margin, yPos);
    yPos += 5;
    doc.setTextColor(100, 100, 100);
    doc.text(scopeData.customer_email, margin, yPos);
    yPos += 12;

    // Contractor section
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('FROM:', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(scopeData.contractor_name, margin, yPos);
    yPos += 5;
    doc.setTextColor(100, 100, 100);
    doc.text(scopeData.contractor_email, margin, yPos);
    yPos += 15;

    // Job details
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('JOB DETAILS:', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Job: ${scopeData.job_title}`, margin, yPos);
    yPos += 5;
    
    if (scopeData.agreed_work_date) {
      doc.text(`Work Date: ${new Date(scopeData.agreed_work_date).toLocaleDateString('en-US')}`, margin, yPos);
      yPos += 5;
    }

    doc.text(`Description: ${scopeData.scope_summary || 'N/A'}`, margin, yPos, { maxWidth: pageWidth - 2 * margin });
    yPos += 20;

    // Line items table
    const tableTop = yPos;
    const colWidth = (pageWidth - 2 * margin) / 3;
    const rowHeight = 8;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    
    doc.text('Description', margin + 2, tableTop + 6);
    doc.text('Rate', margin + colWidth + 2, tableTop + 6);
    doc.text('Amount', margin + 2 * colWidth + 2, tableTop + 6);
    
    yPos = tableTop + rowHeight;

    // Table divider
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 2;

    // Table row
    const description = scopeData.cost_type === 'hourly'
      ? `Labor (${scopeData.estimated_hours} hours @ $${scopeData.cost_amount.toFixed(2)}/hr)`
      : 'Scope of Work';

    doc.setTextColor(100, 100, 100);
    doc.text(description, margin + 2, yPos + 6);
    doc.text(`$${scopeData.cost_amount.toFixed(2)}`, margin + colWidth + 2, yPos + 6);
    doc.text(`$${totalAmount.toFixed(2)}`, margin + 2 * colWidth + 2, yPos + 6);
    
    yPos += rowHeight;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Total
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, margin + 2 * colWidth - 20, yPos);

    yPos += 15;
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business. SurfCoast Contractor Market Place', margin, pageHeight - 10, { align: 'center' });

    // Save PDF
    const pdfBytes = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Upload PDF
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
    const pdfUrl = uploadResult.file_url;

    // Create Stripe checkout session for invoice payment
    let paymentLink = null;
    try {
      function initializeStripe() {
        const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
          throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
        }
        return new Stripe(secretKey);
      }
      const stripe = initializeStripe();
      const amountInCents = Math.round(totalAmount * 100);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: scopeData.job_title,
                description: `Invoice for completed work by ${scopeData.contractor_name}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: scopeData.customer_email,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          scope_id: scope_id,
          contractor_email: scopeData.contractor_email,
        },
        success_url: `${Deno.env.get('APP_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Deno.env.get('APP_URL')}/cancel`,
      });
      
      paymentLink = session.url;
      console.log(`Stripe session created: ${session.id}`);
    } catch (stripeError) {
      console.error('Stripe checkout creation error:', stripeError.message);
      // Continue with email even if Stripe fails
    }

    // Send email to client with payment link
    const paymentSection = paymentLink 
      ? `\n\nPay your invoice now: ${paymentLink}\n\nYour payment is secured by Stripe.`
      : '';
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scopeData.customer_email,
      subject: `Invoice for ${scopeData.job_title} - ${invoiceDate}`,
      body: `Hello ${scopeData.customer_name},\n\nThank you for using SurfCoast! Your job with ${scopeData.contractor_name} is now complete.\n\nYour invoice is attached. Please review it and ensure all work meets your expectations.${paymentSection}\n\nIf you have any questions, please contact us.\n\nBest regards,\nSurfCoast Contractor Market Place`,
    });

    // Send email to contractor
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scopeData.contractor_email,
      subject: `Invoice Generated for ${scopeData.job_title} - ${invoiceDate}`,
      body: `Hello ${scopeData.contractor_name},\n\nYour job "${scopeData.job_title}" has been marked as complete. Your invoice has been generated and sent to the client.\n\nInvoice Details:\n- Client: ${scopeData.customer_name}\n- Total Amount: $${totalAmount.toFixed(2)}\n- Date: ${invoiceDate}\n\nThank you for your work!\n\nSurfCoast Contractor Market Place`,
    });

    console.log(`Invoice generated and sent for scope: ${scope_id}`);

    return Response.json({ 
      success: true, 
      pdfUrl,
      invoiceAmount: totalAmount,
      invoiceId: scope_id.substring(0, 8).toUpperCase(),
      paymentLink: paymentLink || null
    });
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});