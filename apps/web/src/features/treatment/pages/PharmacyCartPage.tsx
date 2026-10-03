import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Pill,
  ArrowLeft,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export function PharmacyCartPage() {
  const navigate = useNavigate();
  const { cart, prescriptions } = useTreatmentStore();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 3.5;
  const discount = subtotal > 50 ? 5.0 : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const activeRx = prescriptions.find((p) => p.status === 'active');
  const hasRxItem = cart.some((item) => item.product.requiresPrescription);

  return (
    <>
      <PageHeader
        title="Pharmacy Cart & Review"
        description="Verify your prescribed items, quantities, and delivery options before checkout."
      />

      <TreatmentFlowBanner currentStep="pharmacy" />

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
          <ShoppingBag className="size-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">Your cart is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse our pharmacy catalogue or load your doctor’s prescribed medications in one click.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/patient/pharmacy">
              <Button className="gap-1.5 font-semibold">
                Browse Medicines
              </Button>
            </Link>
            <Link to="/patient/prescriptions">
              <Button variant="outline" className="gap-1.5">
                View Prescriptions
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prescription Attached Banner */}
            {hasRxItem && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Prescription Attached:</strong> {activeRx?.id ? `Rx #${activeRx.id.toUpperCase()} by ${activeRx.doctorName}` : 'Digital Rx on file (Valid)'}
                  </span>
                </div>
                <Badge tone="success" className="text-[10px]">
                  Verified
                </Badge>
              </div>
            )}

            {/* Items list */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-700">
                      <Pill className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{item.product.name}</h4>
                        {item.product.requiresPrescription ? (
                          <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                            Rx
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.product.brand} • {item.product.packSize}
                      </p>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          treatmentStore.updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 rounded text-slate-600 hover:bg-white transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          treatmentStore.updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 rounded text-slate-600 hover:bg-white transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-16">
                      <span className="font-bold text-slate-900 text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => treatmentStore.removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <Link
                to="/patient/pharmacy"
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
              >
                <ArrowLeft className="size-3.5" /> Continue Shopping
              </Link>
              <button
                type="button"
                onClick={() => treatmentStore.clearCart()}
                className="text-rose-600 hover:underline"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 text-base mb-4">Order Summary</h3>

              <div className="space-y-2 text-xs border-b border-slate-200 pb-3">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="size-3.5 text-slate-400" />
                    Delivery Fee
                  </span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-700">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promotional Savings</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-base">Total Amount</span>
                <span className="font-bold text-xl text-slate-900">${total.toFixed(2)}</span>
              </div>

              <Button
                onClick={() => navigate('/patient/pharmacy/checkout')}
                className="w-full mt-5 bg-brand-600 hover:bg-brand-700 font-bold gap-2 text-sm"
              >
                <span>Proceed to Demo Checkout</span>
                <ArrowRight className="size-4" />
              </Button>

              <div className="mt-4 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1 text-slate-700 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> 100% Genuine Certified Medicines
                </p>
                <p>Delivered in cold-chain tamper-proof packaging within 2 hours.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
