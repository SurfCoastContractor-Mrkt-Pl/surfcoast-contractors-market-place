import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Validates that a user has permission to access an entity based on RLS rules
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { entityName, entityId, operation } = payload;

    if (!entityName || !entityId || !operation) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate operation is allowed
    if (!['read', 'update', 'delete'].includes(operation)) {
      return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Fetch the entity
    let entity;
    try {
      entity = await base44.entities[entityName].get(entityId);
    } catch (e) {
      return Response.json({ allowed: false, reason: 'Entity not found' }, { status: 404 });
    }

    if (!entity) {
      return Response.json({ allowed: false, reason: 'Entity not found' }, { status: 404 });
    }

    // Check common RLS patterns
    let allowed = false;

    // Pattern 1: User email matches entity field
    if (entity.email === user.email || entity.contractor_email === user.email || entity.customer_email === user.email) {
      allowed = true;
    }

    // Pattern 2: User is admin
    if (user.role === 'admin') {
      allowed = true;
    }

    // Pattern 3: User created the entity
    if (entity.created_by === user.email) {
      allowed = true;
    }

    // Pattern 4: User is sender/recipient of messages
    if ((entity.sender_email === user.email || entity.recipient_email === user.email) && operation === 'read') {
      allowed = true;
    }

    // Log audit
    console.log(`[RLS Audit] User: ${user.email}, Entity: ${entityName}/${entityId}, Operation: ${operation}, Allowed: ${allowed}`);

    return Response.json({
      allowed,
      user: user.email,
      role: user.role,
      entity: entityName,
      operation
    });
  } catch (error) {
    console.error('[rlsAuditValidator] Error:', error.message);
    return Response.json({ error: 'RLS validation failed', details: error.message }, { status: 500 });
  }
});