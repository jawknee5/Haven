import React, { useState, useCallback } from 'react';
import { bbService } from '../../lib/services/bbService';

/**
 * Comprehensive Form Automation UI
 * Handles form analysis, auto-fill, field editing, validation, and submission
 */
export function FormAutomationUI() {
  const [formSource, setFormSource] = useState<'upload' | 'url' | 'html'>('upload');
  const [formData, setFormData] = useState<string>('');
  const [formContent, setFormContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const text = await file.text();
      await analyzeForm(text);
    } catch (err) {
      setError('Failed to read file. Please ensure it\'s valid HTML.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUrlSubmit = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // In production, would fetch from URL
      setError('URL fetching requires backend support. Please upload HTML file instead.');
    } catch (err) {
      setError('Failed to fetch form from URL');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeForm = async (htmlContent: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await bbService.analyzeForm(htmlContent);
      setFormContent(result);
      // Pre-populate with BB's suggestions
      setEditedFields(result.preFilledData || {});
      setValidationErrors({});
    } catch (err) {
      setError('Failed to analyze form. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (fieldName: string, value: any, fieldType: string): string => {
    if (!value && fieldType === 'required') {
      return 'This field is required';
    }
    
    if (fieldType === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email address';
      }
    }
    
    if (fieldType === 'phone' && value) {
      const phoneRegex = /^[\d\-\+\(\)\s]+$/;
      if (!phoneRegex.test(value)) {
        return 'Invalid phone number';
      }
    }
    
    if (fieldType === 'date' && value) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        return 'Date must be in YYYY-MM-DD format';
      }
    }
    
    return '';
  };

  const handleFieldChange = (fieldName: string, value: any, fieldType: string) => {
    setEditedFields(prev => ({ ...prev, [fieldName]: value }));
    
    const error = validateField(fieldName, value, fieldType);
    setValidationErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      }
    });
  };

  const handleSubmitForm = async () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix validation errors before submitting');
      return;
    }

    // Check for required fields
    const missingRequired = formContent.missingFields?.filter(
      (field: string) => !editedFields[field]
    ) || [];

    if (missingRequired.length > 0) {
      setError(`Please fill required fields: ${missingRequired.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await bbService.autoFillForm(formContent.id, editedFields);
      setSubmitted(true);
      setTimeout(() => {
        // Reset form
        setFormContent(null);
        setEditedFields({});
        setValidationErrors({});
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.5)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        color: '#86EFAC'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Form Submitted Successfully!
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#A7F3D0' }}>
          Your form has been submitted and will be processed.
        </p>
      </div>
    );
  }

  if (formContent) {
    return (
      <FormEditorView
        formContent={formContent}
        editedFields={editedFields}
        validationErrors={validationErrors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmitForm}
        submitting={submitting}
      />
    );
  }

  return (
    <FormUploadView
      formSource={formSource}
      setFormSource={setFormSource}
      formData={formData}
      setFormData={setFormData}
      onFileUpload={handleFileUpload}
      onUrlSubmit={handleUrlSubmit}
      loading={loading}
      error={error}
      setError={setError}
    />
  );
}

// ============= Subcomponents =============

function FormUploadView({
  formSource,
  setFormSource,
  formData,
  setFormData,
  onFileUpload,
  onUrlSubmit,
  loading,
  error,
  setError
}: any) {
  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Form Automation
      </h1>
      <p style={{ color: '#A0A0A0', marginBottom: '32px' }}>
        Upload a form and BB will automatically analyze and help fill it
      </p>

      {/* Source Selection */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(['upload', 'html'] as const).map(source => (
          <button
            key={source}
            onClick={() => {
              setFormSource(source);
              setFormData('');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: formSource === source
                ? 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)'
                : 'rgba(26, 30, 36, 0.8)',
              color: formSource === source ? '#0a0e27' : '#fff',
              border: formSource === source
                ? 'none'
                : '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {source === 'upload' ? '📤 Upload' : '📝 Paste HTML'}
          </button>
        ))}
      </div>

      {/* Content Input */}
      {formSource === 'upload' ? (
        <FileUploadArea
          onFileUpload={onFileUpload}
          loading={loading}
        />
      ) : (
        <HtmlPasteArea
          value={formData}
          onChange={setFormData}
          onAnalyze={() => onUrlSubmit(formData)}
          loading={loading}
        />
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#FCA5A5',
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#FCA5A5',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function FileUploadArea({ onFileUpload, loading }: any) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== 'dragleave');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        border: dragActive ? '2px solid #FFD700' : '2px dashed rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        padding: '48px 24px',
        textAlign: 'center',
        background: dragActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(26, 30, 36, 0.8)',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
        Drag and drop your form here
      </p>
      <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 16px 0' }}>
        or click to browse (HTML files)
      </p>
      <label style={{
        display: 'inline-block',
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        color: '#fff',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto'
      }}>
        {loading ? '⏳ Analyzing...' : 'Browse Files'}
        <input
          type="file"
          accept=".html,.htm"
          onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
          style={{ display: 'none' }}
          disabled={loading}
        />
      </label>
    </div>
  );
}

function HtmlPasteArea({ value, onChange, onAnalyze, loading }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your HTML form here..."
        style={{
          padding: '16px',
          background: 'rgba(13, 15, 18, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'monospace',
          minHeight: '300px',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />
      <button
        onClick={onAnalyze}
        disabled={!value.trim() || loading}
        style={{
          padding: '12px 24px',
          background: !value.trim() ? 'rgba(212, 175, 55, 0.3)' : 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
          color: '#0a0e27',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: !value.trim() ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳ Analyzing...' : '✓ Analyze Form'}
      </button>
    </div>
  );
}

function FormEditorView({
  formContent,
  editedFields,
  validationErrors,
  onFieldChange,
  onSubmit,
  submitting
}: any) {
  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        ✨ Fill Your Form
      </h1>

      <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
        {formContent.fields?.map((field: any) => (
          <FormField
            key={field.name}
            field={field}
            value={editedFields[field.name] || ''}
            error={validationErrors[field.name]}
            onChange={(value) => onFieldChange(field.name, value, field.type)}
          />
        ))}
      </div>

      {/* Missing Fields Alert */}
      {formContent.missingFields?.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#FCA5A5',
          fontSize: '13px'
        }}>
          <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>⚠️ Required fields not filled:</p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {formContent.missingFields.map((field: string) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={submitting || Object.keys(validationErrors).length > 0}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
          transition: 'all 0.3s'
        }}
      >
        {submitting ? '⏳ Submitting...' : '✓ Submit Form'}
      </button>
    </div>
  );
}

function FormField({ field, value, error, onChange }: any) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '700',
        color: '#A0A0A0',
        marginBottom: '8px',
        textTransform: 'uppercase'
      }}>
        {field.label}
        {field.required && <span style={{ color: '#FCA5A5' }}> *</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.label}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: error ? '1px solid #FCA5A5' : '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            minHeight: '100px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      ) : field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: error ? '1px solid #FCA5A5' : '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select...</option>
          {field.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.label}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: error ? '1px solid #FCA5A5' : '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
      )}

      {error && (
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '11px',
          color: '#FCA5A5'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
