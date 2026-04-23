import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Award, ArrowRight } from 'lucide-react';
import supabase from '@/lib/supabaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [pointsEarned, setPointsEarned] = useState(location.state?.pointsEarned || 0);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const { data: fetchedOrder, error } = await supabase.from('orders').select('*').eq('id', id).single();
          if (error) throw error;
          setOrder(fetchedOrder);
          setPointsEarned(Math.floor(fetchedOrder.total * 10));
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, order]);

  useEffect(() => {
    if (!order?.id || !order?.items) return;
    const totalQuantity = order.items.reduce((sum, item) => sum + (item.qty ?? item.quantity ?? 0), 0);
    if (totalQuantity > 0) {
      supabase.from('orders').update({ quantity: totalQuantity }).eq('id', order.id).then(({ error }) => {
        if (error) console.error('Failed to update order quantity:', error);
      });
    }
  }, [order?.id]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Order Confirmation - The Vedic Protocol</title>
        </Helmet>
        <div className="min-h-screen bg-[#0e0c09]">
          <Header />
          <div className="py-24 px-4 text-center">
            <p className="text-[#f2ead8]/70 font-light">Loading order details...</p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>Order Not Found - The Vedic Protocol</title>
        </Helmet>
        <div className="min-h-screen bg-[#0e0c09]">
          <Header />
          <div className="py-24 px-4 text-center">
            <h2 className="text-3xl font-serif text-[#f2ead8] mb-4">Order not found</h2>
            <Link to="/shop">
              <Button className="bg-[#b8962e] hover:bg-[#a08528] text-[#0e0c09]">
                Continue Shopping
              </Button>
            </Link>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <>
      <Helmet>
        <title>{`Order Confirmation - ${order.id?.slice(0, 8).toUpperCase()} - The Vedic Protocol`}</title>
        <meta name="description" content="Your order has been confirmed. Thank you for choosing The Vedic Protocol." />
      </Helmet>

      <div className="min-h-screen bg-[#0e0c09]">
        <Header />

        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <CheckCircle className="w-20 h-20 text-[#b8962e] mx-auto mb-6" />
              <h1 className="text-5xl sm:text-6xl font-serif text-[#f2ead8] mb-4">
                Order Confirmed!
              </h1>
              <p className="text-xl text-[#f2ead8]/70 font-light">
                Thank you for your order. We're preparing your wellness journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1814] border border-[#b8962e]/20 rounded-lg p-8 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Package className="w-6 h-6 text-[#b8962e] mr-3" />
                    <h2 className="text-2xl font-serif text-[#f2ead8]">Order Details</h2>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#f2ead8]/70 font-light">Order Number</span>
                      <span className="text-[#f2ead8] font-medium">#{order.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#f2ead8]/70 font-light">Order Date</span>
                      <span className="text-[#f2ead8]">{new Date(order.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#f2ead8]/70 font-light">Status</span>
                      <span className="text-yellow-400 capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-[#b8962e] mr-3" />
                    <h2 className="text-2xl font-serif text-[#f2ead8]">Vedic Points Earned</h2>
                  </div>
                  <div className="bg-[#0e0c09] rounded-lg p-6 text-center">
                    <p className="text-5xl font-serif text-[#b8962e] mb-2">
                      {pointsEarned}
                    </p>
                    <p className="text-[#f2ead8]/70 font-light">Points added to your account</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#b8962e]/20 pt-8">
                <h3 className="text-xl font-serif text-[#f2ead8] mb-4">Estimated Delivery</h3>
                <p className="text-[#f2ead8]/70 font-light mb-2">
                  Your order will arrive by:
                </p>
                <p className="text-2xl text-[#b8962e] font-medium">
                  {estimatedDelivery.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#1a1814] border border-[#b8962e]/20 rounded-lg p-8 mb-8"
            >
              <h3 className="text-2xl font-serif text-[#f2ead8] mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-[#b8962e]/10 pb-4">
                    <div>
                      <p className="text-[#f2ead8] font-medium">{item.name}</p>
                      <p className="text-[#f2ead8]/70 font-light text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-[#b8962e] font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#b8962e]/20 mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-[#f2ead8]/70 font-light">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[#f2ead8]/70 font-light">
                  <span>Tax</span>
                  <span>₹{order.tax?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-2xl font-serif text-[#f2ead8] pt-2">
                  <span>Total</span>
                  <span className="text-[#b8962e]">₹{order.total?.toFixed(0)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/dashboard" className="flex-1">
                <Button className="w-full bg-[#b8962e] hover:bg-[#a08528] text-[#0e0c09] py-6">
                  View Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/shop" className="flex-1">
                <Button variant="outline" className="w-full border-[#b8962e] text-[#f2ead8] hover:bg-[#b8962e]/20 py-6">
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-[#f2ead8]/70 font-light">
                A confirmation email has been sent to your registered email address.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default OrderConfirmationPage;