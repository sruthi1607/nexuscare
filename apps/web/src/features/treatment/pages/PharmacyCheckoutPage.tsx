import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';

export function PharmacyCheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useTreatmentStore();

  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [street, setStreet] = useState('742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState('Metroville');
  const [postalCode, setPostalCode] = useState('110001');
  const [phone, setPhone] = useState('+1 (555) 234-5678');

  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'mock_online' | 'mock_upi'>('mock_online');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliverySpeed === 'express' ? 5.0 : subtotal > 30 ? 0 : 3.5;
  const discount = subtotal > 50 ? 5.0 : 0;
  const total = Number((subtotal + deliveryFee - discount).toFixed(2));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);

    setTimeout(() => {
      const order = treatmentStore.placeOrder(
        { fullName, street, city, postalCode, phone },
        paymentMethod,
        deliverySpeed,
      );

      setSubmitting(false);
      if (order) {
        void navigate(`/patient/pharmacy/orders/${order.id}`);
      }
    }, 800);
  };

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">No items in your cart to checkout.</p>
        <Link to="/patient/pharmacy">
          <Button>Back to Pharmacy</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Demo Checkout & Delivery"
        description="Select delivery address, choose courier speed, and complete your order."
      />

      <TreatmentFlowBanner currentStep="pharmacy" />

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Delivery & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <MapPin className="size-4 text-brand-600" />
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Recipient Name" required>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Field>

              <Field label="Contact Phone Number" required>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Street Address & Apartment" required>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="City / Region" required>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Field>

              <Field label="Postal / ZIP Code" required>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </Field>
            </div>
          </Card>

          {/* Step 2: Delivery Speed */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <Truck className="size-4 text-brand-600" />
              2. Delivery Speed
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  deliverySpeed === 'express'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="express"
                  checked={deliverySpeed === 'express'}
                  onChange={() => setDeliverySpeed('express')}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Zap className="size-3.5 text-amber-500 fill-amber-500" /> Express 2-Hour Courier (+$5.00)
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Delivered today by dedicated NexusExpress temperature-monitored courier.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  deliverySpeed === 'standard'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="standard"
                  checked={deliverySpeed === 'standard'}
                  onChange={() => setDeliverySpeed('standard')}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Standard Delivery (1-2 Days) — {subtotal > 30 ? 'FREE' : '$3.50'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Regular courier parcel delivery with standard tracking.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Step 3: Payment Method */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <CreditCard className="size-4 text-brand-600" />
              3. Payment Method (Demo Simulator)
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'mock_online'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mock_online"
                    checked={paymentMethod === 'mock_online'}
                    onChange={() => setPaymentMethod('mock_online')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Instant Mock Card / Online Payment (Pre-Authorized)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulated VISA ending in •••• 4242 (Instant confirmation)
                    </span>
                  </div>
                </div>
                <Badge tone="success" className="text-[10px]">
                  Simulated
                </Badge>
              </label>

              <label
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'mock_upi'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mock_upi"
                    checked={paymentMethod === 'mock_upi'}
                    onChange={() => setPaymentMethod('mock_upi')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Instant UPI / Net Banking (Fast Mock)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simulated UPI QR & instant settlement
                    </span>
                  </div>
                </div>
                <Badge tone="brand" className="text-[10px]">
                  Instant
                </Badge>
              </label>

              <label
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Cash on Delivery (Pay upon arrival)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pay cash or scan QR when courier delivers package
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">No extra charge</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Col: Order Summary & Place Order */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Order Items ({cart.length})</h4>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 border-b border-slate-200 pb-3 text-xs">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5 text-xs border-b border-slate-200 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery ({deliverySpeed})</span>
                <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Savings Applied</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Total Payable</span>
              <span className="font-bold text-xl text-slate-900">${total.toFixed(2)}</span>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="w-full mt-5 bg-brand-600 hover:bg-brand-700 font-bold gap-2 text-sm shadow-md"
            >
              {submitting ? 'Confirming Order…' : 'Place Demo Order'}
              <ArrowRight className="size-4" />
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="size-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted Healthcare Checkout</span>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
