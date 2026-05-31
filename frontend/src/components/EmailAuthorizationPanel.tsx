// Email Authorization Component - Review & Send Drafts
// Location: frontend/src/components/EmailAuthorizationPanel.tsx

import React, { useState, useEffect } from 'react';
import { Mail, Send, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import emailService from '../services/emailService';

interface EmailDraft {
  id?: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  status: 'draft' | 'pending_auth' | 'authorized' | 'sent' | 'failed';
}

interface EmailAuthorizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailAuthorizationPanel: React.FC<EmailAuthorizationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [configService, setConfigService] = useState('gmail');
  const [config, setConfig] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      loadServices();
    }
  }, [isOpen]);

  const loadDrafts = async () => {
    try {
      const userDrafts = await emailService.getDrafts();
      setDrafts(userDrafts.filter((d: any) => d.status === 'draft'));
    } catch (error) {
      console.error('Error loading drafts:', error);
      // Fallback to local
      const localDrafts = await emailService.getLocalDrafts();
      setDrafts(localDrafts);
    }
  };

  const loadServices = async () => {
    try {
      const services = await emailService.getAvailableServices();
      setAvailableServices(services.services);
      if (services.services.length > 0) {
        setConfigService(services.services[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const toggleDraft = (draftId: string) => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  };

  const toggleAllDrafts = () => {
    if (selectedDrafts.size === drafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(drafts.map((d: any) => d.id)));
    }
  };

  const handleConfigureService = async () => {
    try {
      setLoading(true);
      await emailService.configureService(configService, config);
      setShowConfiguration(false);
      setSendStatus({ type: 'success', message: `${configService} configured successfully` });
    } catch (error: any) {
      setSendStatus({ type: 'error', message: `Configuration failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedDrafts.size === 0) return;

    try {
      setLoading(true);
      const draftIds = Array.from(selectedDrafts);
      const result = await emailService.sendEmails(draftIds, {
        service: configService,
        email: config.email,
        password: config.password,
      });

      setSendStatus({
        type: 'success',
        message: `Sent ${result.sent.length} emails successfully`,
        details: result,
      });

      // Reload drafts
      await loadDrafts();
      setSelectedDrafts(new Set());
    } catch (error: any) {
      setSendStatus({
        type: 'error',
        message: `Failed to send emails: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail size={24} />
            <h2 className="text-xl font-bold">Email Authorization</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Status Messages */}
          {sendStatus && (
            <div
              className={`mb-4 p-3 rounded flex gap-2 ${
                sendStatus.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {sendStatus.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <div>
                <p>{sendStatus.message}</p>
                {sendStatus.details && (
                  <p className="text-sm">
                    Sent: {sendStatus.details.sent.length}, Failed:{' '}
                    {sendStatus.details.failed.length}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email Service Configuration */}
          {showConfiguration && (
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lock size={18} /> Configure Email Service
              </h3>
              
              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm font-medium">Service</span>
                  <select
                    value={configService}
                    onChange={(e) => setConfigService(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    {availableServices.map((svc) => (
                      <option key={svc} value={svc}>
                        {svc}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Email Address</span>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) =>
                      setConfig({ ...config, email: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="your-email@example.com"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">
                    Password or App Password
                  </span>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) =>
                      setConfig({ ...config, password: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your password is encrypted and only used to send emails on
                    your behalf.
                  </p>
                </label>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleConfigureService}
                    disabled={loading || !config.email || !config.password}
                    className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Configuring...' : 'Test & Configure'}
                  </button>
                  <button
                    onClick={() => setShowConfiguration(false)}
                    className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Drafts */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                Email Drafts ({drafts.length})
              </h3>
              <button
                onClick={toggleAllDrafts}
                className="text-sm text-blue-500 hover:underline"
              >
                {selectedDrafts.size === drafts.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {drafts.length === 0 ? (
                <p className="text-gray-500 text-sm">No email drafts pending</p>
              ) : (
                drafts.map((draft: any) => (
                  <label
                    key={draft.id}
                    className="flex gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDrafts.has(draft.id)}
                      onChange={() => toggleDraft(draft.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        To: {draft.to}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {draft.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {draft.body.substring(0, 100)}...
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t pt-4">
            <button
              onClick={() => setShowConfiguration(true)}
              className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              Configure Email
            </button>
            <button
              onClick={handleSendEmails}
              disabled={
                loading ||
                selectedDrafts.size === 0 ||
                !config.email ||
                !config.password
              }
              className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Sending...' : `Send ${selectedDrafts.size}`}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAuthorizationPanel;
