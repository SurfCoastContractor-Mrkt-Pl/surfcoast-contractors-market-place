# HubSpot & Notion Integration Setup Checklist

## What's Now Automated
✅ When a scope of work is **approved**, it automatically syncs to HubSpot as a deal
✅ When a contractor profile is **created**, it automatically syncs to HubSpot as a contact
✅ Manual sync buttons available in WAVE Premium tier for on-demand syncing

---

## What YOU Need to Do

### 1. **Register App User Connectors** (REQUIRED)
Currently, HubSpot and Notion are set up as shared connectors (your account only). For WAVE Premium subscribers to connect their own accounts, you need to register app user connectors:

**For HubSpot:**
- Go to your HubSpot account → Settings → Apps & Integrations → Private Apps
- Create a private app with scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.deals.read`
  - `crm.objects.deals.write`
- Copy the **Client ID** and **Client Secret**
- Use the Base44 tool: `set_app_user_connector` with `integration_type: 'hubspot'`

**For Notion:**
- Go to https://www.notion.so/my-integrations
- Create a new integration
- Copy the **Client ID** and **Client Secret**
- Grant these capabilities:
  - Read content
  - Update content
  - Create pages in databases
- Use the Base44 tool: `set_app_user_connector` with `integration_type: 'notion'`

### 2. **Backend Functions Already Exist**
The following functions are ready to use:
- `syncToHubSpot()` - Syncs contractors and deals
- `syncToNotion()` - Creates project pages
- `syncJobToHubSpot()` - Syncs individual jobs to HubSpot

### 3. **UI Component Added**
- New `HubSpotNotionSyncPanel.jsx` component added
- Shows connection status
- Provides manual sync buttons
- Restricted to WAVE Premium tier only

### 4. **Automations Now Active**
Two automations are running:
1. **Scope Approval → HubSpot**: When a scope status changes to "approved", it syncs to HubSpot
2. **Contractor Created → HubSpot**: When a new contractor signs up, they're added to HubSpot

---

## Testing the Integration

1. **Test HubSpot Sync:**
   - Create a new contractor profile
   - Check HubSpot Contacts to verify contractor was added
   - Approve a scope of work
   - Check HubSpot Deals to verify deal was created

2. **Test Notion Sync:**
   - Open a WAVE Premium project/scope
   - Click "Create in Notion" button
   - Verify page appears in your Notion workspace

---

## Optional Enhancements

- Add webhook handlers for real-time bidirectional sync
- Create custom mapping for HubSpot custom fields
- Add Notion database templates for project tracking
- Implement sync history/audit logs
- Add bulk sync capabilities for historical data

---

## Troubleshooting

**"Connector not found" error:**
- App user connectors must be registered first (see step 1)

**"Notion page not created" error:**
- Verify `NOTION_PROJECT_PARENT_PAGE_ID` is set (it's in your secrets)
- Check that your Notion integration has page creation permissions

**"HubSpot sync failed" error:**
- Verify HubSpot API rate limits haven't been exceeded
- Check that contact/deal properties match your HubSpot setup