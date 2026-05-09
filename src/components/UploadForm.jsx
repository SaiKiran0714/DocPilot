import { useState } from 'react';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import { Button } from './Button.jsx';
import { uploadLetterImage } from '../services/ocrApi.js';

export function UploadForm({ onUploadComplete }) {
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  function handleSelectedImageChange(event) {
    const nextImageFile = event.target.files?.[0];
    console.log('[UploadForm] User selected image file:', nextImageFile?.name);

    setUploadErrorMessage('');
    setSelectedImageFile(nextImageFile || null);
    setImagePreviewUrl(nextImageFile ? URL.createObjectURL(nextImageFile) : '');
  }

  async function handleUploadSubmit(event) {
    event.preventDefault();

    if (!selectedImageFile) {
      setUploadErrorMessage('Please choose an image first.');
      return;
    }

    try {
      setIsProcessingImage(true);
      setUploadErrorMessage('');
      console.log('[UploadForm] Starting OCR/LLM upload request:', selectedImageFile.name);
      const createdLetter = await uploadLetterImage(selectedImageFile);
      console.log('[UploadForm] OCR/LLM upload completed:', createdLetter);
      onUploadComplete?.(createdLetter);
      setSelectedImageFile(null);
      setImagePreviewUrl('');
    } catch (error) {
      console.error('[UploadForm] Failed to process image:', error);
      setUploadErrorMessage(error.message || 'Failed to read image.');
    } finally {
      setIsProcessingImage(false);
    }
  }

  return (
    <form onSubmit={handleUploadSubmit} className="space-y-5">
      <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-civic hover:bg-teal-50">
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Selected letter preview" className="max-h-72 rounded-md object-contain" />
        ) : (
          <>
            <ImagePlus aria-hidden="true" size={40} className="text-civic" />
            <span className="mt-3 text-sm font-semibold text-slate-800">Capture or upload a letter image</span>
            <span className="mt-1 text-sm text-slate-500">PNG, JPG, or scanned document photo</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleSelectedImageChange}
        />
      </label>

      {uploadErrorMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {uploadErrorMessage}
        </p>
      )}

      <Button type="submit" disabled={isProcessingImage || !selectedImageFile}>
        {isProcessingImage ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <UploadCloud aria-hidden="true" size={18} />}
        {isProcessingImage ? 'Reading letter...' : 'Analyze letter'}
      </Button>
    </form>
  );
}
