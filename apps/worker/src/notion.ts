import { Client } from '@notionhq/client';

const notionToken = process.env.NOTION_TOKEN;

if (!notionToken) {
  throw new Error('NOTION_TOKEN environment variable is not set');
}

const notion = new Client({
  auth: notionToken,
});

export async function appendToNotionPage(
  pageId: string,
  content: string
) {
  try {
    const timestamp = new Date().toISOString();
    
    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${content} (Timestamp: ${timestamp})`,
                },
              },
            ],
          },
        },
      ],
    });

    console.log('Successfully appended to Notion:', response);
    return response;
  } catch (error) {
    console.error('Error appending to Notion:', error);
    throw error;
  }
}
