import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_urls, document_type, extraction_schema } = await req.json();

    if (!file_urls || file_urls.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    const typeGuide = {
      invoice: 'Extract: invoice number, date, amount, vendor name, line items (description, quantity, price)',
      contract: 'Extract: contract type, parties involved, effective date, termination date, key terms, payment terms',
      permit: 'Extract: permit number, issue date, expiration date, property address, work type, inspector notes',
      receipt: 'Extract: receipt number, date, vendor, items purchased with prices, total amount',
      estimate: 'Extract: estimate number, date, scope of work, line items with prices, total estimate amount',
    };

    const prompt = `Analyze the following document(s) and extract structured data.

Document Type: ${document_type || 'general'}
${typeGuide[document_type] ? `Key Fields to Extract: ${typeGuide[document_type]}` : ''}
${extraction_schema ? `Specific Schema: ${JSON.stringify(extraction_schema)}` : ''}

Return ONLY valid JSON with extracted data. If a field is not found, omit it or set to null.
Be accurate with numbers, dates, and names.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls,
      response_json_schema: extraction_schema || {
        type: 'object',
        properties: {
          extracted_fields: { type: 'object' },
          confidence: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    });

    return Response.json({ data: response });
  } catch (error) {
    console.error('Document extraction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});