import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CircleDollarSign } from 'lucide-react';
import { Subscription } from '../types';
import { AppLogo } from './AppLogo';
import { getDaysUntilExpiry } from '../utils';

interface Props {
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
}

export function CalendarView({ subscriptions, onEdit }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getSubscriptionsForDate = (date: Date) => {
    return subscriptions.filter(sub => {
      if (!sub.expirationDate) return false;
      // Parse YYYY-MM-DD safely
      const parts = sub.expirationDate.split('-');
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatAmount = (amountStr: string) => {
    if (!amountStr) return "";
    const hasCurrency = /[€£¥₹₽₩₪₫₭₮₱₲₴₵₸₺₼₽₾₿$]/.test(amountStr) || /^(USD|EUR|GBP|JPY)/i.test(amountStr);
    return hasCurrency ? amountStr : `$${amountStr}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={goToToday}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-zinc-200 dark:bg-zinc-800 gap-px">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="bg-white dark:bg-zinc-900 min-h-[140px] opacity-50"></div>;
          }

          const daySubs = getSubscriptionsForDate(date);
          const today = isToday(date);

          return (
            <div 
              key={date.toISOString()} 
              className={`bg-white dark:bg-zinc-900 min-h-[140px] p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group relative ${today ? 'ring-1 ring-inset ring-amber-400 dark:ring-amber-500/50 z-10' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${today ? 'bg-amber-500 text-white dark:text-zinc-950' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {date.getDate()}
                </span>
                {daySubs.length > 0 && (
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-amber-500 transition-colors">
                    {daySubs.length} due
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
                {daySubs.map(sub => {
                  const days = getDaysUntilExpiry(sub.expirationDate);
                  let status: 'active' | 'expiring' | 'expired' | 'none' = 'none';
                  
                  if (days !== null) {
                    if (days < 0) status = 'expired';
                    else if (days <= 7) status = 'expiring';
                    else status = 'active';
                  }

                  let bgClass = 'bg-zinc-50 dark:bg-zinc-500/10 border-zinc-200/50 dark:border-zinc-500/20 hover:border-zinc-400 dark:hover:border-zinc-400/50';
                  let textClass = 'text-zinc-900 dark:text-zinc-100';
                  let amountClass = 'text-zinc-600 dark:text-zinc-400';

                  if (status === 'active') {
                    bgClass = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400/50';
                    textClass = 'text-emerald-900 dark:text-emerald-400';
                    amountClass = 'text-emerald-700 dark:text-emerald-200/70';
                  } else if (status === 'expiring') {
                    bgClass = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-400/50';
                    textClass = 'text-amber-900 dark:text-amber-400';
                    amountClass = 'text-amber-700 dark:text-amber-200/70';
                  } else if (status === 'expired') {
                    bgClass = 'bg-red-50 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-400/50';
                    textClass = 'text-red-900 dark:text-red-400';
                    amountClass = 'text-red-700 dark:text-red-200/70';
                  }

                  return (
                    <button
                      key={sub.id}
                      onClick={() => onEdit(sub)}
                      className={`w-full text-left flex items-center gap-2 p-2 rounded-lg border transition-all hover:shadow-md group/item ${bgClass}`}
                      title={`View details for ${sub.name}`}
                    >
                      <AppLogo name={sub.name} websiteUrl={sub.websiteUrl} size={24} className="shadow-sm" status={status} />
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-xs font-semibold truncate block leading-tight ${textClass}`}>
                          {sub.name}
                        </span>
                        {sub.amount && (
                          <span className={`text-[10px] font-medium truncate block mt-0.5 ${amountClass}`}>
                            {formatAmount(sub.amount)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
