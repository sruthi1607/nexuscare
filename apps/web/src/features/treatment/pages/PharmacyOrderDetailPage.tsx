import { useParams, Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Package,
  ArrowLeft,
  FastForward,
  Building2,
} from 'lucide-react';

export function PharmacyOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useTreatmentStore();

  const order = orders.find((o) => o.id === id) ?? orders[0];

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Order not found.</p>
        <Link to="/patient/pharmacy/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const handleAdvanceStatus = () => {
    treatmentStore.advanceOrderStatus(order.id);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/patient/pharmacy/orders"
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <Badge
              tone={
                order.status === 'delivered'
                  ? 'success'
                  : order.status === 'out_for_delivery'
                    ? 'warning'
                    : 'brand'
              }
              className="capitalize"
            >
              ● {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Placed on {new Date(order.date).toLocaleDateString()} at{' '}
            {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Demo Simulation Action Button */}
        <div className="flex items-center gap-2">
          {order.status !== 'delivered' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdvanceStatus}
              className="gap-1.5 text-xs bg-brand-50 hover:bg-brand-100 border-brand-300 text-brand-800 font-semibold"
              title="Advance this order to the next step for testing"
            >
              <FastForward className="size-3.5 text-brand-600" />
              <span>Simulate Next Stage →</span>
            </Button>
          ) : (
            <Badge tone="success" className="gap-1">
              <CheckCircle2 className="size-3.5" /> Order Completed & Delivered
            </Badge>
          )}
        </div>
      </div>

      <TreatmentFlowBanner currentStep="pharmacy" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Visual Tracking Stepper */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Truck className="size-5 text-brand-600" />
                Live Order & Delivery Timeline
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Speed: <strong className="text-slate-800 capitalize">{order.deliverySpeed} Delivery</strong>
              </span>
            </div>

            {/* Vertical Visual Stepper */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.trackingSteps.map((step, idx) => {
                const isCompleted = step.completed;
                const isActive = step.active;

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Icon Badge */}
                    <div
                      className={`absolute -left-6 flex size-6 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                            ? 'bg-brand-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isActive
                              ? 'text-brand-700'
                              : isCompleted
                                ? 'text-slate-900'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.time ? (
                          <span className="text-xs text-slate-400 font-mono">{step.time}</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Delivery Agent & OTP Details (when out for delivery or active) */}
          {order.deliveryAgent && (
            <Card className="p-5 bg-gradient-to-r from-sky-50/50 via-white to-brand-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {order.deliveryAgent.name} (Delivery Partner)
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{order.deliveryAgent.vehicle}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Phone className="size-3 text-slate-400" />
                        {order.deliveryAgent.phone}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-200 bg-white p-3 text-center shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Delivery Handover OTP
                  </span>
                  <span className="text-xl font-mono font-extrabold text-brand-700 tracking-wider">
                    {order.deliveryAgent.otp}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Col: Order Receipt & Delivery Details */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Order Receipt</h4>

            <div className="space-y-3 border-b border-slate-200 pb-3 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{item.product.name}</p>
                    <p className="text-slate-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5 text-xs border-b border-slate-200 pb-3 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-lg text-brand-900">${order.total.toFixed(2)}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
              <div>
                <span className="font-semibold text-slate-700 block">Payment Method:</span>
                <span className="capitalize text-slate-900">
                  {order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block">Shipping Address:</span>
                <p className="text-slate-900 mt-0.5">
                  {order.deliveryAddress.fullName}<br />
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                  Phone: {order.deliveryAddress.phone}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
