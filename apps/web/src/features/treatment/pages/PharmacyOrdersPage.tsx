import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { ShoppingBag, Truck, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function PharmacyOrdersPage() {
  const navigate = useNavigate();
  const { orders } = useTreatmentStore();

  return (
    <>
      <PageHeader
        title="Pharmacy Orders & Tracking"
        description="Monitor status, prescription validation, delivery courier progress, and receipts for your medications."
        actions={
          <Link to="/patient/pharmacy">
            <Button className="gap-1.5 font-semibold">
              <ShoppingBag className="size-4" />
              Order Medicines
            </Button>
          </Link>
        }
      />

      <TreatmentFlowBanner currentStep="pharmacy" />

      <div className="space-y-4">
        {orders.map((order) => {
          const statusLabels: Record<string, { label: string; tone: 'brand' | 'warning' | 'success' | 'neutral' }> = {
            pending_review: { label: 'Pending Pharmacist Review', tone: 'warning' },
            confirmed: { label: 'Prescription Verified', tone: 'brand' },
            packed: { label: 'Packed & Dispatched', tone: 'brand' },
            out_for_delivery: { label: 'Out for Delivery (En Route)', tone: 'warning' },
            delivered: { label: 'Delivered', tone: 'success' },
          };

          const statusInfo = statusLabels[order.status] ?? { label: order.status, tone: 'neutral' };

          return (
            <Card key={order.id} className="p-5 transition-shadow hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{order.orderNumber}</h3>
                      <Badge tone={statusInfo.tone}>● {statusInfo.label}</Badge>
                      {order.prescriptionAttached && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="size-3" /> Rx Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {new Date(order.date).toLocaleDateString()} at{' '}
                      {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <span className="font-bold text-base text-slate-900">${order.total.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items ({order.deliverySpeed} delivery)
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                {order.items.map((i, idx) => (
                  <span key={idx} className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-800">
                    {i.product.name} × {i.quantity}
                  </span>
                ))}
              </div>

              {/* Delivery footer & Track link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Truck className="size-4 text-brand-600" />
                  Delivering to: <strong className="text-slate-800">{order.deliveryAddress.street}, {order.deliveryAddress.city}</strong>
                </span>

                <Button
                  size="sm"
                  onClick={() => navigate(`/patient/pharmacy/orders/${order.id}`)}
                  className="bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5 text-xs"
                >
                  <span>Track Delivery Timeline</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
            <ShoppingBag className="size-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No pharmacy orders yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Order your medicines from the online pharmacy and track door-to-door delivery.
            </p>
            <Link to="/patient/pharmacy">
              <Button size="sm" className="mt-4">
                Explore Pharmacy
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
