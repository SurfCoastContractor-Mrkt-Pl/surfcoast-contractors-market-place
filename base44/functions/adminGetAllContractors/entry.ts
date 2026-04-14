import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Contractor.list('-created_date', 500);

    const filtered = (all || []).filter(c =>
      c.admin_review_requested === true ||
      (c.id_document_url && c.id_document_url.trim() !== '') ||
      (c.face_photo_url && c.face_photo_url.trim() !== '')
    );

    return Response.json({ contractors: filtered });
  } catch (error) {
    console.error('adminGetAllContractors error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});