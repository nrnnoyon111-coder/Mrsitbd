import React, { useState } from 'react';
import {
  ShoppingBag,
  Package,
  Plus,
  AlertTriangle,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Check,
  Printer,
  X,
  TrendingUp,
} from 'lucide-react';
import { Product, Sale, SaleItem } from '../../types';
import { useToast } from '../Toast';
import { CopyButton } from '../CopyButton';

interface SalesModuleProps {
  products: Product[];
  sales: Sale[];
  onAddProduct: (product: Product) => void;
  onAddSale: (sale: Sale) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  products,
  sales,
  onAddProduct,
  onAddSale,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'inventory' | 'pos' | 'invoices'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Power Semiconductors');
  const [prodUnit, setProdUnit] = useState('Pcs');
  const [prodPurchasePrice, setProdPurchasePrice] = useState<number>(1200);
  const [prodSalePrice, setProdSalePrice] = useState<number>(1800);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodLocation, setProdLocation] = useState('Rack 1');

  // POS / New Sale state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posCompany, setPosCompany] = useState('');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaidAmount, setPosPaidAmount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState('Cash');

  // Low stock products count
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartGrandTotal = Math.max(0, cartSubtotal - posDiscount);
  const cartDue = Math.max(0, cartGrandTotal - posPaidAmount);

  const handleAddToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }
    const existingIndex = cart.findIndex((i) => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      if (updated[existingIndex].quantity >= product.currentStock) {
        showToast(`Cannot add more than available stock (${product.currentStock}).`, 'error');
        return;
      }
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.salePrice,
          total: product.salePrice,
        },
      ]);
    }
    showToast(`Added ${product.name} to cart.`, 'info');
  };

  const handleRemoveFromCart = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName.trim(),
          category: prodCategory,
          unit: prodUnit,
          purchasePrice: prodPurchasePrice,
          salePrice: prodSalePrice,
          openingStock: prodStock,
          currentStock: prodStock,
          minStockLevel: 5,
          location: prodLocation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onAddProduct(data.product);
        showToast(`Product ${data.product.name} added!`, 'success');
        setShowAddProductModal(false);
        setProdName('');
      }
    } catch (err) {
      showToast('Failed to add product', 'error');
    }
  };

  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Please add items to cart before completing sale.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: posCustomerName || 'Walk-in Cash Customer',
          customerPhone: posCustomerPhone,
          company: posCompany,
          items: cart,
          subtotal: cartSubtotal,
          discount: posDiscount,
          paidAmount: posPaidAmount || cartGrandTotal,
          paymentMethod: posPaymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onAddSale(data.sale);
        showToast(`Invoice ${data.sale.invoiceNo} generated for ৳${data.sale.grandTotal}!`, 'success');
        setCart([]);
        setPosCustomerName('');
        setPosCustomerPhone('');
        setPosCompany('');
        setPosDiscount(0);
        setPosPaidAmount(0);
        setTab('invoices');
      }
    } catch (err) {
      showToast('Failed to record sale', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Tab Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Industrial Parts Sales & Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Microchip components, IGBT modules, IPM drivers, and POS invoices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === 'inventory' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Inventory ({products.length})
            </button>
            <button
              onClick={() => setTab('pos')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === 'pos' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              + POS Sales Entry
            </button>
            <button
              onClick={() => setTab('invoices')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === 'invoices' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Invoices ({sales.length})
            </button>
          </div>

          {tab === 'inventory' && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && tab === 'inventory' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Low Stock Alert:</strong> {lowStockProducts.length} items are at or below reorder threshold (≤5 units remaining).
            </span>
          </div>
          <span className="font-mono text-amber-700 font-bold">
            {lowStockProducts.map((p) => p.productId).join(', ')}
          </span>
        </div>
      )}

      {/* TAB 1: INVENTORY TABLE */}
      {tab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Part Name, ID, Category..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total Stock Valuation: ৳
              {products.reduce((s, p) => s + p.currentStock * p.salePrice, 0).toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Part ID</th>
                  <th className="py-3 px-4">Component Name & Category</th>
                  <th className="py-3 px-4 text-right">Purchase Price</th>
                  <th className="py-3 px-4 text-right">Sales Price</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) =>
                    searchTerm
                      ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.productId.toLowerCase().includes(searchTerm.toLowerCase())
                      : true
                  )
                  .map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {prod.productId}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-slate-400">{prod.category}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        ৳{prod.purchasePrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ৳{prod.salePrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            prod.currentStock <= prod.minStockLevel
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : prod.currentStock <= 15
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {prod.currentStock} {prod.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {prod.location}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            handleAddToCart(prod);
                            setTab('pos');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] cursor-pointer"
                        >
                          + Sell
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: POS SALES ENTRY */}
      {tab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Product Selector (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Select Industrial Spare Parts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{p.productId}</span>
                      <span className={p.currentStock <= p.minStockLevel ? 'text-rose-600 font-bold' : ''}>
                        Stock: {p.currentStock}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-1 leading-snug group-hover:text-blue-600">
                      {p.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-mono font-bold text-slate-800">৳{p.salePrice}</span>
                    <span className="text-[10px] font-semibold text-blue-600">+ Add</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart & Billing (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <form onSubmit={handleCompleteSale} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-slate-900 text-sm">Sale Cart</h4>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {cart.length} items
                </span>
              </div>

              {/* Cart List */}
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Cart is empty. Click any product on the left to add.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-bold text-slate-800 truncate">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.quantity} × ৳{item.unitPrice}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">৳{item.total}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  placeholder="Customer / Company Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="tel"
                  value={posCustomerPhone}
                  onChange={(e) => setPosCustomerPhone(e.target.value)}
                  placeholder="Customer Phone (for receipt)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {/* Financial calculations */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>৳{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Discount (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={posDiscount}
                    onChange={(e) => setPosDiscount(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-mono text-xs"
                  />
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Grand Total:</span>
                  <span>৳{cartGrandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Complete Sale & Issue Invoice</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 3: INVOICES HISTORY */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Sold</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {sale.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sale.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sale.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ৳{sale.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">
                      ৳{sale.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Spare Part / Semiconductor</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Part / Component Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Fuji IGBT Module 6MBP20RH060"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Power Semiconductors">Power Semiconductors (IGBT/MOSFET)</option>
                    <option value="Optocouplers & Gate Drivers">Optocouplers & Gate Drivers</option>
                    <option value="Sensors & Encoders">Sensors & Encoders</option>
                    <option value="Capacitors">Capacitors</option>
                    <option value="Control Relays">Control Relays</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Purchase Cost (৳)</label>
                  <input
                    type="number"
                    value={prodPurchasePrice}
                    onChange={(e) => setProdPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Selling Price (৳)</label>
                  <input
                    type="number"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={prodLocation}
                    onChange={(e) => setProdLocation(e.target.value)}
                    placeholder="Rack A-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
