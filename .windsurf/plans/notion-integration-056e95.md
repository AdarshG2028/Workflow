# Add Notion Integration

This plan outlines how to add a Notion action to append lines to Notion documents using template variables from webhook metadata.

## Requirements Summary

- Append a line of text to a Notion document/page
- Line content comes from metadata with template variables (e.g., "Thanks {recipient.name} for testing my automation system")
- Template variables replaced with actual values from webhook payload
- No credit card required (unlike Google Cloud)

## Notion API Requirements

### Credentials Needed:
- **Notion Internal Connection** - Static API token (no OAuth required)
- **Page ID** - The specific Notion page to append to
- **Free Notion account** - No payment method required

### Setup Steps:
1. Create a Notion account (free at notion.so)
2. Create a workspace (automatically created with account)
3. Go to Notion Developer Portal (https://www.notion.so/my-integrations)
4. Create a new integration:
   - Name: "Zapier Automation"
   - Associated workspace: Select your workspace
   - Capabilities: Read content, Update content, Insert content
5. Copy the "Internal Integration Token" from the Configuration tab
6. Create a page in your Notion workspace where you want to append lines
7. Share the page with your integration (click "Share", add the integration name)
8. Copy the page ID from the URL (32-character string after `/` and before `?`)

### Environment Variables Needed:
- `NOTION_TOKEN`: Internal integration token
- `NOTION_PAGE_ID`: The page ID to append to

### API Details:
- Free tier with generous rate limits
- No credit card required
- Simple Bearer token authentication
- Append to page content using blocks

## Implementation Plan

### 1. Database Changes
- Add "Append to Notion" action to `packages/db/seed.ts`
- Generate new UUID for the action
- Add appropriate icon/image URL

### 2. Backend Implementation
- Create `apps/worker/src/notion.ts` with functions to:
  - Initialize Notion client with API token
  - Append text blocks to a specific page
- Install required npm package:
  - `@notionhq/client` - Official Notion SDK
- Add Notion action handler to `apps/worker/src/index.ts`
- Use action name to identify Notion actions

### 3. Action Metadata Structure
The Notion action metadata should support:
```json
{
  "pageId": "your-page-id",
  "content": "Thanks {recipient.name} for testing my automation system"
}
```

### 4. Frontend Updates
- Update `apps/frontend/app/zap/create/page.tsx` to include Notion in examples
- Add UI guidance for users to provide page ID and content template

### 5. Notion Setup Guide
- Create `NOTION_SETUP.md` with step-by-step instructions
- Include screenshots placeholders for key steps
- Provide troubleshooting section

## Technical Approach

### Appending Content to Notion:
- Use Notion's block-based API
- Append paragraph blocks with the parsed content
- Support template variable replacement using existing parser
- Add timestamp automatically for tracking

### Example Flow:
1. Webhook triggers with payload: `{"recipient": {"name": "John"}}`
2. Metadata: `{"pageId": "abc123", "content": "Thanks {recipient.name} for testing"}`
3. Parser replaces `{recipient.name}` with "John"
4. Appends "Thanks John for testing" to Notion page
5. Also adds timestamp for reference

## Questions for User

1. Should the appended content include a timestamp automatically?
2. Should it append as a simple paragraph or as a bulleted list item?
3. Do you want to support multiple Notion pages per action or just one?
