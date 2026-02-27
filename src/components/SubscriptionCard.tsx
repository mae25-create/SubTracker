import { ExternalLink, Calendar, CreditCard, Trash2, Pencil, CircleDollarSign, Clock, AlertCircle } from "lucide-react";
import { Subscription } from "../types";
import { getDaysUntilExpiry } from "../utils";

interface Props {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: Props) {
  const isMobileApp = subscription.websiteUrl.toLowerCase() === "mobile app";
  const daysUntilExpiry = getDaysUntilExpiry(subscription.expirationDate);
  
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  // Currency formatting logic
  const amountStr = subscription.amount || "";
  const hasCurrency = /[€£¥₹₽₩₪₫₭₮₱₲₴₵₸₺₼₽₾₿$]/.test(amountStr) || /^(USD|EUR|GBP|JPY)/i.test(amountStr);
  const displayAmount = amountStr ? (hasCurrency ? amountStr : `$${amountStr}`) : "";

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 ${isExpiringSoon ? 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400 dark:ring-amber-500/50' : isExpired ? 'border-red-400 dark:border-red-500/50' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">{subscription.name}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="text-zinc-400 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Edit subscription"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(subscription.id)}
              className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Delete subscription"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <CreditCard size={16} className="mr-3 text-zinc-400 dark:text-zinc-500" />
            <span className="font-medium tracking-wide uppercase text-xs">{subscription.plan || "Unknown Plan"}</span>
          </div>
          
          {displayAmount && (
            <div className="flex items-center text-sm">
              <CircleDollarSign size={16} className="mr-3 text-amber-500 dark:text-amber-400" />
              <span className="font-serif text-lg text-amber-600 dark:text-amber-400">{displayAmount}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <Calendar size={16} className={`mr-3 ${isExpiringSoon ? 'text-amber-500 dark:text-amber-400' : isExpired ? 'text-red-500 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
            <span className="flex items-center gap-2 flex-wrap">
              <span>Expires: <span className={`font-medium ${isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : isExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{subscription.expirationDate || "N/A"}</span></span>
              {isExpiringSoon && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  <Clock size={10} className="mr-1 animate-pulse" /> Soon
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={10} className="mr-1" /> Expired
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
        {isMobileApp ? (
          <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 py-2.5 px-4 rounded-lg text-center border border-amber-200 dark:border-amber-400/20">
            Mobile App
          </div>
        ) : subscription.websiteUrl ? (
          <a
            href={subscription.websiteUrl.startsWith('http') ? subscription.websiteUrl : `https://${subscription.websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-xs uppercase tracking-widest font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-400 border border-zinc-200 dark:border-zinc-700/50 py-2.5 px-4 rounded-lg transition-all"
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
            className="flex items-center justify-center text-xs uppercase tracking-widest font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 hover:bg-red-100 dark:hover:bg-red-400/20 border border-red-100 dark:border-red-400/20 py-2.5 px-4 rounded-lg transition-all mt-1"
          >
            Cancel Subscription
          </a>
        )}
      </div>
    </div>
  );
}
