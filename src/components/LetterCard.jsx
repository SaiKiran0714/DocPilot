import { useState } from 'react';
import { CalendarDays, Copy, CreditCard, ExternalLink, FileText, Languages, ListChecks, Sparkles } from 'lucide-react';

const urgencyClassNames = {
  High: 'bg-red-50 text-red-700 ring-red-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
};

export function LetterCard({
  letter,
  showFullExtractedText = false,
  showImage = false,
  showOverview = false
}) {
  const [activeDetailsPanel, setActiveDetailsPanel] = useState('');
  const hasImportantInformation =
    (Array.isArray(letter.key_dates) && letter.key_dates.length > 0) ||
    (Array.isArray(letter.categorized_info) && letter.categorized_info.length > 0) ||
    (Array.isArray(letter.important_information) && letter.important_information.length > 0) ||
    (Array.isArray(letter.structured_fields) && letter.structured_fields.length > 0);
  const hasTranslation = Boolean(letter.translated_text);
  const hasExtractedText = Boolean(letter.extracted_text);
  const paymentDetails = extractPaymentDetails(letter);
  const hasPaymentDetails = paymentDetails.hasPaymentDetails;

  const detailTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Sparkles,
      isAvailable: Boolean(letter.ai_overview)
    },
    {
      id: 'important',
      label: 'Important info',
      icon: ListChecks,
      isAvailable: hasImportantInformation
    },
    {
      id: 'payment',
      label: 'Pay',
      icon: CreditCard,
      isAvailable: hasPaymentDetails
    },
    {
      id: 'translation',
      label: 'Translation',
      icon: Languages,
      isAvailable: hasTranslation
    },
    {
      id: 'rawText',
      label: 'Raw text',
      icon: FileText,
      isAvailable: hasExtractedText
    }
  ];

  const visibleTabs = detailTabs.filter((tab) => tab.isAvailable);
  const selectedDetailsPanel = activeDetailsPanel || visibleTabs[0]?.id || '';

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      {showImage && letter.image_data_url && (
        <img
          src={letter.image_data_url}
          alt="Uploaded letter"
          className="mb-4 max-h-80 w-full rounded-md bg-slate-50 object-contain"
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink">{letter.sender || letter.provider}</h3>
          <p className="mt-1 text-sm text-slate-600">{letter.category}</p>
        </div>
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${urgencyClassNames[letter.urgency_level] || urgencyClassNames.Low}`}>
          {letter.urgency_level}
        </span>
      </div>

      {visibleTabs.length > 0 && (
        <div className="mt-4">
          <div className="flex gap-1 overflow-x-auto rounded-md bg-slate-100 p-1" role="tablist" aria-label="Letter details">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedDetailsPanel === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveDetailsPanel(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? 'bg-white text-civic shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon aria-hidden="true" size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDetailsPanel === 'overview' && showOverview && letter.ai_overview && (
        <div className="mt-4 rounded-md bg-teal-50 p-3">
          <h4 className="text-sm font-semibold text-teal-900">AI overview</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm text-teal-950">{letter.ai_overview}</p>
        </div>
      )}

      {selectedDetailsPanel === 'important' && (
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
          <h4 className="text-sm font-semibold text-slate-800">Important information</h4>

          {Array.isArray(letter.key_dates) && letter.key_dates.length > 0 && (
            <div className="mt-3 space-y-2">
              {letter.key_dates.map((keyDate, index) => (
                <div key={`${keyDate.date}-${index}`} className="flex items-center gap-2 text-sm text-slate-700">
                  <CalendarDays aria-hidden="true" size={16} className="text-civic" />
                  <span>{keyDate.label || 'Important date'}: {keyDate.date}</span>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(letter.categorized_info) && letter.categorized_info.length > 0 && (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {letter.categorized_info.map((item, index) => (
                <div key={`${item.category}-${item.key}-${index}`} className="rounded-md bg-slate-50 p-2">
                  <dt className="font-medium text-slate-700">{item.category}: {item.key}</dt>
                  <dd className="break-words text-slate-600">{String(item.value ?? 'Unreadable')}</dd>
                </div>
              ))}
            </dl>
          )}

          {Array.isArray(letter.important_information) && letter.important_information.length > 0 && (
            <dl className="mt-3 space-y-2">
              {letter.important_information.map((item, index) => (
                <div key={`${item.label}-${index}`} className="text-sm">
                  <dt className="font-medium text-slate-800">{item.label}</dt>
                  <dd className="text-slate-600">{String(item.value ?? 'Unreadable')}</dd>
                </div>
              ))}
            </dl>
          )}

          {Array.isArray(letter.structured_fields) && letter.structured_fields.length > 0 && (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {letter.structured_fields.map((field, index) => (
                <div key={`${field.key}-${index}`} className="rounded-md bg-slate-50 p-2">
                  <dt className="font-medium text-slate-700">{field.key}</dt>
                  <dd className="break-words text-slate-600">{String(field.value ?? 'Unreadable')}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {selectedDetailsPanel === 'payment' && hasPaymentDetails && (
        <PaymentPanel paymentDetails={paymentDetails} />
      )}

      {selectedDetailsPanel === 'translation' && letter.translated_text && (
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
          <h4 className="text-sm font-semibold text-slate-800">English translation</h4>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {letter.translated_text}
          </p>
        </div>
      )}

      {selectedDetailsPanel === 'rawText' && letter.extracted_text && (
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
          <h4 className="text-sm font-semibold text-slate-800">Raw extracted text</h4>
          <p className={`mt-2 whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 text-sm text-slate-600 ${showFullExtractedText ? '' : 'line-clamp-6'}`}>
            {letter.extracted_text}
          </p>
        </div>
      )}
    </article>
  );
}

function PaymentPanel({ paymentDetails }) {
  const sepaSummary = [
    paymentDetails.iban ? `IBAN: ${paymentDetails.iban}` : '',
    paymentDetails.bic ? `BIC: ${paymentDetails.bic}` : '',
    paymentDetails.accountHolder ? `Account holder: ${paymentDetails.accountHolder}` : '',
    paymentDetails.amount ? `Amount: ${paymentDetails.amount}` : '',
    paymentDetails.reference ? `Reference: ${paymentDetails.reference}` : ''
  ].filter(Boolean).join('\n');

  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Payment options</h4>
          <p className="mt-1 text-sm text-slate-600">Check the details against the original letter before sending money.</p>
        </div>
        <span className="w-fit rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
          Verify first
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {paymentDetails.iban && <PaymentField label="IBAN" value={paymentDetails.iban} />}
        {paymentDetails.bic && <PaymentField label="BIC" value={paymentDetails.bic} />}
        {paymentDetails.accountNumber && <PaymentField label="Kontonummer" value={paymentDetails.accountNumber} />}
        {paymentDetails.bankCode && <PaymentField label="Bankleitzahl" value={paymentDetails.bankCode} />}
        {paymentDetails.accountHolder && <PaymentField label="Account holder" value={paymentDetails.accountHolder} />}
        {paymentDetails.amount && <PaymentField label="Amount" value={paymentDetails.amount} />}
        {paymentDetails.reference && <PaymentField label="Reference" value={paymentDetails.reference} />}
        {paymentDetails.qrCode && <PaymentField label="QR / EPC code" value={paymentDetails.qrCode} />}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {paymentDetails.iban && (
          <PaymentActionButton onClick={() => copyText(paymentDetails.iban)}>
            <Copy aria-hidden="true" size={16} />
            Copy IBAN
          </PaymentActionButton>
        )}
        {paymentDetails.reference && (
          <PaymentActionButton onClick={() => copyText(paymentDetails.reference)}>
            <Copy aria-hidden="true" size={16} />
            Copy reference
          </PaymentActionButton>
        )}
        {paymentDetails.amount && (
          <PaymentActionButton onClick={() => copyText(paymentDetails.amount)}>
            <Copy aria-hidden="true" size={16} />
            Copy amount
          </PaymentActionButton>
        )}
        {sepaSummary && (
          <PaymentActionButton onClick={() => copyText(sepaSummary)}>
            <CreditCard aria-hidden="true" size={16} />
            Copy SEPA details
          </PaymentActionButton>
        )}
        <a
          href="https://www.paypal.com/myaccount/transfer/send"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          <ExternalLink aria-hidden="true" size={16} />
          Open PayPal
        </a>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        SEPA direct debit cannot be started safely from this prototype. Use the copied SEPA details in your banking app.
      </p>
    </div>
  );
}

function PaymentField({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <dt className="font-medium text-slate-700">{label}</dt>
      <dd className="break-words text-slate-600">{String(value)}</dd>
    </div>
  );
}

function PaymentActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
    >
      {children}
    </button>
  );
}

function copyText(text) {
  if (!text) {
    return;
  }

  navigator.clipboard?.writeText(String(text));
}

function extractPaymentDetails(letter) {
  const categorizedFields = Array.isArray(letter.categorized_info) ? letter.categorized_info : [];
  const searchableFieldText = categorizedFields
    .map((item) => `${item.category || ''} ${item.key || ''} ${item.value || ''}`)
    .join('\n');
  const combinedText = [
    searchableFieldText,
    letter.extracted_text || '',
    letter.translated_text || ''
  ].join('\n');

  const paymentFields = categorizedFields.filter((item) => {
    const category = String(item.category || '').toLowerCase();
    const key = String(item.key || '').toLowerCase();
    return category.includes('payment') ||
      category.includes('bank') ||
      key.includes('iban') ||
      key.includes('bic') ||
      key.includes('konto') ||
      key.includes('amount') ||
      key.includes('betrag') ||
      key.includes('reference') ||
      key.includes('verwendungszweck') ||
      key.includes('paypal') ||
      key.includes('qr');
  });

  const getFieldValue = (patterns) => {
    const matchingField = paymentFields.find((item) => {
      const key = String(item.key || '').toLowerCase();
      return patterns.some((pattern) => key.includes(pattern));
    });

    return matchingField?.value ? String(matchingField.value) : '';
  };

  const iban = normalizeIban(getFieldValue(['iban']) || combinedText.match(/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){11,30}\b/i)?.[0] || '');
  const bic = getFieldValue(['bic', 'swift']) || combinedText.match(/\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/i)?.[0] || '';
  const accountNumber = getFieldValue(['kontonummer', 'konto nummer', 'account number']) || findLabeledValue(combinedText, ['kontonummer', 'konto-nr', 'konto nr']);
  const bankCode = getFieldValue(['bankleitzahl', 'blz']) || findLabeledValue(combinedText, ['bankleitzahl', 'blz']);
  const amount = getFieldValue(['amount', 'betrag', 'total', 'summe']) || combinedText.match(/\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s?(?:EUR|Euro|€)\b/i)?.[0] || '';
  const reference = getFieldValue(['reference', 'verwendungszweck', 'rechnungsnummer', 'invoice number']) || findLabeledValue(combinedText, ['verwendungszweck', 'referenz', 'rechnungsnummer', 'kundennummer']);
  const accountHolder = getFieldValue(['account holder', 'kontoinhaber', 'empfaenger', 'empfänger']) || findLabeledValue(combinedText, ['kontoinhaber', 'empfaenger', 'empfänger']);
  const qrCode = getFieldValue(['qr', 'epc']) || (/\bBCD\b[\s\S]{0,300}\bSCT\b/i.test(combinedText) ? 'EPC payment QR code detected' : '');
  const hasPaymentDetails = Boolean(
    iban ||
    bic ||
    accountNumber ||
    bankCode ||
    amount ||
    reference ||
    accountHolder ||
    qrCode ||
    /\b(paypal|sepa|lastschrift|ueberweisung|überweisung|zahlung|betrag|iban|kontonummer)\b/i.test(combinedText)
  );

  return {
    hasPaymentDetails,
    iban,
    bic,
    accountNumber,
    bankCode,
    amount,
    reference,
    accountHolder,
    qrCode
  };
}

function normalizeIban(value) {
  return value ? value.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim().toUpperCase() : '';
}

function findLabeledValue(text, labels) {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*[:#-]?\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
}
