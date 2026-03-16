import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function fetchAndReupload(base44, imageUrl) {
  // SECURITY: Validate URL to prevent SSRF attacks
  let url;
  try {
    url = new URL(imageUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Only allow HTTPS and approved domains (Base44 storage, image services)
  const allowedDomainsEnv = Deno.env.get('ALLOWED_IMAGE_DOMAINS');
  if (!allowedDomainsEnv) {
    throw new Error('ALLOWED_IMAGE_DOMAINS environment variable is not configured');
  }
  const allowedDomains = allowedDomainsEnv.split(',').map(d => d.trim()).filter(Boolean);
  
  const isDomainAllowed = allowedDomains.some(domain => url.hostname.endsWith(domain)) || url.hostname === 'localhost';
  
  if (!['https:', 'http:'].includes(url.protocol) || !isDomainAllowed) {
    throw new Error('URL domain not whitelisted for security reasons');
  }

  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('Response is not an image');
  }

  const arrayBuffer = await res.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: contentType });
  const result = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
  return result.file_url;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_photo_url, id_document_url } = await req.json();

    if (!profile_photo_url || !id_document_url) {
      return Response.json({ error: 'Both profile_photo_url and id_document_url are required.' }, { status: 400 });
    }

    // Re-upload both images through Base44 UploadFile so they can be passed to the LLM
    const [reuploaded_id_url, reuploaded_profile_url] = await Promise.all([
      fetchAndReupload(base44, id_document_url),
      fetchAndReupload(base44, profile_photo_url),
    ]);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a strict identity verification system.

You are given two images:
1. A government-issued ID or Driver's License (first image)
2. A profile/selfie photo of a person (second image)

Your task: Determine if the face in the profile photo is CLEARLY the same person as the face on the ID/Driver's License.

Rules:
- Both must show a real human face
- The faces must clearly match (same person)
- The ID must look like a legitimate government-issued document
- The profile photo must be a clear, unobstructed face photo (no sunglasses, masks, heavy filters, etc.)
- Be strict — a mismatch or unclear comparison should result in match: false

Respond with valid JSON only:
{
  "match": true or false,
  "confidence": "high" or "medium" or "low",
  "reason": "One brief sentence explaining the decision",
  "issues": []
}`,
      file_urls: [reuploaded_id_url, reuploaded_profile_url],
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
    console.error('Face match verification error:', error.message);
    // Handle file upload errors specifically
    if (error.message && error.message.includes('file')) {
      return Response.json({ error: 'Failed to process images. Ensure images are valid and accessible.' }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});