# Add Google Sheets Action

This plan outlines how to add a Google Sheets action to the Zapier-like automation system, allowing users to update Google Sheets as an action step.

## Current System Analysis

The current action system works as follows:
- Actions are stored in `AvailableActions` table in database (seeded in `packages/db/seed.ts`)
- Each action has a unique UUID ID and metadata
- Worker processes actions by checking `currentAction.type.id` in `apps/worker/src/index.ts`
- Email action uses ID `9e44178d-d37c-4007-86eb-cf71c83d8d09`
- Action metadata is parsed using the parser to replace template variables

## Google Sheets API Requirements

To implement Google Sheets integration, you'll need:

### Credentials Required:
1. **Google Cloud Project** - Create a project in Google Cloud Console
2. **Service Account** - Create a service account for server-to-server authentication
3. **Service Account JSON Key** - Download JSON file containing:
   - `type`: "service_account"
   - `project_id`: Your Google Cloud project ID
   - `private_key_id`: Key identifier
   - `private_key`: The actual private key
   - `client_email`: Service account email (e.g., `your-app@project-id.iam.gserviceaccount.com`)
   - `client_id`: Client identifier

### Setup Steps:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create Service Account with appropriate name
3. Generate and download JSON key file
4. Enable Google Sheets API for your project
5. **Important**: Share your target Google Sheet with the service account email address

### Environment Variables Needed:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Private key from JSON file
- `GOOGLE_PROJECT_ID`: Project ID from JSON file
- `GOOGLE_CLIENT_ID`: Client ID from JSON file

### API Scopes:
- `https://www.googleapis.com/auth/spreadsheets` - Full access to spreadsheets

## Implementation Plan

### 1. Database Changes
- Add "Update Google Sheet" action to `packages/db/seed.ts`
- Generate new UUID for the action
- Add appropriate icon/image URL

### 2. Backend Implementation
- Create `apps/worker/src/google-sheets.ts` with functions to:
  - Authenticate using service account credentials
  - Update Google Sheets using Google Sheets API
- Install required npm packages:
  - `googleapis` - Google API client library
  - `google-auth-library` - Authentication library
- Add Google Sheets action handler to `apps/worker/src/index.ts`
- Use new action UUID to identify Google Sheets actions

### 3. Action Metadata Structure
The Google Sheets action metadata should support:
```json
{
  "spreadsheetId": "your-sheet-id",
  "range": "Sheet1!A1",
  "values": [
    ["{recipient.name}", "{recipient.email}", "new data"]
  ]
}
```

### 4. Frontend Updates
- Update `apps/frontend/app/zap/create/page.tsx` to include Google Sheets in examples
- Add UI guidance for users to provide spreadsheet ID and range

## Questions for User

1. Do you want to append rows to the sheet or update specific cells?
2. Should the action support multiple sheets or just one per action?
3. Do you have a Google Cloud project set up already, or do you need guidance on creating one?
4. What specific data from the hooks payload do you want to write to Google Sheets?
