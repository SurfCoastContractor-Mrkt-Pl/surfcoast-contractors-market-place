import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth: must be authenticated admin or the contractor themselves
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'Missing contractor_id' }, { status: 400 });
    }

    // Get contractor data
    const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Authorization: only admin or the contractor themselves can generate agreements
    if (user.role !== 'admin' && user.email !== contractor.email) {
      return Response.json({ error: 'Forbidden: Cannot generate agreements for other contractors' }, { status: 403 });
    }

    // Get Google Docs connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledocs');

    // Create document
    const docResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Service Agreement - ${contractor.name}`,
      }),
    });

    if (!docResponse.ok) {
      const error = await docResponse.text();
      console.error('Google Docs API error:', error);
      return Response.json({ error: 'Failed to create document' }, { status: 500 });
    }

    const doc = await docResponse.json();
    const docId = doc.documentId;

    // Prepare agreement content
    const agreementContent = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}, between:

CONTRACTOR INFORMATION:
Name: ${contractor.name || '[Name]'}
Email: ${contractor.email || '[Email]'}
Phone: ${contractor.phone || '[Phone]'}
Location: ${contractor.location || '[Location]'}
License/Trade: ${contractor.trade_specialty || contractor.line_of_work || '[Trade]'}
Years of Experience: ${contractor.years_experience || '[Years]'}

TERMS OF SERVICE:

1. SCOPE OF WORK
The Contractor agrees to provide services as detailed in individual project agreements and scope of work documents.

2. RATES AND PAYMENT
${contractor.rate_type === 'hourly' 
  ? `Hourly Rate: $${contractor.hourly_rate || '[Amount]'}/hour` 
  : `Fixed Rate: $${contractor.fixed_rate || '[Amount]'}\nScope: ${contractor.fixed_rate_details || '[Details]'}`}

3. INDEPENDENT CONTRACTOR STATUS
The Contractor is an independent contractor and not an employee of SurfCoast Marketplace.

4. LIABILITY AND INSURANCE
The Contractor is responsible for maintaining appropriate liability insurance and compliance with all applicable trade licenses and local regulations.

5. PLATFORM FEES
SurfCoast Marketplace charges a facilitation fee on completed projects as detailed in the pricing terms.

6. CODE OF CONDUCT
The Contractor agrees to:
- Maintain professional conduct with customers
- Complete work in a timely manner
- Provide quality workmanship
- Respect customer property
- Not solicit customers for off-platform transactions

7. DISPUTE RESOLUTION
Any disputes shall be resolved through SurfCoast Marketplace's dispute resolution process.

8. COMPLIANCE
The Contractor certifies they hold all necessary licenses and comply with federal, state, and local regulations for their trade.

CONTRACTOR SIGNATURE & DATE:

_________________________     __________
Signature                       Date


ACKNOWLEDGMENT:
By signing this agreement, the Contractor acknowledges they have read and agree to all terms.`;

    // Update document with content using batch update
    const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: agreementContent,
              location: { index: 1 },
            },
          },
          {
            updateTextStyle: {
              range: { startIndex: 0, endIndex: agreementContent.length + 1 },
              textStyle: {
                fontSize: { magnitude: 11, unit: 'PT' },
                fontFamily: 'Arial',
              },
              fields: 'fontSize,fontFamily',
            },
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('Failed to update document:', error);
      return Response.json({ error: 'Failed to populate document' }, { status: 500 });
    }

    // Share document with contractor
    const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: contractor.email,
      }),
    });

    if (!shareResponse.ok) {
      console.warn('Failed to share document with contractor, but document was created');
    }

    // Get shareable link
    const docLink = `https://docs.google.com/document/d/${docId}/edit`;

    // Send email to contractor
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: contractor.email,
      subject: `Your Service Agreement - ${contractor.name}`,
      body: `Hi ${contractor.name},\n\nYour service agreement has been generated and is ready for your review and signature.\n\nOpen your agreement: ${docLink}\n\nYou can edit and sign this document directly in Google Docs. Please review all terms carefully.\n\nBest regards,\nSurfCoast Marketplace`,
      from_name: 'SurfCoast Marketplace',
    });

    return Response.json({
      success: true,
      document_id: docId,
      document_link: docLink,
      contractor_email: contractor.email,
    });
  } catch (error) {
    console.error('Error generating agreement:', error);
    return Response.json({ error: error.message || 'Failed to generate agreement' }, { status: 500 });
  }
});