import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  Firestore,
  query,
  orderBy
} from 'firebase/firestore';
import { MenuItem, Order } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// 1. Get configuration from environment variables or localStorage with a default fallback
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // Check localStorage first
  const localConfig = localStorage.getItem('outpost_firebase_config');
  if (localConfig) {
    try {
      const parsed = JSON.parse(localConfig);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return parsed as FirebaseConfig;
      }
    } catch (e) {
      console.warn('Failed to parse local firebase config', e);
    }
  }

  // Check env variables safely for TS
  const metaEnv = (import.meta as any).env || {};
  const envConfig = {
    apiKey: metaEnv.VITE_FIREBASE_API_KEY || '',
    authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: metaEnv.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.projectId && envConfig.apiKey) {
    return envConfig;
  }

  // Fallback to the user's default Firebase project
  return {
    apiKey: "AIzaSyCfy3UDdBRxre1KtOPUSmhPlczxcjqOzpg",
    authDomain: "outpost-coffe.firebaseapp.com",
    projectId: "outpost-coffe",
    storageBucket: "outpost-coffe.firebasestorage.app",
    messagingSenderId: "555755094446",
    appId: "1:555755094446:web:10037f0445a9c810cf483f"
  };
}

export function saveFirebaseConfig(config: FirebaseConfig | null) {
  if (config) {
    localStorage.setItem('outpost_firebase_config', JSON.stringify(config));
  } else {
    localStorage.removeItem('outpost_firebase_config');
  }
}

// 2. Safe lazy initialization
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp; db: Firestore } | null {
  const config = getStoredFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, db: firestoreDb };
  } catch (error) {
    console.error('Failed to initialize Firebase SDK:', error);
    return null;
  }
}

export function isFirebaseConnected(): boolean {
  return getStoredFirebaseConfig() !== null;
}

// 3. Helper to recursively strip undefined values for Firestore
function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined) return null as any;
  if (val === null) return null as any;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore) as any;
  }
  if (typeof val === 'object') {
    // Check if it's a plain object
    const res: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key) && val[key] !== undefined) {
        res[key] = sanitizeForFirestore(val[key]);
      }
    }
    return res;
  }
  return val;
}

// 4. Firestore synchronizations
export async function uploadMenuToFirebase(menu: MenuItem[]): Promise<boolean> {
  const fb = initFirebase();
  if (!fb) return false;

  try {
    const { db } = fb;
    const batch = writeBatch(db);
    
    // Save each menu item
    menu.forEach((item) => {
      const itemRef = doc(db, 'menu', item.id);
      const sanitized = sanitizeForFirestore(item);
      batch.set(itemRef, sanitized, { merge: true });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error uploading menu to Firebase:', error);
    return false;
  }
}

export async function uploadOrderToFirebase(order: Order): Promise<boolean> {
  const fb = initFirebase();
  if (!fb) return false;

  try {
    const { db } = fb;
    const orderRef = doc(db, 'orders', order.id);
    const sanitized = sanitizeForFirestore(order);
    await setDoc(orderRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Error uploading order to Firebase:', error);
    return false;
  }
}

export async function uploadAllOrdersToFirebase(orders: Order[]): Promise<boolean> {
  const fb = initFirebase();
  if (!fb) return false;

  try {
    const { db } = fb;
    const batch = writeBatch(db);

    orders.forEach((order) => {
      const orderRef = doc(db, 'orders', order.id);
      const sanitized = sanitizeForFirestore(order);
      batch.set(orderRef, sanitized, { merge: true });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error uploading all orders to Firebase:', error);
    return false;
  }
}

// 4. Listeners for real-time synchronization
export function subscribeToMenu(onUpdate: (menu: MenuItem[]) => void): () => void {
  const fb = initFirebase();
  if (!fb) return () => {};

  const menuCol = collection(fb.db, 'menu');
  
  return onSnapshot(menuCol, (snapshot) => {
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as MenuItem);
    });
    
    onUpdate(items);
  }, (error) => {
    console.error('Error listening to menu changes:', error);
  });
}

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  const fb = initFirebase();
  if (!fb) return () => {};

  const ordersCol = collection(fb.db, 'orders');
  
  return onSnapshot(ordersCol, (snapshot) => {
    const ordersList: Order[] = [];
    snapshot.forEach((doc) => {
      ordersList.push(doc.data() as Order);
    });
    
    // Sort orders by date descending
    ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(ordersList);
  }, (error) => {
    console.error('Error listening to orders changes:', error);
  });
}
