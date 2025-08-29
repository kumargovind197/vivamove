import { storage } from './firebase'; // Import the initialized storage instance
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param file The File object to upload.
 * @param path The storage path, e.g., 'logos/clinic-id.png' or 'ads/popup/ad-id.jpg'.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
}

/**
 * Deletes a file from Firebase Storage.
 * @param url The public download URL of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFile(url: string): Promise<void> {
    const fileRef = ref(storage, url); // ref() can also accept a gs:// or http:// URL
    await deleteObject(fileRef);
}