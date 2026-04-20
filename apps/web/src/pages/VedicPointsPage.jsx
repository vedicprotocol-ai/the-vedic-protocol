import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const VedicPointsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [pointsData, setPointsData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchPointsData = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      try {
        const { data: customer } = await supabase.from('customers').select('*').eq('id', currentUser.id).single();
        setPointsData(customer);

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
            <p className="text-sm text-foreground/70">Accumulate 10 points for every $1 invested in your protocol.</p>
          </div>
          <div className="bg-card p-8 rounded-md border border-border text-center">
            <h3 className="font-serif text-xl mb-2">02. Accumulate</h3>
            <p className="text-sm text-foreground/70">Progress through Bronze, Silver, and Gold clinical tiers.</p>
          </div>
          <div className="bg-card p-8 rounded-md border border-border text-center">
            <h3 className="font-serif text-xl mb-2">03. Redeem</h3>
            <p className="text-sm text-foreground/70">Apply points at checkout for exclusive formulations.</p>
          </div>
        </section>

        {isAuthenticated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* User Status */}
            <div className="lg:col-span-1">
              <div className="bg-foreground text-background p-8 rounded-md">
                <p className="text-xs uppercase tracking-wider mb-2 opacity-70">Current Balance</p>
                <h2 className="text-5xl font-serif mb-6">
                  {pointsData?.vedic_points || 0}
                </h2>
                <div className="border-t border-background/20 pt-6">
                  <p className="text-xs uppercase tracking-wider mb-1 opacity-70">Clinical Tier</p>
                  <p className="text-xl font-serif">{pointsData?.tier || 'Bronze'}</p>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-serif mb-6">Recent Activity</h3>
              <div className="bg-card border border-border rounded-md overflow-hidden">
                {history.length > 0 ? (
                  <div className="divide-y divide-border">
                    {history.map(record => (
                      <div key={record.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium capitalize">{record.transaction_type}</p>
                          <p className="text-xs text-foreground/60">{new Date(record.created).toLocaleDateString()}</p>
                        </div>
                        <span className="font-medium text-foreground">
                          {record.transaction_type === 'purchase' ? '+' : '-'}{record.points_earned || record.points_redeemed}
                        </span>
                      </div>
                    ))}
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
              <a href="/signup" className="bg-foreground text-background px-6 py-3 rounded-md text-sm uppercase tracking-wider hover:bg-primary clinical-transition">
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