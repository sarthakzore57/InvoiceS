import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { productCatalog, type CatalogProduct } from '../types';

const productsRef = collection(db, 'products');

export async function getCatalogProducts() {
  const snapshot = await getDocs(productsRef);
  if (snapshot.empty) {
    const batch = writeBatch(db);
    productCatalog.forEach((product) => {
      batch.set(doc(db, 'products', product.id), { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
    return productCatalog;
  }

  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as CatalogProduct)
    .sort((a, b) => a.productName.localeCompare(b.productName) || a.variant.localeCompare(b.variant, undefined, { numeric: true }));
}

export async function updateProductMrp(id: string, mrp: number) {
  await updateDoc(doc(db, 'products', id), { mrp, updatedAt: serverTimestamp() });
}

export async function addCatalogProduct(product: CatalogProduct) {
  await setDoc(doc(db, 'products', product.id), { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function deleteCatalogProduct(id: string) { await deleteDoc(doc(db, 'products', id)); }
