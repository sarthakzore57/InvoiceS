import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { Employee, Role } from '../types';

export type RegisterInput = {
  name: string;
  mobile: string;
  email: string;
  password: string;
  employeeId: string;
};

export async function createEmployeeAsAdmin(data: RegisterInput) {
  const admin = auth.currentUser;
  if (!admin) throw new Error('Admin session has expired');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${import.meta.env.VITE_FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.email, password: data.password, returnSecureToken: true }),
  });
  const account = await response.json() as { localId?: string; error?: { message?: string } };
  if (!response.ok || !account.localId) throw new Error(account.error?.message?.replace(/_/g, ' ') ?? 'Could not create employee account');
  await setDoc(doc(db, 'employees', account.localId), {
    uid: account.localId,
    employeeId: data.employeeId,
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    role: 'employee' satisfies Role,
    createdAt: serverTimestamp(),
  });
  return account.localId;
}

export async function loginEmployee(email: string, password: string) {
  const loginEmail = email.trim().toLowerCase() === 'snaxlay' ? 'snaxlay@snaxlay.local' : email;
  return signInWithEmailAndPassword(auth, loginEmail, password);
}

export async function logoutEmployee() {
  return signOut(auth);
}

export async function getEmployeeProfile(user: User) {
  const snap = await getDoc(doc(db, 'employees', user.uid));
  if (!snap.exists()) return null;
  return snap.data() as Employee;
}
