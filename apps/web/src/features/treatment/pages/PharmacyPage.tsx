import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore, PHARMACY_CATALOG } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Pill,
  ShieldCheck,
  Star,
  Plus,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import type { PharmacyProduct } from '../types';

export function PharmacyPage() {
  const navigate = useNavigate();
  const { cart, prescriptions } = useTreatmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rxOnly, setRxOnly] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const activeRx = prescriptions.find((p) => p.status === 'active');

  const filteredProducts = PHARMACY_CATALOG.filter((prod) => {
    if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
    if (rxOnly && !prod.requiresPrescription) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(q) ||
      prod.genericName.toLowerCase().includes(q) ||
      prod.brand.toLowerCase().includes(q) ||
      prod.description.toLowerCase().includes(q)
    );
  });

  const handleAddToCart = (product: PharmacyProduct) => {
    treatmentStore.addToCart(product, 1, activeRx?.id);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleAddAllFromPrescription = () => {
    if (activeRx) {
      treatmentStore.loadPrescriptionIntoPharmacyCart(activeRx.id);
      void navigate('/patient/pharmacy/cart');
    }
  };

  return (
    <>
      <PageHeader
        title="Online Pharmacy & Doorstep Delivery"
        description="Search licensed prescription medicines, chronic care supplies, and wellness essentials delivered to your door."
        actions={
          <Button
            onClick={() => navigate('/patient/pharmacy/cart')}
            className="gap-2 relative"
          >
            <ShoppingBag className="size-4" />
            <span>Cart ({cartTotalCount})</span>
            {cartTotalCount > 0 && (
              <span className="font-bold text-xs bg-white text-brand-700 px-1.5 py-0.2 rounded-full">
                ${cartSubtotal.toFixed(2)}
              </span>
            )}
          </Button>
        }
      />

      {/* Connected Treatment Flow Stepper */}
      <TreatmentFlowBanner currentStep="pharmacy" />

      {/* Prescription Quick-Load Alert Banner */}
      {activeRx ? (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 via-white to-sky-50 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
                Rx
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Active Doctor Prescription Available (#{activeRx.id.toUpperCase()})
                  </h3>
                  <Badge tone="success" className="gap-1 text-[11px]">
                    <ShieldCheck className="size-3" /> Pharmacist Verified
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Issued by {activeRx.doctorName} for {activeRx.diagnosis}. Prescribed items:{' '}
                  <span className="font-semibold text-slate-800">
                    {activeRx.items.map((i) => i.medicineName).join(', ')}
                  </span>
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleAddAllFromPrescription}
              className="bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5 shrink-0 text-xs shadow-xs"
            >
              <ShoppingBag className="size-3.5" />
              <span>Add All Prescribed Meds to Cart</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Search and Filters Toolbar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, brand, or generic..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-center">
            <input
              type="checkbox"
              checked={rxOnly}
              onChange={(e) => setRxOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Prescription Required Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'cardiac', label: 'Cardiovascular & BP' },
            { id: 'diabetes', label: 'Diabetes Care' },
            { id: 'antibiotics', label: 'Antibiotics' },
            { id: 'pain', label: 'Pain & Relief' },
            { id: 'vitamins', label: 'Vitamins & Supplements' },
            { id: 'devices', label: 'Medical Devices' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const isAdded = addedProductId === product.id;
          const cartItem = cart.find((c) => c.product.id === product.id);

          return (
            <Card
              key={product.id}
              className="flex flex-col justify-between p-4 transition-all hover:shadow-md hover:border-brand-300"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {product.categoryLabel}
                  </span>
                  {product.requiresPrescription ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      Rx Required
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                      OTC
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-center h-28 rounded-xl bg-slate-50 border border-slate-100 text-slate-400">
                  <Pill className="size-12 text-brand-600/70" />
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {product.brand} • {product.packSize}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Price and Cart button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-base">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 line-through ml-1.5">
                    ${product.mrp.toFixed(2)}
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  className={`text-xs gap-1 font-semibold transition-all ${
                    isAdded ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 className="size-3.5" /> Added!
                    </>
                  ) : cartItem ? (
                    <>
                      <Plus className="size-3.5" /> In Cart ({cartItem.quantity})
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" /> Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar if items exist */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-2xl mx-auto rounded-2xl bg-slate-900 text-white p-4 shadow-2xl z-40 flex items-center justify-between border border-slate-800 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-white">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'} in your cart
              </p>
              <p className="text-xs text-slate-400">
                Subtotal: <span className="font-bold text-white">${cartSubtotal.toFixed(2)}</span>
                {cartSubtotal > 30 ? ' • Free Express Delivery' : ' • Standard Delivery $3.50'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/patient/pharmacy/cart')}
            className="bg-brand-500 hover:bg-brand-400 text-white font-bold gap-1.5 text-xs shadow-md"
          >
            <span>View Cart & Checkout</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}
