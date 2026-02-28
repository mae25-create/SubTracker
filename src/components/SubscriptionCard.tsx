import { useState } from "react";
import { ExternalLink, Calendar, CreditCard, Trash2, Pencil, CircleDollarSign, Clock, AlertCircle, Check, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Subscription } from "../types";
import { getDaysUntilExpiry } from "../utils";
import { AppLogo } from "./AppLogo";

interface Props {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete, isSelected, onToggleSelect }: Props) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const isMobileApp = subscription.websiteUrl.toLowerCase() === "mobile app";
  const daysUntilExpiry = getDaysUntilExpiry(subscription.expirationDate);
  
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  // Currency formatting logic
  const amountStr = subscription.amount || "";
  const hasCurrency = /[€£¥₹₽₩₪₫₭₮₱₲₴₵₸₺₼₽₾₿$]/.test(amountStr) || /^(USD|EUR|GBP|JPY)/i.test(amountStr);
  const displayAmount = amountStr ? (hasCurrency ? amountStr : `$${amountStr}`) : "";

  let bgClass = 'bg-emerald-50 dark:bg-emerald-900/20';
  let borderClass = 'border-emerald-200 dark:border-emerald-800/50';

  if (isExpired) {
    bgClass = 'bg-red-50 dark:bg-red-900/20';
    borderClass = 'border-red-400 dark:border-red-500/50';
  } else if (isExpiringSoon) {
    bgClass = 'bg-amber-50 dark:bg-amber-900/20';
    borderClass = 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400 dark:ring-amber-500/50';
  }

  if (isSelected) {
    borderClass = 'border-amber-500 ring-2 ring-amber-500 dark:border-amber-400 dark:ring-amber-400';
  }

  return (
    <div className={`${bgClass} rounded-2xl p-6 shadow-xl border flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 ${borderClass}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <button
                onClick={() => onToggleSelect(subscription.id)}
                className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors border ${isSelected ? 'bg-amber-500 border-amber-500 text-zinc-950 dark:bg-amber-400 dark:border-amber-400' : 'border-zinc-400 dark:border-zinc-500 hover:border-amber-500/50 text-transparent'}`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
            )}
            <AppLogo name={subscription.name} websiteUrl={subscription.websiteUrl} size={36} className="shadow-sm border border-zinc-100 dark:border-zinc-800" />
            <h3 className="text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">{subscription.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              title="Edit subscription"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(subscription.id)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              title="Delete subscription"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
            <CreditCard size={16} className="mr-3 text-zinc-500 dark:text-zinc-400" />
            <span className="font-medium tracking-wide uppercase text-xs">{subscription.plan || "Unknown Plan"}</span>
          </div>
          
          {displayAmount && (
            <div className="flex items-center text-sm">
              <CircleDollarSign size={16} className="mr-3 text-amber-600 dark:text-amber-400" />
              <span className="font-serif text-lg text-amber-700 dark:text-amber-400">{displayAmount}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
            <Calendar size={16} className={`mr-3 ${isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : isExpired ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span className="flex items-center gap-2 flex-wrap">
              <span>Expires: <span className={`font-medium ${isExpiringSoon ? 'text-amber-700 dark:text-amber-400' : isExpired ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{subscription.expirationDate || "N/A"}</span></span>
              {isExpiringSoon && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-amber-200/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  <Clock size={10} className="mr-1 animate-pulse" /> Soon
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-red-200/50 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                  <AlertCircle size={10} className="mr-1" /> Expired
                </span>
              )}
            </span>
          </div>
        </div>

        {subscription.notes && (
          <div className="mb-6">
            <button
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-2 border-t border-black/5 dark:border-white/5"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>Notes</span>
              </div>
              {isNotesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isNotesExpanded && (
              <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap border border-black/5 dark:border-white/5">
                {subscription.notes}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
        {isMobileApp ? (
          <div className="text-xs uppercase tracking-widest font-semibold text-amber-800 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-400/10 py-2.5 px-4 rounded-lg text-center border border-amber-200 dark:border-amber-400/20">
            Mobile App
          </div>
        ) : subscription.websiteUrl ? (
          <a
            href={subscription.websiteUrl.startsWith('http') ? subscription.websiteUrl : `https://${subscription.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-xs uppercase tracking-widest font-semibold text-zinc-700 dark:text-zinc-300 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:text-amber-700 dark:hover:text-amber-400 border border-black/5 dark:border-white/5 py-2.5 px-4 rounded-lg transition-all"
          >
            Visit Website
            <ExternalLink size={14} className="ml-2" />
          </a>
        ) : null}

        {subscription.cancellationUrl && (
          <a
            href={subscription.cancellationUrl.startsWith('http') ? subscription.cancellationUrl : `https://${subscription.cancellationUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-xs uppercase tracking-widest font-semibold text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-400/10 hover:bg-red-200/50 dark:hover:bg-red-400/20 border border-red-200 dark:border-red-400/20 py-2.5 px-4 rounded-lg transition-all mt-1"
          >
            Cancel Subscription
          </a>
        )}
      </div>
    </div>
  );
}
