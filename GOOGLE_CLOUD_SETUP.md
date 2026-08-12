# Google Cloud Setup for Google Sheets API

Follow these steps to set up Google Cloud for the Google Sheets action:

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "zapier-automation")
5. Click "CREATE"

## Step 2: Enable Google Sheets API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click "ENABLE"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS"
3. Select "Service account"
4. Fill in the service account details:
   - **Name**: `zapier-worker`
   - **Service account ID**: Auto-generated (e.g., `zapier-worker@your-project-id.iam.gserviceaccount.com`)
   - **Description**: "Service account for Zapier automation"
5. Click "CREATE AND CONTINUE"
6. Skip the permissions steps (click "DONE")

## Step 4: Generate Service Account Key

1. In the Credentials page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "ADD KEY" > "Create new key"
5. Select "JSON" as the key type
6. Click "CREATE"
7. **Important**: The JSON file will download automatically. Save it securely - you'll need it for the next steps.

## Step 5: Extract Credentials from JSON

Open the downloaded JSON file and note these values:
- `client_email`: The service account email address
- `private_key`: The private key (starts with `-----BEGIN PRIVATE KEY-----`)
- `project_id`: Your Google Cloud project ID
- `client_id`: The client ID

## Step 6: Set Environment Variables

Add these environment variables to your `.env` file:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_ID=your-client-id
```

**Important**: For the private key, replace actual newlines with `\n` and wrap the entire string in quotes.

## Step 7: Share Your Google Sheet

1. Open the Google Sheet you want to update
2. Click "Share" at the top right
3. Enter the service account email (from Step 5)
4. Set permission to "Editor"
5. Click "Send"

## Step 8: Get Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`
3. Copy the `YOUR_SPREADSHEET_ID` part (the long string between `/d/` and `/edit`)

## Step 9: Test the Setup

1. Run `npm install` in the `apps/worker` directory to install the new dependencies
2. Restart your worker
3. Create a zap with the Google Sheets action using the metadata format:
   ```json
   {
     "spreadsheetId": "your-sheet-id",
     "range": "Sheet1!A1",
     "name": "{recipient.name}"
   }
   ```
4. Trigger the zap and check if the row is appended to your Google Sheet

## Troubleshooting

**Error: "The caller does not have permission"**
- Make sure you shared the Google Sheet with the service account email
- Verify the service account has "Editor" permissions

**Error: "Invalid credentials"**
- Check that the private key is correctly formatted with `\n` for line breaks
- Ensure the private key is wrapped in quotes in the .env file

**Error: "Spreadsheet not found"**
- Verify the spreadsheet ID is correct
- Check that the sheet is shared with the service account

## Security Notes

- Never commit the service account JSON file to version control
- Add the JSON file to your `.gitignore`
- Rotate the service account key if it's ever compromised
- Consider using Google Secret Manager for production deployments
