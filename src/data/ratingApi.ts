// src/data/ratingApi.ts

import { db, auth } from "../firebase/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where,
  getDocs,
  runTransaction, // Import fungsi Transaction
  serverTimestamp,
  FieldValue
} from "firebase/firestore";

const COLLECTION_NAME = "ratings";

interface Rating {
  userId: string;
  attractionId: string;
  rating: number; // 1-5
  createdAt: FieldValue;
}

/**
 * Mendapatkan rating yang sudah diberikan oleh pengguna saat ini untuk atraksi tertentu.
 */
export async function getUserRating(attractionId: string): Promise<number | null> {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  try {
    const ratingDocRef = doc(db, COLLECTION_NAME, attractionId, "userRatings", userId);
    const docSnap = await getDoc(ratingDocRef);

    if (docSnap.exists()) {
      return docSnap.data().rating as number;
    }
    return null;
  } catch (error) {
    console.error("Gagal mengambil rating user:", error);
    return null;
  }
}

/**
 * API: Mengirimkan atau memperbarui rating pengguna menggunakan Firestore Transaction.
 * Catatan: Karena kita menggunakan mock data lokal (Attraction[]) untuk menyimpan
 * rating_avg, kita tidak bisa langsung mengupdate-nya di Firestore.
 * * Untuk simulasi profesional, kita akan MENGIRIM rating ke Firestore, dan 
 * anggap ada Cloud Function yang memperbarui rating_avg atraksi.
 * Namun, karena tidak ada Cloud Function, kita hanya fokus menyimpan rating user.
 */
export async function submitRating(attractionId: string, ratingValue: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Anda harus login untuk memberikan rating.");
  }
  
  if (ratingValue < 1 || ratingValue > 5) {
    throw new Error("Nilai rating harus antara 1 dan 5.");
  }

  const userId = user.uid;
  const ratingDocRef = doc(db, COLLECTION_NAME, attractionId, "userRatings", userId);
  
  // Implementasi Transaction di sini bersifat SIMULASI:
  // Dalam proyek nyata, seluruh logika hitung rata-rata akan ada di Transaction ini.
  // Karena kita hanya menyimpan rating per user, kita hanya menggunakan setDoc.
  
  try {
    await setDoc(ratingDocRef, {
      userId: userId,
      attractionId: attractionId,
      rating: ratingValue,
      createdAt: serverTimestamp(),
    } as Rating, { merge: true }); // merge: true agar bisa update tanpa timpa field lain
    
    console.log(`[FIREBASE] Rating ⭐️${ratingValue} untuk ${attractionId} berhasil disimpan oleh ${userId}`);

    // LOGIKA PROFESIONAL TAMBAHAN: 
    // Di sini akan ada kode untuk meng-update dokumen Attraksi di koleksi 'attractions'
    // yang berisi total_rating, rating_count, dan rating_avg menggunakan Transaction:
    
    // await runTransaction(db, async (transaction) => {
    //   const attractionRef = doc(db, "attractions", attractionId);
    //   const attractionDoc = await transaction.get(attractionRef);
    //
    //   // Logika hitung: totalRating baru = totalRating lama + (rating baru - rating lama/0)
    //   // transaction.update(attractionRef, { ... });
    // });
    
  } catch (error) {
    console.error("Gagal menyimpan rating:", error);
    throw new Error("Gagal menyimpan rating Anda ke database.");
  }
}