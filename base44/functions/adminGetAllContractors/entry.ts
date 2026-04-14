import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Contractor.list('-created_date', 500);

    // Include anyone with identity docs OR already verified OR requested review
    const filtered = (all || []).filter(c =>
      c.admin_review_requested === true ||
      c.identity_verified === true ||
      (c.id_document_url && c.id_document_url.trim() !== '') ||
      (c.face_photo_url && c.face_photo_url.trim() !== '')
    );

    // Generate signed URLs for private file URIs so admin can view them
    const withSignedUrls = await Promise.all(filtered.map(async (c) => {
      const updates = {};

      if (c.id_document_url && c.id_document_url.startsWith('private://')) {
        try {
          const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: c.id_document_url, expires_in: 900 });
          updates.id_document_url_signed = res.signed_url;
        } catch (e) {
          console.error('Failed to sign id_document_url for', c.id, e.message);
        }
      }

      if (c.face_photo_url && c.face_photo_url.startsWith('private://')) {
        try {
          const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: c.face_photo_url, expires_in: 900 });
          updates.face_photo_url_signed = res.signed_url;
        } catch (e) {
          console.error('Failed to sign face_photo_url for', c.id, e.message);
        }
      }

      return { ...c, ...updates };
    }));

    return Response.json({ contractors: withSignedUrls });
  } catch (error) {
    console.error('adminGetAllContractors error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});