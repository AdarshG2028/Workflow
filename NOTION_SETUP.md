# Notion Setup for Notion API Integration

Follow these steps to set up Notion for the Notion append action:

## Step 1: Create Notion Account

1. Go to [Notion](https://www.notion.so/)
2. Click "Sign up" (free account)
3. Create your account using email or Google account
4. A workspace will be automatically created for you

## Step 2: Create Notion Integration

1. Go to [Notion Developer Portal](https://www.notion.so/my-integrations)
2. Click "New integration" or "+ Create new integration"
3. Fill in the integration details:
   - **Name**: "Zapier Automation"
   - **Associated workspace**: Select your workspace
   - **Type**: Internal
   - **Capabilities**: 
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
4. Click "Submit"
5. **Important**: Copy the "Internal Integration Token" from the Configuration tab
   - This token starts with `secret_`
   - Keep it secure - you'll need it for environment variables

## Step 3: Create a Notion Page

1. In your Notion workspace, create a new page where you want to append content
2. Give it a descriptive name (e.g., "Automation Logs")
3. Leave it empty or add some initial content

## Step 4: Share Page with Integration

1. Open the page you created in Step 3
2. Click "Share" at the top right
3. Click "Add people, emails, groups..."
4. Search for your integration name ("Zapier Automation")
5. Select it and click "Invite"
6. The integration now has access to this page

## Step 5: Get Page ID

1. Open your Notion page in a browser
2. Look at the URL: `https://www.notion.so/your-workspace/Page-Title-PAGE_ID?v=...`
3. Copy the `PAGE_ID` (32-character string after the title and before `?v=`)
4. Example: If URL is `https://www.notion.so/workspace/My-Page-abc123def456?v=...`, then `abc123def456` is your page ID

## Step 6: Set Environment Variables

Add these environment variables to your `.env` file:

```env
NOTION_TOKEN=secret_your_integration_token_here
NOTION_PAGE_ID=your_page_id_here
```

**Important**: 
- The token starts with `secret_`
- The page ID is the 32-character string from the URL
- Keep both values secure and never commit them to version control

## Step 7: Install Dependencies

Run the following command in the `apps/worker` directory:

```bash
npm install
```

This will install the `@notionhq/client` package.

## Step 8: Run Database Seed

Run the database seed to add the Notion action:

```bash
cd packages/db
npm run seed
```

## Step 9: Test the Setup

1. Restart your worker
2. Create a zap with the Notion action using the metadata format:
   ```json
   {
     "pageId": "your-page-id",
     "content": "Thanks {recipient.name} for testing my automation system"
   }
   ```
3. Trigger the zap with a webhook payload:
   ```json
   {
     "recipient": {
       "name": "John"
     }
   }
   ```
4. Check your Notion page - you should see:
   - "Thanks John for testing my automation system (Timestamp: 2026-07-11T...)"

## How It Works

The Notion action:
1. Takes the `content` from metadata
2. Replaces template variables (like `{recipient.name}`) with actual values from webhook payload
3. Appends the content as a paragraph block to your Notion page
4. Automatically adds a timestamp for reference

## Troubleshooting

**Error: "API token invalid"**
- Verify the token starts with `secret_`
- Check that the token is correctly copied from the integration configuration
- Ensure the token is set in the `NOTION_TOKEN` environment variable

**Error: "Could not find page"**
- Verify the page ID is correct (32 characters)
- Check that you shared the page with the integration
- Ensure the page exists in your workspace

**Error: "Integration does not have access"**
- Make sure you shared the specific page with the integration
- Check that the integration has the correct capabilities (Read, Update, Insert)
- Verify you're using the correct workspace

**No content appearing in Notion**
- Check the worker logs for any errors
- Verify the webhook payload contains the expected data
- Ensure template variables in metadata match the payload structure

## Security Notes

- Never share your integration token
- Add `.env` to your `.gitignore` file
- If a token is compromised, refresh it from the Notion Developer Portal
- Consider using a secret manager for production deployments
- The integration only has access to pages you explicitly share with it

## Advantages Over Google Sheets

- **No credit card required** - Completely free
- **Simple setup** - No billing account needed
- **Static token** - No OAuth flow required
- **Generous rate limits** - Suitable for most automation needs
- **Rich formatting** - Supports various block types (paragraphs, lists, etc.)

## Next Steps

Once set up, you can:
- Create multiple zaps with different Notion pages
- Use template variables to personalize content
- Combine Notion with other actions (Email, Google Sheets)
- Build complex automation workflows
