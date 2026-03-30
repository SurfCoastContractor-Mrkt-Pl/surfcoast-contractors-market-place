import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, level, category, stack, context, url } = body;

    if (!message || !level || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const errorRecord = await base44.asServiceRole.entities.ErrorLog.create({
      message,
      level,
      category,
      stack: stack || null,
      context: context ? JSON.stringify(context) : null,
      user_id: user.id,
      url: url || null,
      resolved: false
    });

    return Response.json({ success: true, id: errorRecord.id });
  } catch (error) {
    console.error('logErrorEvent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});