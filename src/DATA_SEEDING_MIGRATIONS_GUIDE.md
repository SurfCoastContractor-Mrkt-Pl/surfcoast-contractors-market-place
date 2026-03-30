# Data Seeding & Migrations Guide

## Overview
Complete system for managing database schema changes and safe data seeding with rollback support.

## Components

### 1. Migration System (`lib/migrations.js`)
Manages database schema migrations with tracking and rollback.

**Core Features:**
- Register migrations with up/down functions
- Apply individual or pending migrations
- Rollback with safety checks
- Track migration status and performance

**Usage:**
```javascript
import { migrationManager, createMigration } from '@/lib/migrations';

// Register a migration
migrationManager.register(createMigration(
  'add_contractor_fields',
  async (base44) => {
    // Migration up logic
  },
  async (base44) => {
    // Migration rollback logic
  }
));

// Apply pending migrations
await migrationManager.applyPending();
```

### 2. Seed System (`lib/seedData.js`)
Safe seeding utilities for development/testing data.

**Features:**
- Register named seed functions
- Run individual or all seeds
- Clear entity data
- Batch creation with error handling

**Usage:**
```javascript
import { seedManager, createBulkRecords } from '@/lib/seedData';

// Register a seed
seedManager.register('seed_contractors', async (base44) => {
  return createBulkRecords('Contractor', [
    { name: 'John', email: 'john@example.com', ... },
    { name: 'Jane', email: 'jane@example.com', ... }
  ]);
});

// Run seed
await seedManager.run('seed_contractors');
```

### 3. Migration Entity (`entities/Migration.json`)
Tracks all migrations and their status.

**Status Values:**
- `pending` - Ready to apply
- `applied` - Successfully applied
- `failed` - Failed during application
- `rolled_back` - Rolled back to previous state

### 4. Backend Functions
Secure functions for managing migrations:

**`applyMigration`** - Apply a single migration
**`rollbackMigration`** - Rollback a migration
**`getMigrationStatus`** - Get all migration status
**`applyPendingMigrations`** - Apply all pending migrations

### 5. Admin Dashboard (`pages/DatabaseManagementDashboard.jsx`)
UI for managing migrations and viewing status.

**Features:**
- Migration statistics
- Migration history with status
- Apply/rollback buttons
- Error messages
- Performance metrics

## Setup

### 1. Add Route (in App.jsx)
```jsx
import DatabaseManagementDashboard from './pages/DatabaseManagementDashboard';

<Route path="/admin/database-management" element={
  <LayoutWrapper currentPageName="DatabaseManagementDashboard">
    <DatabaseManagementDashboard />
  </LayoutWrapper>
} />
```

### 2. Register Migrations
Create a migrations file and register all migrations:

```javascript
// migrations/index.js
import { migrationManager } from '@/lib/migrations';

migrationManager.registerMultiple([
  createMigration(
    '001_initial_schema',
    async (base44) => {
      // Create initial entities
    }
  ),
  createMigration(
    '002_add_fields',
    async (base44) => {
      // Add new fields to existing entities
    }
  )
]);
```

### 3. Initialize in App
```jsx
import './migrations';

// In useEffect or on app startup
migrationManager.applyPending();
```

## Migration Best Practices

### Always write both up and down
```javascript
createMigration(
  'add_status_field',
  async (base44) => {
    // Apply: add field to all records
  },
  async (base44) => {
    // Rollback: remove field from all records
  }
)
```

### Track changes
Include meaningful change summaries:
```javascript
migration.changes_summary = "Added status field to Contractor entity"
```

### Test before production
- Test migrations in development database first
- Verify rollback works correctly
- Check performance on large datasets

### Name migrations sequentially
Use timestamps or numbers:
- `001_initial_schema`
- `002_add_contractor_fields`
- `20260330_fix_payment_data`

## Seeding Best Practices

### Use factories for consistency
```javascript
function createContractor(overrides = {}) {
  return {
    name: 'Default Contractor',
    email: 'contractor@example.com',
    location: 'San Diego',
    ...overrides
  };
}

// Use in seed
createBulkRecords('Contractor', [
  createContractor({ name: 'John' }),
  createContractor({ name: 'Jane' })
])
```

### Separate seeds by entity
```javascript
seedManager.registerMultiple({
  seed_contractors: async (base44) => { ... },
  seed_customers: async (base44) => { ... },
  seed_jobs: async (base44) => { ... }
});
```

### Handle relationships
```javascript
// Create contractors first
const contractors = await createBulkRecords('Contractor', [...]);

// Then create jobs with contractor IDs
const jobs = await createBulkRecords('Job', contractors.map(c => ({
  contractor_id: c.id,
  ...
})));
```

### Clear before seeding (if needed)
```javascript
await seedManager.clearEntity('Contractor');
await seedManager.run('seed_contractors');
```

## Safety Features

### Admin-only access
Migrations require admin role

### Idempotent operations
Prevent applying same migration twice

### Error tracking
Failed migrations capture error messages

### Rollback support
Every migration can be rolled back

### Performance tracking
Duration of each migration is logged

## Common Patterns

### Add field to all records
```javascript
async (base44) => {
  const records = await base44.asServiceRole.entities.MyEntity.list();
  for (const record of records) {
    await base44.asServiceRole.entities.MyEntity.update(record.id, {
      newField: 'defaultValue'
    });
  }
}
```

### Remove field from records
```javascript
async (base44) => {
  // Note: Can't directly remove fields, so mark for cleanup
  const records = await base44.asServiceRole.entities.MyEntity.list();
  for (const record of records) {
    const { fieldToRemove, ...rest } = record;
    await base44.asServiceRole.entities.MyEntity.update(record.id, rest);
  }
}
```

## Troubleshooting

**Migration stuck as pending:**
- Check admin dashboard for error messages
- Review function logs for details
- Fix underlying issue and try again

**Rollback failed:**
- Check if migration actually applied
- Verify down function logic
- May require manual intervention

**Performance issues:**
- Process large datasets in batches
- Add indexes before migrations on large tables
- Consider running during off-peak hours

## Next Steps

1. Define initial migrations for existing entities
2. Register and test migrations locally
3. Create development seed data
4. Deploy to staging and verify
5. Document critical migrations for team