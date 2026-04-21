import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Tracks user signup journey progress.
 * Called from frontend signup pages at each step/event.
 * Uses service role to write — no auth required (public signup pages).
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const {
      email,
      signup_type,     // entrepreneur | client | farmers_market_vendor | swap_meet_vendor
      event,           // started | step_advanced | step_completed | field_saved | profile_created | abandoned | error
      step,
      step_name,
      fields_completed = [],
      fields_missing = [],
      extra_data = {},  // any additional context
    } = payload;

    if (!email || !signup_type || !event) {
      return Response.json({ error: 'Missing required fields: email, signup_type, event' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Look for existing journey record for this email + signup_type
    const existing = await base44.asServiceRole.entities.UserSignupJourney.filter({
      email,
      signup_type,
    });

    const journey = existing && existing.length > 0 ? existing[0] : null;

    // Build the event entry
    const eventEntry = {
      event,
      step: step ?? null,
      step_name: step_name ?? null,
      timestamp: now,
      data: extra_data,
    };

    // Determine status
    let status = journey?.status ?? 'started';
    if (event === 'profile_created') status = 'completed';
    else if (event === 'abandoned') status = 'abandoned';
    else if (event === 'step_advanced' || event === 'field_saved') status = 'in_progress';

    // Compute completion percent
    const totalSteps = extra_data.total_steps ?? journey?.total_steps ?? 5;
    const currentStep = step ?? journey?.current_step ?? 1;
    const completionPercent = event === 'profile_created'
      ? 100
      : Math.min(99, Math.round((currentStep / totalSteps) * 100));

    if (!journey) {
      // Create new journey record
      await base44.asServiceRole.entities.UserSignupJourney.create({
        email,
        signup_type,
        status,
        current_step: currentStep,
        total_steps: totalSteps,
        last_step_name: step_name ?? null,
        completion_percent: completionPercent,
        fields_completed,
        fields_missing,
        started_at: now,
        last_activity_at: now,
        completed_at: event === 'profile_created' ? now : null,
        abandoned_at: event === 'abandoned' ? now : null,
        name: extra_data.name ?? null,
        phone: extra_data.phone ?? null,
        location: extra_data.location ?? null,
        line_of_work: extra_data.line_of_work ?? null,
        contractor_type: extra_data.contractor_type ?? null,
        shop_name: extra_data.shop_name ?? null,
        shop_type: extra_data.shop_type ?? null,
        has_id_document: extra_data.has_id_document ?? false,
        has_face_photo: extra_data.has_face_photo ?? false,
        has_credentials: extra_data.has_credentials ?? false,
        compliance_acknowledged: extra_data.compliance_acknowledged ?? false,
        is_minor: extra_data.is_minor ?? false,
        profile_created: event === 'profile_created',
        drop_off_reason: extra_data.drop_off_reason ?? null,
        events: [eventEntry],
      });
    } else {
      // Update existing journey record
      const updatedEvents = [...(journey.events ?? []), eventEntry];

      const updates = {
        status,
        last_activity_at: now,
        current_step: currentStep,
        last_step_name: step_name ?? journey.last_step_name,
        completion_percent: completionPercent,
        events: updatedEvents,
        fields_completed: fields_completed.length > 0 ? fields_completed : journey.fields_completed,
        fields_missing: fields_missing.length > 0 ? fields_missing : journey.fields_missing,
      };

      if (event === 'profile_created') {
        updates.completed_at = now;
        updates.profile_created = true;
        updates.completion_percent = 100;
      }
      if (event === 'abandoned') {
        updates.abandoned_at = now;
      }

      // Merge in any extra_data fields that were provided
      if (extra_data.name) updates.name = extra_data.name;
      if (extra_data.phone) updates.phone = extra_data.phone;
      if (extra_data.location) updates.location = extra_data.location;
      if (extra_data.line_of_work) updates.line_of_work = extra_data.line_of_work;
      if (extra_data.contractor_type) updates.contractor_type = extra_data.contractor_type;
      if (extra_data.shop_name) updates.shop_name = extra_data.shop_name;
      if (extra_data.has_id_document !== undefined) updates.has_id_document = extra_data.has_id_document;
      if (extra_data.has_face_photo !== undefined) updates.has_face_photo = extra_data.has_face_photo;
      if (extra_data.has_credentials !== undefined) updates.has_credentials = extra_data.has_credentials;
      if (extra_data.compliance_acknowledged !== undefined) updates.compliance_acknowledged = extra_data.compliance_acknowledged;
      if (extra_data.is_minor !== undefined) updates.is_minor = extra_data.is_minor;
      if (extra_data.drop_off_reason) updates.drop_off_reason = extra_data.drop_off_reason;

      await base44.asServiceRole.entities.UserSignupJourney.update(journey.id, updates);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('trackSignupJourney error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});