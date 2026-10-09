import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Car,
  Calendar,
  Clock,
  Download
} from 'lucide-react';

export const PaymentSimulationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Mock Card');
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.data);
      } catch (err) {
        showToast(err.message || 'Failed to load booking details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleSimulatePayment = async (successMode) => {
    try {
      setProcessing(true);
      const res = await api.post('/payments/mock', {
        bookingId,
        paymentMethod,
        simulateSuccess: successMode,
      });

      setPaymentSuccess(true);
      setPaymentResult(res.data.data.payment);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast('Mock payment completed successfully! Confirmation issued.', 'success');
    } catch (err) {
      setPaymentSuccess(false);
      setPaymentResult(err.data || null);
      showToast(err.message || 'Mock payment failed as simulated.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing secure checkout simulation..." />;
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 mb-4">Booking not found.</p>
        <Link to="/customer/dashboard" className="text-xs font-bold text-emerald-700">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // If already paid or success mode completed
  if (paymentSuccess || booking.paymentStatus === 'paid') {
    const txn = paymentResult?.transactionId || 'DG-20261008-CONFIRMED';

    return (
      <div className="max-w-2xl mx-auto my-12 px-4 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Mock Payment Confirmed
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Booking Reserved Successfully!
            </h1>
            <p className="text-xs text-slate-500">
              Your mock payment has been cleared. The vehicle owner has received your request.
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-3">
            <div className="flex justify-between pb-3 border-b border-slate-200">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono font-bold text-slate-800">{txn}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle</span>
              <span className="font-bold text-slate-900">{booking.vehicle?.title}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Rental Period</span>
              <span className="font-medium text-slate-800">
                {new Date(booking.startDateTime).toLocaleDateString()} → {new Date(booking.endDateTime).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel</span>
              <span className="font-medium text-slate-800">{paymentMethod}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-700 tabular-nums">₹{booking.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              to="/customer/dashboard"
              className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Go to Customer Dashboard
            </Link>
            <Link
              to="/vehicles"
              className="py-3 px-6 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Browse More Fleet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10 px-4 space-y-6">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">MCA Academic Project Simulation Mode</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            This checkout simulates real payment gateways. You can trigger a successful transaction or simulate payment decline without actual banking cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Payment Methods Selection */}
        <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Choose Payment Method</h2>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('Mock Card')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Mock Card'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Mock Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Mock UPI')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Mock UPI'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Mock UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Mock Cash')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Mock Cash'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Mock Cash</span>
            </button>
          </div>

          {/* Simulated Payment Credentials Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            {paymentMethod === 'Mock Card' && (
              <div className="space-y-2">
                <span className="text-slate-500 font-semibold">Simulated Card Details</span>
                <div className="font-mono text-sm font-bold text-slate-800 tracking-wider">
                  4242 •••• •••• 4242
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Exp: 12/28</span>
                  <span>CVV: 888</span>
                </div>
              </div>
            )}

            {paymentMethod === 'Mock UPI' && (
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Simulated UPI VPA ID</span>
                <div className="font-mono text-xs font-bold text-slate-800">
                  driver@okdrivego (Verified)
                </div>
              </div>
            )}

            {paymentMethod === 'Mock Cash' && (
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Counter Settlement</span>
                <p className="text-[11px] text-slate-600">
                  Mock cash settlement will be marked as paid and handed over at the pickup hub.
                </p>
              </div>
            )}
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={() => handleSimulatePayment(true)}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{processing ? 'Processing Mock Gateway...' : 'Simulate Successful Payment'}</span>
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() => handleSimulatePayment(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Gateway Failure (Test Decline)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Booking Summary
          </h3>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900">
              {booking.vehicle?.title}
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div>Plan: <strong className="capitalize text-slate-700">{booking.rentalType}</strong></div>
              <div>Duration: <strong className="text-slate-700">{booking.duration} units</strong></div>
              <div>
                Pickup: {new Date(booking.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
              <div>
                Return: {new Date(booking.endDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Charge</span>
                <span className="font-semibold tabular-nums">₹{booking.baseAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security Deposit</span>
                <span className="font-semibold tabular-nums">₹{booking.securityDeposit}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700 tabular-nums">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Mock Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
