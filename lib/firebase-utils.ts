import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, deleteDoc, DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

// Helper function to convert Firestore document to a typed object with ID
export function convertDoc<T>(doc: DocumentSnapshot<DocumentData>): T & { id: string } {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as T & { id: string };
}

// Helper function to convert Firestore query snapshot to an array of typed objects
export function convertCollection<T>(querySnapshot: QuerySnapshot<DocumentData>): (T & { id: string })[] {
  return querySnapshot.docs.map(doc => convertDoc<T>(doc));
}

// Generic function to get a document by ID
export async function getDocument<T>(collectionName: string, id: string): Promise<T & { id: string } | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertDoc<T>(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to get all documents in a collection
export async function getCollection<T>(collectionName: string): Promise<(T & { id: string })[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return convertCollection<T>(querySnapshot);
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to get documents where a field matches a value
export async function getDocumentsWhere<T>(
  collectionName: string, 
  field: string, 
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=", 
  value: any
): Promise<(T & { id: string })[]> {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return convertCollection<T>(querySnapshot);
  } catch (error) {
    console.error(`Error getting documents where ${field} ${operator} ${value} from ${collectionName}:`, error);
    throw error;
  }
}

// Create or update a document
export async function setDocument<T>(
  collectionName: string, 
  id: string, 
  data: T, 
  merge: boolean = false
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    return await setDoc(docRef, data, { merge });
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
}

// Upload a file to Firebase Storage
export async function uploadFile(
  path: string, 
  file: File
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}