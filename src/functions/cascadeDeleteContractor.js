/**
 * Cascade Delete Contractor
 * Safely removes contractor and orphaned records
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { contractor_id, contractor_email } = await req.json();

    if (!contractor_id || !contractor_email) {
      return Response.json({ error: 'contractor_id and contractor_email required' }, { status: 400 });
    }

    let deletedCount = 0;

    // Delete related records in cascade
    const entities = [
      'Equipment',
      'ServiceOffering',
      'AvailabilitySlot',
      'ContractorInventory',
      'ProjectFolder'
    ];

    for (const entity of entities) {
      try {
        const records = await base44.asServiceRole.entities[entity].filter({
          contractor_email: contractor_email
        });

        for (const record of records) {
          await base44.asServiceRole.entities[entity].delete(record.id);
          deletedCount++;
        }
      } catch (error) {
        console.warn(`Failed to delete ${entity} records: ${error.message}`);
      }
    }

    // Delete contractor record
    await base44.asServiceRole.entities.Contractor.delete(contractor_id);
    deletedCount++;

    console.log(`Cascade delete completed: ${deletedCount} records deleted`);

    return Response.json({ 
      success: true,
      contractor_id,
      deleted_count: deletedCount,
      message: `Contractor and ${deletedCount - 1} related records deleted`
    });
  } catch (error) {
    console.error('cascadeDeleteContractor error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});