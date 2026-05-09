import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processLetterImage } from './ocr/processLetterImage.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDirectory = path.join(projectRoot, 'dist');
const isProduction = process.env.NODE_ENV === 'production';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

const serverPort = process.env.PORT || process.env.SERVER_PORT || 8787;
const allowedClientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAuthClient = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

app.use(cors({ origin: isProduction ? allowedClientOrigin : 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/letters/process', upload.single('letterImage'), async (request, response) => {
  console.log('[POST /api/letters/process] Received upload request.');

  if (!request.file) {
    console.error('[POST /api/letters/process] No image file was provided.');
    return response.status(400).json({ error: 'Failed to read image: no file uploaded.' });
  }

  try {
    const authenticatedUser = await getAuthenticatedUser(request);
    console.log('[POST /api/letters/process] Authenticated user:', authenticatedUser.id);

    console.log('[POST /api/letters/process] Uploaded file:', {
      originalname: request.file.originalname,
      mimetype: request.file.mimetype,
      size: request.file.size
    });

    const createdLetter = await processLetterImage({
      imageBuffer: request.file.buffer,
      originalFileName: request.file.originalname,
      mimeType: request.file.mimetype,
      userId: authenticatedUser.id
    });

    console.log('[POST /api/letters/process] Letter processed successfully:', createdLetter.id);
    response.status(201).json({ letter: createdLetter });
  } catch (error) {
    console.error('[POST /api/letters/process] Pipeline failed:', error);
    response.status(error.statusCode || 500).json({ error: error.message || 'Failed to read image.' });
  }
});

async function getAuthenticatedUser(request) {
  if (!supabaseAuthClient) {
    throw new Error('Supabase auth credentials are missing.');
  }

  const authorizationHeader = request.headers.authorization || '';
  const accessToken = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : '';

  if (!accessToken) {
    const error = new Error('You must sign in before uploading letters.');
    error.statusCode = 401;
    throw error;
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(accessToken);

  if (error || !data.user) {
    console.error('[getAuthenticatedUser] Failed to verify Supabase access token:', error);
    const authError = new Error('Your sign-in session is invalid or expired.');
    authError.statusCode = 401;
    throw authError;
  }

  return data.user;
}

if (isProduction) {
  app.use(express.static(distDirectory));

  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api')) {
      return next();
    }

    return response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

app.listen(serverPort, () => {
  console.log(`[server] Docpilot API listening on port ${serverPort}.`);
});
