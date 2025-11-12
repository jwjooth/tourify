// src/data/favoriteApi.ts

import { db, auth } from "../firebase/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, // Untuk membuat dokumen user pertama kali
  updateDoc, 
  arrayUnion, // Menambahkan item ke array (tanpa duplikasi)
  arrayRemove // Menghapus item dari array
} from "firebase/firestore";

// Tipe data yang akan disimpan di Firestore
interface UserFavorites {
  favoriteAttractions: string[];
  // Anda bisa menambahkan field lain di sini, misal: nama pengguna
}

/**
 * Helper untuk mendapatkan ID pengguna saat ini. 
 * Melempar error jika tidak login.
 */
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Pengguna belum login.");
  }
  return user.uid;
}

/**
 * Mendapatkan daftar ID atraksi favorit untuk pengguna yang sedang login.
 */
export async function getFavorites(): Promise<string[]> {
  const userId = getCurrentUserId();
  // Referensi ke dokumen user: /users/{userId}
  const userDocRef = doc(db, "users", userId);
  
  try {
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserFavorites;
      // Memastikan 'favoriteAttractions' adalah array, default array kosong jika tidak ada
      return data.favoriteAttractions || []; 
    } else {
      // Dokumen belum ada, berarti belum ada favorit
      return [];
    }
  } catch (error) {
    console.error("Gagal mengambil daftar favorit:", error);
    // Masih kembalikan array kosong agar UI tidak crash
    return []; 
  }
}

/**
 * Mengecek apakah suatu atraksi adalah favorit pengguna yang sedang login.
 */
export async function isFavorite(attractionId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(attractionId);
}

/**
 * Menambahkan atau menghapus ID atraksi dari daftar favorit di Firestore.
 * @returns boolean: true jika atraksi sekarang favorit, false jika tidak.
 */
export async function toggleFavorite(attractionId: string, newStatus: boolean): Promise<boolean> {
  const userId = getCurrentUserId();
  const userDocRef = doc(db, "users", userId);
  
  const isCurrentlyFavorite = await isFavorite(attractionId);

  try {
    if (isCurrentlyFavorite) {
      // HAPUS: Menggunakan arrayRemove untuk menghapus ID dari array
      await updateDoc(userDocRef, {
        favoriteAttractions: arrayRemove(attractionId)
      });
      console.log(`[FIREBASE] ${attractionId} dihapus dari favorit ${userId}.`);
      return false;
      
    } else {
      // TAMBAH: Menggunakan arrayUnion untuk menambahkan ID ke array (mencegah duplikasi)
      
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        // Jika dokumen user belum ada, buat dokumen baru (otomatis)
        await setDoc(userDocRef, {
          favoriteAttractions: [attractionId],
        } as UserFavorites);
      } else {
        // Jika dokumen sudah ada, update array
        await updateDoc(userDocRef, {
          favoriteAttractions: arrayUnion(attractionId)
        });
      }
      
      console.log(`[FIREBASE] ${attractionId} ditambahkan ke favorit ${userId}.`);
      return true;
    }
  } catch (error) {
    console.error("Gagal mengubah status favorit:", error);
    throw new Error("Gagal menyimpan perubahan favorit ke database.");
  }
}