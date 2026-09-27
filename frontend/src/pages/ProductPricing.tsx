import { Plus, Save, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { addCatalogProduct, getCatalogProducts, updateProductMrp } from '../services/productService';
import type { CatalogProduct } from '../types';

export default function ProductPricing() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', weight: '', mrp: '' });

  useEffect(() => {
    getCatalogProducts().then(setProducts).catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load product pricing'));
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => `${product.productName} ${product.variant}`.toLowerCase().includes(search.toLowerCase())), [products, search]);

  async function saveMrp({ product, value }: { product: CatalogProduct; value: string }) {
    const mrp = Number(value);
    if (!Number.isFinite(mrp) || mrp < 0) return toast.error('MRP must be a valid positive amount');
    setSaving(product.id);
    try {
      await updateProductMrp(product.id, mrp);
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, mrp } : item));
      toast.success(`${product.productName} ${product.variant} MRP updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update MRP');
    } finally {
      setSaving('');
    }
  }

  async function createProduct() {
    const weight = Number(newProduct.weight);
    const mrp = Number(newProduct.mrp);
    if (!newProduct.name.trim() || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(mrp) || mrp < 0) return toast.error('Enter product name, weight, and MRP');
    const product: CatalogProduct = {
      id: `${newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-${weight}`,
      productName: newProduct.name.trim(), variant: `${weight}g`, category: newProduct.name.trim(), unit: 'Pcs', mrp,
    };
    try {
      await addCatalogProduct(product);
      setProducts((current) => [...current.filter((item) => item.id !== product.id), product]);
      setNewProduct({ name: '', weight: '', mrp: '' });
      toast.success('Product added to the price list');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add product');
    }
  }

  return <div className="space-y-4 sm:space-y-5">
    <div><h1 className="text-xl font-black tracking-tight sm:text-2xl">Product MRP</h1><p className="text-sm text-slate-500 dark:text-slate-400">Set the MRP for every product and weight. Invoice rows use these values by default.</p></div>
    <section className="panel grid gap-3 lg:grid-cols-[1fr_150px_150px_auto]">
      <input className="field" placeholder="Product name" value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} />
      <input className="field" type="number" min="1" placeholder="Weight (g)" value={newProduct.weight} onChange={(event) => setNewProduct({ ...newProduct, weight: event.target.value })} />
      <input className="field" type="number" min="0" placeholder="MRP" value={newProduct.mrp} onChange={(event) => setNewProduct({ ...newProduct, mrp: event.target.value })} />
      <button className="btn-primary" onClick={createProduct}><Plus size={18} />Add Product</button>
    </section>
    <section className="panel">
      <div className="relative mb-4 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="field pl-10" placeholder="Find product or weight" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Product</th><th className="px-3 py-2">Weight</th><th className="px-3 py-2">MRP</th><th className="px-3 py-2" /></tr></thead><tbody>{visibleProducts.map((product) => <PriceRow key={product.id} product={product} saving={saving === product.id} onSave={saveMrp} />)}</tbody></table></div>
    </section>
  </div>;
}

function PriceRow({ product, saving, onSave }: { product: CatalogProduct; saving: boolean; onSave: Function }) {
  const [value, setValue] = useState(String(product.mrp));
  useEffect(() => setValue(String(product.mrp)), [product.mrp]);
  return <tr className="border-t border-slate-100 dark:border-slate-800"><td className="px-3 py-3 font-bold">{product.productName}</td><td className="px-3 py-3">{product.variant}</td><td className="px-3 py-2"><input className="field max-w-44" type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} /></td><td className="px-3 py-2"><button className="icon-btn" onClick={() => onSave({ product, value })} disabled={saving} title="Save MRP"><Save size={16} /></button></td></tr>;
}
