import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import tesseract from 'tesseract.js';

const { recognize } = tesseract;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export async function processLetterImage({ imageBuffer, originalFileName, mimeType, userId }) {
  console.log('[processLetterImage] Step 1: Validating environment and image input.');

  if (!imageBuffer?.length) {
    throw new Error('Failed to read image: empty image buffer.');
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase server credentials are missing.');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('[processLetterImage] Step 2: Starting full text extraction from image.');
  const extractedText = await extractFullTextFromImage(imageBuffer, mimeType);
  console.log('[processLetterImage] Step 3: Text extraction completed. Extracted character count:', extractedText.length);
  console.log('[processLetterImage] Extracted OCR text:');
  console.log(extractedText);

  if (!extractedText) {
    throw new Error('Failed to read image: OCR returned no text.');
  }

  console.log('[processLetterImage] Step 4: Sending OCR text to Gemini for classification.');
  const extractedFields = await classifyLetterTextWithLlm(extractedText);
  console.log('[processLetterImage] Step 5: Gemini extracted fields:', extractedFields);

  const letterInsertPayload = {
    provider: extractedFields.provider || extractedFields.sender || 'Unknown Provider',
    sender: extractedFields.sender || extractedFields.provider || 'Unknown Sender',
    category: normalizeCategory(extractedFields.category),
    urgency_level: normalizeUrgencyLevel(extractedFields.urgency_level),
    key_dates: Array.isArray(extractedFields.key_dates) ? extractedFields.key_dates : [],
    categorized_info: normalizeCategorizedInfo(extractedFields.categorized_info),
    translated_text: extractedFields.translated_text || '',
    ai_overview: extractedFields.ai_overview || '',
    extracted_text: extractedText,
    original_file_name: originalFileName,
    image_data_url: createImageDataUrl(imageBuffer, mimeType),
    user_id: userId
  };

  console.log('[processLetterImage] Step 6: Saving extracted letter to Supabase database.');
  console.log('[processLetterImage] Supabase insert payload:', letterInsertPayload);
  const { data: createdLetter, error } = await supabaseAdmin
    .from('letters')
    .insert(letterInsertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[processLetterImage] Supabase insert failed:', error);
    throw new Error(`Failed to save extracted letter: ${error.message}`);
  }

  console.log('[processLetterImage] Step 7: Supabase insert completed:', createdLetter.id);
  return createdLetter;
}

async function extractFullTextFromImage(imageBuffer, mimeType) {
  if (geminiClient) {
    try {
      console.log('[extractFullTextFromImage] Calling Gemini Vision for full document transcription.');
      const geminiVisionText = await extractTextWithGeminiVision(imageBuffer, mimeType);
      console.log('[extractFullTextFromImage] Gemini Vision character count:', geminiVisionText.length);

      if (geminiVisionText) {
        return geminiVisionText;
      }
    } catch (error) {
      console.error('[extractFullTextFromImage] Gemini Vision extraction failed. Falling back to Tesseract:', error);
    }
  }

  console.log('[extractFullTextFromImage] Starting fallback OCR with Tesseract.');
  const ocrResult = await recognize(imageBuffer, 'deu+eng', {
    logger: (message) => console.log('[extractFullTextFromImage][Tesseract]', message)
  });

  const tesseractText = ocrResult?.data?.text?.trim() || '';
  console.log('[extractFullTextFromImage] Tesseract character count:', tesseractText.length);
  return tesseractText;
}

async function extractTextWithGeminiVision(imageBuffer, mimeType) {
  const geminiVisionModel = geminiClient.getGenerativeModel({
    model: geminiModelName
  });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg'
    }
  };

  const prompt = [
    'Transcribe every visible word from this document image.',
    'Keep the original reading order from top to bottom and left to right.',
    'Preserve line breaks where they help separate addresses, headings, tables, totals, and footer text.',
    'If there is a visible or scannable QR code, include any readable QR payment content, QR reference, EPC payment data, or short note that a QR code is present.',
    'Do not summarize, translate, categorize, or omit small print.',
    'Return only the raw extracted text.'
  ].join('\n');

  const geminiResult = await geminiVisionModel.generateContent([prompt, imagePart]);
  return geminiResult.response.text().trim();
}

async function classifyLetterTextWithLlm(extractedText) {
  if (!geminiClient) {
    console.warn('[classifyLetterTextWithLlm] GEMINI_API_KEY missing. Returning fallback fields.');
    return fallbackClassifyLetterText(extractedText);
  }

  const geminiModel = geminiClient.getGenerativeModel({
    model: geminiModelName,
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = [
    'Extract structured data from this German administrative letter OCR text.',
    'Return only valid JSON with these keys: provider, sender, category, urgency_level, key_dates, categorized_info, translated_text, ai_overview.',
    'category must be one of: Invoice, Contract, Information, Other.',
    'urgency_level must be one of: High, Medium, Low.',
    'key_dates must be an array of objects with label and date in ISO format when possible.',
    'categorized_info must be an array of dynamic key-value objects. Each object must have category, key, value, and importance.',
    'Use categories that match the document, such as Sender, Recipient, Account, Payment, Deadline, Contact, Contract, Tax, Insurance, Address, Reference, Legal, Next Action, or Other.',
    'For Payment category, carefully extract IBAN, BIC, Kontonummer, Bankleitzahl, account holder, amount, currency, payment reference, invoice number, SEPA direct debit notes, PayPal mentions, and QR/EPC payment code content when present.',
    'translated_text must be the full English translation if the text is German. If the text is already English, return the same text.',
    'ai_overview must be a short English overview of the whole letter: what it is, what the user must do, and any risk or deadline.',
    'Do not invent missing fields.',
    '',
    `Letter OCR text:\n${extractedText}`
  ].join('\n');

  console.log('[classifyLetterTextWithLlm] Calling Gemini model:', geminiModelName);
  const geminiResult = await geminiModel.generateContent(prompt);
  const rawGeminiResponse = geminiResult.response.text() || '{}';
  console.log('[classifyLetterTextWithLlm] Raw Gemini JSON response:', rawGeminiResponse);

  try {
    return JSON.parse(stripJsonMarkdownFence(rawGeminiResponse));
  } catch (error) {
    console.error('[classifyLetterTextWithLlm] Failed to parse Gemini JSON:', error);
    return fallbackClassifyLetterText(extractedText);
  }
}

function stripJsonMarkdownFence(rawText) {
  return rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function fallbackClassifyLetterText(extractedText) {
  const lowerCaseText = extractedText.toLowerCase();
  const detectedProvider =
    ['finanzamt', 'tk', 'techniker krankenkasse', 'vodafone', 'deutsche bahn', 'buergeramt']
      .find((providerName) => lowerCaseText.includes(providerName)) || 'Unknown Provider';

  const hasDeadlineLanguage = ['frist', 'mahnung', 'faellig', 'zahlung bis'].some((term) =>
    lowerCaseText.includes(term)
  );

  return {
    provider: detectedProvider,
    sender: detectedProvider,
    category: lowerCaseText.includes('rechnung') ? 'Invoice' : 'Information',
    urgency_level: hasDeadlineLanguage ? 'High' : 'Low',
    key_dates: [],
    categorized_info: [],
    translated_text: extractedText,
    ai_overview: 'AI overview unavailable because Gemini classification did not return valid JSON.'
  };
}

function normalizeCategory(category) {
  const allowedCategories = ['Invoice', 'Contract', 'Information', 'Other'];
  return allowedCategories.includes(category) ? category : 'Other';
}

function normalizeUrgencyLevel(urgencyLevel) {
  const allowedUrgencyLevels = ['High', 'Medium', 'Low'];
  return allowedUrgencyLevels.includes(urgencyLevel) ? urgencyLevel : 'Low';
}

function normalizeCategorizedInfo(categorizedInfo) {
  if (!Array.isArray(categorizedInfo)) {
    return [];
  }

  return categorizedInfo
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      category: String(item.category || 'Other'),
      key: String(item.key || 'Unknown'),
      value: item.value === undefined ? null : item.value,
      importance: normalizeImportance(item.importance)
    }));
}

function normalizeImportance(importance) {
  const allowedImportanceValues = ['High', 'Medium', 'Low'];
  return allowedImportanceValues.includes(importance) ? importance : 'Medium';
}

function createImageDataUrl(imageBuffer, mimeType) {
  const safeMimeType = mimeType || 'image/jpeg';
  return `data:${safeMimeType};base64,${imageBuffer.toString('base64')}`;
}
