import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    // Allow unauthenticated (registration flow) — but validate inputs
    const { profile_photo_url, id_document_url } = await req.json();

    if (!profile_photo_url || !id_document_url) {
      return Response.json({ error: 'Both profile_photo_url and id_document_url are required.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a strict identity verification system. 
      
You are given two images:
1. A government-issued ID or Driver's License
2. A profile/selfie photo of a person

Your task: Determine if the face in the profile photo is CLEARLY the same person as the face on the ID/Driver's License.

Rules:
- Both must show a real human face
- The faces must clearly match (same person)
- The ID must look like a legitimate government-issued document
- The profile photo must be a clear, unobstructed face photo (no sunglasses, masks, heavy filters, etc.)
- Be strict — a mismatch or unclear comparison means NOT_MATCH

Respond ONLY with valid JSON in this exact format:
{
  "match": true or false,
  "confidence": "high" | "medium" | "low",
  "reason": "One brief sentence explaining the decision",
  "issues": [] // array of specific issues found, if any (e.g. "face obscured", "ID not visible", "faces do not match", "not a valid ID document")
}`,
      file_urls: [id_document_url, profile_photo_url],
      response_json_schema: {
        type: "object",
        properties: {
          match: { type: "boolean" },
          confidence: { type: "string" },
          reason: { type: "string" },
          issues: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});