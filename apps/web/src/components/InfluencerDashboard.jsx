import React, { useState, useEffect } from 'react';
import { Copy, Check, TrendingUp, Users, ShoppingBag, Activity, AlertCircle } from 'lucide-react';
import supabase from '@/lib/supabaseClient.js';

const InfluencerDashboard = ({ currentUser }) => {
  const [influencerData, setInfluencerData] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [usageRecords, setUsageRecords] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    commissionPct: 0,
    uniqueCustomers: 0,
    totalPurchases: 0,
    avgOrderValue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Fetch influencer record — match by customer_id or user_id
        const { data: influencer, error: infErr } = await supabase
          .from('influencers')
          .select('*')
          .or(`customer_id.eq.${currentUser.id},user_id.eq.${currentUser.id}`)
          .maybeSingle();

        if (infErr) throw infErr;
        if (!influencer) {
          // User is not an influencer — render nothing
          setLoading(false);
          return;
        }
        setInfluencerData(influencer);

        // 2. Fetch linked coupon
        const { data: couponsList } = await supabase
          .from('coupons')
          .select('*')
          .eq('influencer_id', influencer.id)
          .limit(10);

        const activeCoupon = couponsList?.[0] || null;
        setCouponData(activeCoupon);

        // 3. Fetch orders where coupon_code matches the influencer_code
        const code = influencer.influencer_code;
        const commissionPct = influencer.commission_percent ?? 0;
        if (code) {
          const { data: ordersData, error: ordersErr } = await supabase
            .from('orders')
            .select('id, customer_id, total, shipping, discount, coupon_code, created, status, customer:customer_id(name, email)')
            .eq('coupon_code', code)
            .order('created', { ascending: false });

          if (ordersErr) throw ordersErr;

          const orders = (ordersData ?? []).map(o => {
            const orderValue = (o.total || 0) - (o.shipping || 0);
            const isDelivered = o.status === 'delivered';
            const commission = isDelivered ? orderValue * commissionPct / 100 : 0;
            return { ...o, orderValue, commission };
          });
          setUsageRecords(orders);

          const deliveredOrders = orders.filter(o => o.status === 'delivered');
          const totalOrderValue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          const totalCommission = deliveredOrders.reduce((sum, o) => sum + o.commission, 0);
          const uniqueCustomerIds = new Set(deliveredOrders.map(o => o.customer_id).filter(Boolean));

          setStats({
            totalEarnings: totalCommission,
            commissionPct,
            uniqueCustomers: uniqueCustomerIds.size,
            totalPurchases: deliveredOrders.length,
            avgOrderValue: deliveredOrders.length > 0 ? totalOrderValue / deliveredOrders.length : 0,
          });
        } else {
          setStats({
            totalEarnings: 0,
            commissionPct,
            uniqueCustomers: 0,
            totalPurchases: 0,
            avgOrderValue: 0,
          });
        }
      } catch (err) {
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const handleCopy = () => {
    const codeToCopy = couponData?.code || influencerData?.influencer_code;
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="mb-12 sm:mb-16 animate-pulse px-4 sm:px-0">
        <div className="h-8 w-48 bg-stone-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-stone-200 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-stone-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12 sm:mb-16 mx-4 sm:mx-0 p-4 sm:p-6 bg-[#fff5f5] border border-[#fecdd3] rounded-2xl flex items-start gap-3 text-[#c0392b]">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-sm mb-1">Dashboard Error</h3>
          <p className="text-xs opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  // Not an influencer — render nothing
  if (!influencerData) return null;

  const displayCode = couponData?.code || influencerData.influencer_code;

  return (
    <div className="mb-12 sm:mb-16 px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--gold)] mb-2">
          Partner Portal
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[var(--ink)]">
          Influencer Dashboard
        </h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

        {/* Coupon Code Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 text-[#8c8c8c]">
              <Activity size={16} />
              <span className="text-xs uppercase tracking-wider font-medium">Active Code</span>
            </div>
            {displayCode ? (
              <>
                <p className="font-serif text-2xl sm:text-3xl text-[var(--ink)] mb-1 tracking-[0.02em] break-all">
                  {displayCode}
                </p>
                {couponData && (
                  <p className="text-xs sm:text-sm text-[#8c8c8c] mb-5 sm:mb-6">
                    {couponData.discount_value}% discount for your audience
                  </p>
                )}
              </>
            ) : (
              <div className="mb-5 sm:mb-6">
                <p className="text-sm font-medium text-[#595959] mb-1">No code assigned yet</p>
                <p className="text-xs text-[#8c8c8c]">Contact support to generate your custom discount code.</p>
              </div>
            )}
          </div>
          <button
            onClick={handleCopy}
            disabled={!displayCode}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] text-sm font-medium text-[#1a1a1a] transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <><Check size={16} className="text-green-600" /> Copied!</> : <><Copy size={16} /> Copy Code</>}
          </button>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between relative overflow-hidden w-full sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-[#D4AF37] opacity-10 rounded-full -mr-10 sm:-mr-12 -mt-10 sm:-mt-12 blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 text-white/60">
              <TrendingUp size={16} />
              <span className="text-xs uppercase tracking-wider font-medium">Total Earnings</span>
            </div>
            <p className="font-serif text-4xl sm:text-5xl text-[#D4AF37] leading-none">
              ₹{Number(stats.totalEarnings).toFixed(2)}
            </p>
          </div>
          <div className="mt-5 sm:mt-6 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4">
            <span>Lifetime earnings from referrals</span>
            {stats.commissionPct > 0 && (
              <span className="text-[#D4AF37]/70">{stats.commissionPct}% commission</span>
            )}
          </div>
        </div>

        {/* Summary Stats Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between w-full sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-5 sm:mb-6 text-[#8c8c8c]">
            <ShoppingBag size={16} />
            <span className="text-xs uppercase tracking-wider font-medium">Performance</span>
          </div>

          <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col justify-center">
            <div className="flex justify-between items-end">
              <span className="text-sm text-[#595959]">Total Customers</span>
              <span className="font-serif text-xl sm:text-2xl text-[#1a1a1a]">{stats.uniqueCustomers}</span>
            </div>
            <div className="w-full h-px bg-[#f0f0f0]"></div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-[#595959]">Total Purchases</span>
              <span className="font-serif text-xl sm:text-2xl text-[#1a1a1a]">{stats.totalPurchases}</span>
            </div>
            <div className="w-full h-px bg-[#f0f0f0]"></div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-[#595959]">Avg. Order Value</span>
              <span className="font-serif text-xl sm:text-2xl text-[#D4AF37]">₹{stats.avgOrderValue.toFixed(0)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Customer Usage Section */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden w-full">
        <div className="p-4 sm:p-6 border-b border-[#e5e5e5] flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-[var(--ink)]">Recent Referrals</h3>
            <p className="text-xs sm:text-sm text-[#8c8c8c] mt-1">Purchases made using your influencer code</p>
          </div>
          <div className="text-xs font-medium text-[#595959] bg-[#fafafa] px-3 py-1.5 rounded-md border border-[#e5e5e5] self-start sm:self-auto">
            {usageRecords.length} {usageRecords.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>

        {usageRecords.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#fafafa]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Users size={24} className="text-[#bfbfbf]" />
            </div>
            <p className="font-serif text-lg sm:text-xl text-[var(--ink)] mb-2">
              No referrals yet
            </p>
            <p className="text-xs sm:text-sm text-[#8c8c8c] max-w-sm mx-auto leading-relaxed">
              When customers use your code at checkout, their purchases will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View (< 640px) */}
            <div className="flex flex-col gap-3 p-4 sm:hidden bg-[#fafafa]">
              {usageRecords.map((record) => {
                const customerName = record.customer?.name || 'Anonymous Customer';
                const purchaseAmount = record.total || 0;
                const discountAmount = record.discount || 0;
                const commission = record.commission || 0;

                return (
                  <div key={record.id} className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#f0f0f0] text-[#595959] flex items-center justify-center text-xs font-medium border border-[#e5e5e5]">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1a1a1a] truncate max-w-[120px]">{customerName}</span>
                      </div>
                      <span className="text-xs text-[#595959] whitespace-nowrap">{formatDate(record.created)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#8c8c8c]">Order Total</span>
                      <span className="text-sm font-medium text-[#1a1a1a]">₹{purchaseAmount.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#8c8c8c]">Discount Applied</span>
                      <span className="text-sm text-[#8c8c8c]">₹{discountAmount.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#8c8c8c]">Your Commission</span>
                      {record.status === 'delivered'
                        ? <span className="text-sm font-medium text-[#D4AF37]">₹{commission.toFixed(2)}</span>
                        : <span className="text-xs text-[#8c8c8c] italic">Pending delivery</span>
                      }
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#f0f0f0]">
                      <span className="text-xs font-medium text-[#1a1a1a]">Status</span>
                      <span className="text-xs capitalize text-[#595959]">{record.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop/Tablet Table View (>= 640px) */}
            <div className="w-full overflow-x-auto hidden sm:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c]">Customer</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c]">Date</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Order Total</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Discount Applied</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Your Commission</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-semibold text-[#8c8c8c] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {usageRecords.map((record) => {
                    const customerName = record.customer?.name || 'Anonymous Customer';
                    const purchaseAmount = record.total || 0;
                    const discountAmount = record.discount || 0;
                    const commission = record.commission || 0;

                    return (
                      <tr key={record.id} className="hover:bg-[#fafafa] transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f0f0f0] text-[#595959] flex items-center justify-center text-xs font-medium border border-[#e5e5e5]">
                              {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1a1a1a]">{customerName}</p>
                              {record.customer?.email && (
                                <p className="text-xs text-[#8c8c8c]">{record.customer.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#595959]">
                          {formatDate(record.created)}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#1a1a1a] text-right font-medium">
                          ₹{purchaseAmount.toFixed(0)}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#8c8c8c] text-right">
                          ₹{discountAmount.toFixed(0)}
                        </td>
                        <td className="py-4 px-6 text-sm text-right font-medium">
                          {record.status === 'delivered'
                            ? <span className="text-[#D4AF37]">₹{commission.toFixed(2)}</span>
                            : <span className="text-xs text-[#8c8c8c] italic">Pending delivery</span>
                          }
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-xs capitalize px-2 py-1 rounded bg-[#f0f0f0] text-[#595959]">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfluencerDashboard;