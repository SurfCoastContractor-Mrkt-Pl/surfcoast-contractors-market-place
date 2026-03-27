# Notion Integration Complete Setup
**Date:** March 27, 2026  
**Status:** ✅ Fully Deployed

---

## Architecture Overview

### 1. **Core Functions**
- `notionProjectDoc` — Universal Notion API handler (create/update pages, link scopes, query databases, etc.)
- `notionPollScheduled` — Daily automation checking for external Notion edits
- `notionAutoSync` — Event-driven auto-sync on ScopeOfWork create/update

### 2. **UI Components**
- `NotionIntegrationPanel` — Main hub with tabs for projects, knowledge base, databases, search
- `NotionConnectionStatus` — Inline widget showing Notion link status for a scope
- `NotionDatabasesTab` — Query and manage Notion database rows
- `NotionSyncTab` — Manual sync controls for admins
- `NotionManageTab` — Archive/update pages
- `NotionRichPageBuilder` — Advanced block creation

### 3. **Automations**
- **ScopeOfWork Notion Auto-Sync:** Triggered on create/update events → calls `notionAutoSync`
- **Notion Sync Poll (Daily):** Runs daily at 3 PM UTC (8 AM PT) → calls `notionPollScheduled`

---

## Workflow: Complete Bidirectional Sync

### ➡️ App → Notion (Automatic)
1. **Scope Created:** `notionAutoSync` fires → Creates new Notion page under parent
2. **Scope Updated:** Auto-sync appends status block to linked page
3. **Daily Poll:** `notionPollScheduled` checks if Notion edits occurred externally

### ⬅️ Notion → App (Manual Check)
1. Users edit Notion page directly
2. Daily poll detects newer `last_edited_time` in Notion
3. Poll logs findings (future: could auto-pull changes via API)

---

## Usage Flows

### For Contractors/Customers
1. **View Notion Status:** `NotionConnectionStatus` widget shows if page exists
2. **Manual Sync:** Click "Refresh" button to push latest data to Notion
3. **Open in Notion:** Click external link to jump to the Notion page

### For Admins
1. **NotionHub Dashboard:** `/NotionHub` page with full control panel
2. **Manual Project Page Creation:** Create pages in "Projects" tab
3. **Knowledge Base Management:** Create/edit compliance articles in "Knowledge Base" tab
4. **Database Queries:** Browse and query Notion database rows
5. **Rich Page Builder:** Create advanced pages with custom block types
6. **Sync Status:** Check what was edited in Notion vs. app

---

## Configuration

### Parent Page IDs
Stored in browser localStorage (configurable in Settings):
- **Project Docs Parent:** `330c3b3d-27dd-8159-a260-fdfc73c2368b`
- **Knowledge Base Parent:** `330c3b3d-27dd-815d-b342-cec5f8bc81d3`

To change, visit NotionHub → click Settings gear icon → update IDs → save

### Schedule
- **Polling:** Daily at 15:00 UTC (8 AM PT)
- **Triggers:** On every ScopeOfWork create/update

---

## Features Included

✅ Auto-create Notion pages for new scopes  
✅ Auto-sync status updates to linked pages  
✅ Daily poll for external Notion edits  
✅ Manual sync controls for admins  
✅ Knowledge base article creation  
✅ Database row queries and creation  
✅ Page search across workspace  
✅ Rich block builder (toggles, code, columns, callouts)  
✅ Inline connection status widget  
✅ Settings panel for configuration  
✅ Full Notion API support (append, update, archive, etc.)  

---

## Entity Linking

When a scope has a linked Notion page:
- `ScopeOfWork.notion_page_url` — Direct link to Notion page
- `ScopeOfWork.notion_page_id` — Programmatic ID for API calls

Manual linking via NotionHub → "Link Scope" tab, or automatic on scope creation.

---

## Next Steps (Optional)
- [ ] Create scheduled job to pull edits FROM Notion back to app
- [ ] Add Notion webhook listener for real-time updates
- [ ] Create database templates for projects/invoices/milestones
- [ ] Add two-way field sync (photos, milestones, messages)