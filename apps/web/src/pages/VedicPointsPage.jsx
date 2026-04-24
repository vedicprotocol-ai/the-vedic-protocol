import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const DEBIT_TYPES = ['redeem', 'redemption', 'order_cancelled'];

const getActivityLabel = (type) => {
  switch (type) {
    case 'purchase':       return 'Points Earned';
    case 'redeem':
    case 'redemption':     return 'Points Redeemed';
    case 'order_restore':  return 'Points Restored';
    case 'order_cancelled': return 'Points Reversed';
    default: return type ? type.charAt(0).toUpperCase() + type.slice(1) : '—';
  }
};

const VedicPointsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchPointsData = async () => {
      if (!isAuthenticated || !currentUser) return;

      try {
        const { data: allPoints } = await supabase.from('loyalty_points').select('points_earned, transaction_type')
          .eq('customer_id', currentUser.id);

        const total = (allPoints ?? []).reduce((sum, record) => {
          const pts = record.points_earned ?? 0;
          return DEBIT_TYPES.includes(record.transaction_type) ? sum - pts : sum + pts;
        }, 0);
        const computed = Math.max(0, total);
        setBalance(computed);
        setTier(computed >= 5000 ? 'Gold' : computed >= 1000 ? 'Silver' : 'Bronze');

        const { data: pointsHistory } = await supabase.from('loyalty_points').select('*')
          .eq('customer_id', currentUser.id).order('created', { ascending: false }).limit(10);
        setHistory(pointsHistory ?? []);
      } catch (error) {
        console.error('Error fetching points data:', error);
      }
    };

    fetchPointsData();
  }, [isAuthenticated, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Vedic Points | The Vedic Protocol</title>
      </Helmet>

      <Header />

      <main className="flex-grow py-16 px-6 lg:px-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-foreground mb-4">Vedic Points</h1>
          <p className="text-foreground/70">Our clinical rewards protocol.</p>
        </div>

        {/* How it works */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-card p-8 rounded-md border border-border text-center">
            <h3 className="font-serif text-xl mb-2">01. Earn</h3>
            <p className="text-sm text-foreground/70">Accumulate 4 Vedic Points for every ₹1 invested in your protocol.</p>
          </div>
          <div className="bg-card p-8 rounded-md border border-border text-center">
            <h3 className="font-serif text-xl mb-2">02. Accumulate</h3>
            <p className="text-sm text-foreground/70">Progress through Bronze, Silver, and Gold clinical tiers.</p>
          </div>
          <div className="bg-card p-8 rounded-md border border-border text-center">
            <h3 className="font-serif text-xl mb-2">03. Redeem</h3>
            <p className="text-sm text-foreground/70">Apply points at checkout. 4 Vedic Points = ₹1 off your order.</p>
          </div>
        </section>

        {isAuthenticated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* User Status */}
            <div className="lg:col-span-1">
              <div className="bg-card text-foreground p-8 rounded-md border border-border">
                <p className="text-xs uppercase tracking-wider mb-2 text-foreground/70">Current Balance</p>
                <h2 className="text-5xl font-serif mb-1">{balance}</h2>
                <p className="text-sm text-foreground/60 mb-6">Vedic Points &nbsp;·&nbsp; ₹{(balance / 4).toFixed(2)} value</p>
                <div className="border-t border-border pt-6">
                  <p className="text-xs uppercase tracking-wider mb-1 text-foreground/70">Clinical Tier</p>
                  <p className="text-xl font-serif">{tier}</p>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-serif mb-6">Recent Activity</h3>
              <div className="bg-card border border-border rounded-md overflow-hidden">
                {history.length > 0 ? (
                  <div className="divide-y divide-border">
                    {history.map(record => {
                      const isDebit = DEBIT_TYPES.includes(record.transaction_type);
                      const pts = Math.abs(record.points_earned ?? 0);
                      const label = getActivityLabel(record.transaction_type);
                      return (
                        <div key={record.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-xs text-foreground/60">
                                {new Date(record.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              {record.order_id && (
                                <p className="text-xs text-foreground/40">Order #{record.order_id.slice(0, 8).toUpperCase()}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium text-sm ${isDebit ? 'text-red-500' : 'text-foreground'}`}>
                              {isDebit ? '−' : '+'}{pts} pts
                            </span>
                            <p className="text-xs text-foreground/50">₹{(pts / 4).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-foreground/60 text-sm">
                    No point history available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center bg-card border border-border p-12 rounded-md">
            <h2 className="text-2xl font-serif mb-4">Join the Protocol</h2>
            <p className="text-foreground/70 mb-8">Create an account to start earning Vedic Points.</p>
            <div className="flex justify-center gap-4">
              <a href="/signup" className="bg-foreground text-background px-6 py-3 rounded-md text-sm uppercase tracking-wider hover:opacity-80 clinical-transition">
                Create Account
              </a>
              <a href="/login" className="border border-border px-6 py-3 rounded-md text-sm uppercase tracking-wider hover:bg-card clinical-transition">
                Log In
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VedicPointsPage;