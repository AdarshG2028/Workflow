// Google Sheets integration is not in use yet — commented out to keep the
// worker building. See GOOGLE_CLOUD_SETUP.md to re-enable this later.

// import { google } from 'googleapis';
// import { JWT } from 'google-auth-library';

// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// export async function appendRowToSheet(
//   spreadsheetId: string,
//   range: string,
//   values: any[][]
// ) {
//   try {
//     const auth = new JWT({
//       email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//       key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       scopes: SCOPES,
//     });

//     const sheets = google.sheets({ version: 'v4', auth });

//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range,
//       valueInputOption: 'USER_ENTERED',
//       requestBody: {
//         values,
//       },
//     });

//     console.log('Row appended successfully:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error appending row to sheet:', error);
//     throw error;
//   }
// }
