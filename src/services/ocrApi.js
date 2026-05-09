import { supabase } from './supabaseClient.js';

export async function uploadLetterImage(imageFile) {
  console.log('[ocrApi] Preparing image upload request:', imageFile.name);

  if (!supabase) {
    throw new Error('Supabase frontend credentials are missing.');
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('You must sign in before uploading letters.');
  }

  const uploadFormData = new FormData();
  uploadFormData.append('letterImage', imageFile);

  const response = await fetch('/api/letters/process', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: uploadFormData
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[ocrApi] Backend OCR/LLM request failed:', responseBody);
    throw new Error(responseBody.error || 'Failed to read image.');
  }

  console.log('[ocrApi] Backend OCR/LLM request succeeded:', responseBody.letter);
  return responseBody.letter;
}
