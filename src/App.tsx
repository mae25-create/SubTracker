import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, AlertCircle, Filter, Crown, Sun, Moon } from 'lucide-react';
import { Subscription, SubscriptionFormData } from './types';
import { SubscriptionCard } from './components/SubscriptionCard';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { getDaysUntilExpiry } from './utils';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('subscriptions');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse subscriptions from local storage");
      }
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Save to local storage whenever subscriptions change
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSaveSubscription = (data: SubscriptionFormData) => {
    if (editingSub) {
      setSubscriptions(prev => prev.map(sub => sub.id === editingSub.id ? { ...data, id: sub.id } : sub));
    } else {
      const newSub: Subscription = {
        ...data,
        id: crypto.randomUUID()
      };
      setSubscriptions(prev => [newSub, ...prev]);
    }
    setEditingSub(null);
    setIsModalOpen(false);
  };

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (id: string) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const expiringSoon = subscriptions.filter(sub => {
    const days = getDaysUntilExpiry(sub.expirationDate);
    return days !== null && days >= 0 && days <= 7;
  });

  const uniquePlans = Array.from(new Set(subscriptions.map(s => s.plan).filter(Boolean)));

  const filteredSubscriptions = subscriptions.filter(sub => {
    let statusMatch = true;
    if (statusFilter !== 'all') {
      const days = getDaysUntilExpiry(sub.expirationDate);
      if (statusFilter === 'active') {
        statusMatch = days === null || days >= 0;
      } else if (statusFilter === 'expired') {
        statusMatch = days !== null && days < 0;
      }
    }

    let planMatch = true;
    if (planFilter !== 'all') {
      planMatch = sub.plan === planFilter;
    }

    return statusMatch && planMatch;
  });

  return (
    <div className="min-h-screen pb-20 selection:bg-amber-500/30">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/60 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="text-white dark:text-zinc-950" size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-wide text-zinc-900 dark:text-zinc-50">SubTracker</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-xl transition-all bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl transition-colors duration-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-500 dark:text-amber-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-500 dark:text-amber-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
            
            <button
              onClick={() => { setEditingSub(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white dark:text-zinc-950 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Subscription</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {expiringSoon.length > 0 && (
          <div className="mb-10 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-amber-500/5 backdrop-blur-sm transition-colors duration-300">
            <AlertCircle className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="text-base font-serif font-semibold text-amber-800 dark:text-amber-400 tracking-wide">
                Upcoming Renewals
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-200/80 mt-1">
                You have {expiringSoon.length} subscription{expiringSoon.length > 1 ? 's' : ''} expiring in the next 7 days.
              </p>
            </div>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 border-dashed mt-10 backdrop-blur-sm transition-colors duration-300">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5 dark:shadow-black/50 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Crown size={36} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif font-semibold text-zinc-900 dark:text-zinc-100 mb-3">No subscriptions yet</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
              Keep track of all your premium software and apps in one place. Add them manually or upload a screenshot for AI auto-fill.
            </p>
            <button
              onClick={() => { setEditingSub(null); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 px-8 py-3 rounded-xl font-medium transition-all shadow-sm dark:shadow-lg hover:shadow-amber-500/10"
            >
              <Plus size={18} />
              Add Your First Subscription
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl transition-colors duration-300">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Filter size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">Filter by:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-4 pr-10 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                {uniquePlans.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select 
                      value={planFilter} 
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-4 pr-10 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer max-w-[200px] truncate appearance-none"
                    >
                      <option value="all">All Plans</option>
                      {uniquePlans.map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500/80 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20">
                Showing {filteredSubscriptions.length} of {subscriptions.length}
              </div>
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 border-dashed backdrop-blur-sm transition-colors duration-300">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={28} />
                </div>
                <h3 className="text-xl font-serif font-medium text-zinc-900 dark:text-zinc-200 mb-2">No matches found</h3>
                <p className="text-zinc-500">Try adjusting your filters to see more subscriptions.</p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPlanFilter('all');
                  }}
                  className="mt-6 text-sm font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 uppercase tracking-wider transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4 max-w-4xl mx-auto"
              }>
                {filteredSubscriptions.map(sub => (
                  <SubscriptionCard 
                    key={sub.id} 
                    subscription={sub} 
                    onEdit={() => handleEditSubscription(sub)}
                    onDelete={handleDeleteSubscription} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <AddSubscriptionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingSub(null); }}
          onSave={handleSaveSubscription}
          initialData={editingSub}
        />
      )}
    </div>
  );
}
