import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { Employee, Role } from '../types';

type RegisterInput = {
  name: string;
  mobile: string;
  email: string;
  password: string;
  employeeId: string;
};

export async function registerEmployee(data: RegisterInput) {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await updateProfile(credential.user, { displayName: data.name });
  await setDoc(doc(db, 'employees', credential.user.uid), {
    uid: credential.user.uid,
    employeeId: data.employeeId,
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    role: 'employee' satisfies Role,
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginEmployee(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutEmployee() {
  return signOut(auth);
}

export async function getEmployeeProfile(user: User) {
  const snap = await getDoc(doc(db, 'employees', user.uid));
  if (!snap.exists()) return null;
  return snap.data() as Employee;
}
