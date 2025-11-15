import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  CollectionReference,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Instructor } from '../types';

const INSTRUCTORS_COLLECTION = 'instructors';

/**
 * Get reference to the instructors collection
 */
function getInstructorsCollection(): CollectionReference {
  return collection(db, INSTRUCTORS_COLLECTION);
}

/**
 * Get reference to a specific instructor document
 */
function getInstructorDocRef(instructorId: string): DocumentReference {
  return doc(db, INSTRUCTORS_COLLECTION, instructorId);
}

/**
 * Convert Firestore document to Instructor type
 */
function firestoreDocToInstructor(docId: string, data: any): Instructor {
  return {
    id: docId,
    name: data.name || '',
    title: data.title || '',
    email: data.email || '',
    phone: data.phone || undefined,
    bio: data.bio || '',
    image: data.image || '',
    experience: data.experience || 0,
    expertise: data.expertise || [],
    socialLinks: data.socialLinks || {
      linkedin: '',
      twitter: '',
      website: ''
    },
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt || Date.now())
  };
}

/**
 * Convert Instructor to Firestore document format
 */
function instructorToFirestoreDoc(instructor: Omit<Instructor, 'id' | 'createdAt'> & { createdAt?: Date | Timestamp }): any {
  return {
    name: instructor.name,
    title: instructor.title,
    email: instructor.email,
    phone: instructor.phone || null,
    bio: instructor.bio,
    image: instructor.image,
    experience: instructor.experience,
    expertise: instructor.expertise || [],
    socialLinks: instructor.socialLinks || {
      linkedin: '',
      twitter: '',
      website: ''
    },
    createdAt: instructor.createdAt instanceof Timestamp
      ? instructor.createdAt
      : Timestamp.fromDate(new Date(instructor.createdAt || Date.now())),
    updatedAt: Timestamp.now()
  };
}

/**
 * Fetch all instructors from Firestore
 */
export async function getAllInstructorsFromFirestore(): Promise<Instructor[]> {
  try {
    const instructorsRef = getInstructorsCollection();
    const snapshot = await getDocs(instructorsRef);
    
    const instructors: Instructor[] = [];
    snapshot.forEach((doc) => {
      instructors.push(firestoreDocToInstructor(doc.id, doc.data()));
    });

    return instructors;
  } catch (error) {
    console.error('Error fetching instructors from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch a single instructor by ID
 */
export async function getInstructorFromFirestore(instructorId: string): Promise<Instructor | null> {
  try {
    const docRef = getInstructorDocRef(instructorId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return firestoreDocToInstructor(snapshot.id, snapshot.data());
  } catch (error) {
    console.error('Error fetching instructor from Firestore:', error);
    throw error;
  }
}

/**
 * Create a new instructor in Firestore
 */
export async function createInstructorInFirestore(
  instructorData: Omit<Instructor, 'id' | 'createdAt'>
): Promise<Instructor> {
  try {
    const instructorsRef = getInstructorsCollection();
    
    const firestoreData = instructorToFirestoreDoc(instructorData);
    const docRef = await addDoc(instructorsRef, firestoreData);

    return {
      ...instructorData,
      id: docRef.id,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating instructor in Firestore:', error);
    throw error;
  }
}

/**
 * Update an existing instructor in Firestore
 */
export async function updateInstructorInFirestore(
  instructorId: string,
  instructorData: Partial<Omit<Instructor, 'id' | 'createdAt'>>
): Promise<Instructor> {
  try {
    const docRef = getInstructorDocRef(instructorId);
    
    // Fetch current instructor to preserve createdAt
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error('Instructor not found');
    }

    const currentData = currentDoc.data();
    const updatedData = instructorToFirestoreDoc({
      ...currentData,
      ...instructorData
    } as any);

    await updateDoc(docRef, updatedData);

    // Fetch and return the updated instructor
    const updatedInstructor = await getInstructorFromFirestore(instructorId);
    if (!updatedInstructor) {
      throw new Error('Failed to retrieve updated instructor');
    }

    return updatedInstructor;
  } catch (error) {
    console.error('Error updating instructor in Firestore:', error);
    throw error;
  }
}

/**
 * Delete an instructor from Firestore
 */
export async function deleteInstructorFromFirestore(instructorId: string): Promise<void> {
  try {
    const docRef = getInstructorDocRef(instructorId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting instructor from Firestore:', error);
    throw error;
  }
}

/**
 * Get instructor by email
 */
export async function getInstructorByEmailFromFirestore(email: string): Promise<Instructor | null> {
  try {
    const instructorsRef = getInstructorsCollection();
    const q = query(instructorsRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return firestoreDocToInstructor(doc.id, doc.data());
  } catch (error) {
    console.error('Error fetching instructor by email from Firestore:', error);
    throw error;
  }
}
