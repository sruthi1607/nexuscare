import { useState } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle2, Search, Filter } from 'lucide-react';
import { useTreatment, PHARMACY_CATALOG } from '../../treatment/treatment-store';

export function AdminPharmacyPage() {
  const { orders } = useTreatment();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('orders');

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pharmacy & Supply Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor catalog stock, prescription validation queue, and order fulfillment.
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'orders', label: 'Orders Fulfillment' },
            { id: 'inventory', label: 'Medicine Catalog' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{order.id}</span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                    {order.prescriptionAttached && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        ✓ Rx Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Placed by Sarah Jenkins • {order.date} • Delivery via {order.deliverySpeed}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Bill</span>
                  <div className="text-base font-extrabold text-slate-900">
                    ${order.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item, idx) => (
                  <span
                    key={item.product.id || idx}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {item.product.name} (Qty: {item.quantity})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PHARMACY_CATALOG.map((prod) => (
            <div key={prod.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{prod.name}</h3>
                  <p className="text-xs text-slate-500">{prod.genericName}</p>
                </div>
                <span className="text-xs font-extrabold text-slate-900">${prod.price}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                <span className="text-slate-500">{prod.dosageForm} • {prod.packSize}</span>
                <span className="font-semibold text-emerald-700">In Stock</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
