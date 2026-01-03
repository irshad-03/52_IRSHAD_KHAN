import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  updatedAt: Date;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile
  await updateProfile(user, { displayName });

  // Send email verification
  await sendEmailVerification(user);

  // Create user document in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    photoURL: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);

  return user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (
  uid: string,
  updates: { displayName?: string; photoURL?: string }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });

  // Also update Firebase Auth profile
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
  }
};

export const uploadProfileImage = async (
  uid: string,
  file: File
): Promise<string> => {
  // Delete old image if exists
  const oldImageRef = ref(storage, `profile-images/${uid}`);
  try {
    await deleteObject(oldImageRef);
  } catch (error) {
    // Ignore if file doesn't exist
  }

  // Upload new image
  const imageRef = ref(storage, `profile-images/${uid}`);
  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);
  
  // Update user profile
  await updateUserProfile(uid, { photoURL: downloadURL });
  
  return downloadURL;
};

export const changePassword = async (newPassword: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  await updatePassword(auth.currentUser, newPassword);
};

