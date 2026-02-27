import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Subscription, SubscriptionFormData } from '../types';
import { ImageUpload } from './ImageUpload';
import { extractSubscriptionFromImage } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubscriptionFormData) => void;
  initialData?: Subscription | null;
}

const emptyFormState: SubscriptionFormData = {
  name: '',
  websiteUrl: '',
  plan: '',
  amount: '',
  expirationDate: '',
  cancellationUrl: ''
};

export function AddSubscriptionModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<SubscriptionFormData>(emptyFormState);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          websiteUrl: initialData.websiteUrl,
          plan: initialData.plan,
          amount: initialData.amount || '',
          expirationDate: initialData.expirationDate,
          cancellationUrl: initialData.cancellationUrl
        });
      } else {
        setFormData(emptyFormState);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    onSave(formData);
  };

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsProcessingImage(true);
    setError(null);
    try {
      const extractedData = await extractSubscriptionFromImage(base64, mimeType);
      
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        websiteUrl: extractedData.websiteUrl || prev.websiteUrl,
        plan: extractedData.plan || prev.plan,
        amount: extractedData.amount || prev.amount,
        expirationDate: extractedData.expirationDate || prev.expirationDate,
        cancellationUrl: extractedData.cancellationUrl || prev.cancellationUrl,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800/50">
          <h2 className="text-xl font-serif font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {initialData ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {!initialData && (
            <>
              <div className="mb-6">
                <div className="flex items-center mb-3 text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Sparkles size={16} className="mr-2" />
                  Auto-fill with AI
                </div>
                <ImageUpload onImageSelected={handleImageSelected} isProcessing={isProcessingImage} />
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-grow h-px bg-zinc-200 dark:bg-zinc-800"></div>
                <span className="px-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Or enter manually</span>
                <div className="flex-grow h-px bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
            </>
          )}

          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <form id="add-sub-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Software / App Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                placeholder="e.g. Netflix, Adobe CC"
                required
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Website URL (or "mobile app")</label>
              <input
                type="text"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                placeholder="e.g. netflix.com or mobile app"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Current Plan</label>
                <input
                  type="text"
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                  placeholder="e.g. Premium"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Amount</label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                  placeholder="e.g. 15.99/mo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expirationDate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Expiration / Renewal Date</label>
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                placeholder="e.g. 2024-12-31"
              />
            </div>

            <div>
              <label htmlFor="cancellationUrl" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Cancellation Link</label>
              <input
                type="text"
                id="cancellationUrl"
                name="cancellationUrl"
                value={formData.cancellationUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-700"
                placeholder="e.g. netflix.com/cancel"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-sub-form"
            className="px-6 py-2.5 text-sm font-bold text-white dark:text-zinc-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {initialData ? 'Save Changes' : 'Save Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
