import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scopeId, contractorName, clientName, jobTitle, amount } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledocs');

    // Create a new Google Doc from a template
    const docResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Contract - ${jobTitle} (${contractorName})`,
      }),
    });

    if (!docResponse.ok) {
      const error = await docResponse.text();
      console.error('Google Docs creation failed:', error);
      return Response.json({ error: 'Document creation failed' }, { status: 400 });
    }

    const doc = await docResponse.json();
    const docId = doc.documentId;

    // Insert contract content
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
              text: `SERVICE AGREEMENT\n\nThis Agreement is entered into as of ${new Date().toLocaleDateString()} between:\n\nCONTRACTOR: ${contractorName}\n\nCLIENT: ${clientName}\n\nSCOPE OF WORK:\n${jobTitle}\n\nCOMPENSATION:\n$${amount}\n\nTERMS:\nThe Contractor agrees to complete the above work as specified. Payment is due upon satisfactory completion of all work.\n\nEITHER PARTY MAY ELECTRONICALLY SIGN BELOW TO ACCEPT THESE TERMS:\n\nContractor Signature: ___________________  Date: ___________\n\nClient Signature: ___________________  Date: ___________`,
              location: { index: 1 },
            },
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      console.error('Document update failed:', await updateResponse.text());
      return Response.json({ error: 'Document update failed' }, { status: 400 });
    }

    // Generate shareable link
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

    console.log(`Contract document created for scope ${scopeId}:`, docUrl);
    return Response.json({ success: true, documentId: docId, documentUrl: docUrl });
  } catch (error) {
    console.error('Contract creation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});