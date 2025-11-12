// src/data/commentApi.ts

import { db, auth } from "../firebase/firebase"; // Import database (db)
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    serverTimestamp, // Waktu dari server, bukan dari browser
    onSnapshot, // Untuk real-time listener
    Unsubscribe // Tipe data untuk fungsi unsubscribe
} from "firebase/firestore";

// 1. Tipe Data untuk Komentar (Sama seperti mock)
export interface Comment {
    id: string;
    attractionId: string;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    content: string;
    // 'createdAt' bisa null saat posting, karena akan diisi oleh server
    createdAt: Date | null;
}

/**
 * 2. Helper untuk mendapatkan info user saat ini
 */
function getCurrentUser(): { uid: string; displayName: string; photoURL: string | null } {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Pengguna belum login. Tidak bisa memposting komentar.");
    }

    const displayName = user.displayName || user.email?.split('@')[0] || "User Anonim";

    return {
        uid: user.uid,
        displayName: displayName,
        photoURL: user.photoURL
    };
}

/**
 * 3. API: Memposting komentar baru (Membutuhkan Login)
 * Ini akan menyimpan data ke koleksi "comments" di Firestore
 */
export async function postComment(attractionId: string, content: string): Promise<void> {
    const currentUser = getCurrentUser(); // Akan error jika tidak login

    const newCommentData = {
        attractionId: attractionId,
        content: content,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        createdAt: serverTimestamp() // PENTING: Gunakan timestamp server
    };

    try {
        const commentsCollection = collection(db, "comments");
        await addDoc(commentsCollection, newCommentData);
        console.log("[FIREBASE] Komentar berhasil diposting oleh", currentUser.uid);
    } catch (error) {
        console.error("Error memposting komentar:", error);
        throw new Error("Gagal memposting komentar.");
    }
}


/**
 * 4. API: Mendengarkan (listen) perubahan komentar secara REAL-TIME
 * Ini adalah cara terbaik untuk menampilkan komentar.
 * Saat ada komentar baru, UI akan update otomatis!
 * * @param attractionId ID atraksi yang ingin didengarkan
 * @param callback Fungsi yang akan dipanggil setiap ada data baru
 * @returns Fungsi 'unsubscribe' untuk berhenti mendengarkan
 */
export function listenToComments(
    attractionId: string,
    callback: (comments: Comment[]) => void
): Unsubscribe {

    // Buat query untuk mengambil komentar yang sesuai
    const commentsCollection = collection(db, "comments");
    const q = query(
        commentsCollection,
        where("attractionId", "==", attractionId),
        orderBy("createdAt", "desc") // Terbaru di atas
    );

    // 'onSnapshot' adalah listener real-time dari Firebase
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsList: Comment[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            commentsList.push({
                id: doc.id, // Ambil ID dokumen
                attractionId: data.attractionId,
                content: data.content,
                userId: data.userId,
                userName: data.userName,
                userPhotoURL: data.userPhotoURL,
                // 'toDate()' mengubah timestamp Firebase menjadi objek Date
                createdAt: data.createdAt ? data.createdAt.toDate() : null
            });
        });

        // Kirim data yang sudah di-format ke komponen UI
        callback(commentsList);
    },
        (error) => {
            // Handle error
            console.error("Gagal mendengarkan komentar:", error);
            callback([]); // Kirim array kosong jika error
        });

    // Kembalikan fungsi 'unsubscribe' agar komponen bisa berhenti mendengarkan
    return unsubscribe;
}

export async function updateComment(commentId: string, newContent: string): Promise<void> {
    // Hanya mengecek login, batasan waktu akan dicek oleh Firestore Rules
    if (!auth.currentUser) {
        throw new Error("Pengguna belum login.");
    }

    // Referensi ke dokumen komentar: /comments/{commentId}
    const commentDocRef = doc(db, "comments", commentId);

    try {
        // Hanya update field 'content'
        await updateDoc(commentDocRef, {
            content: newContent.trim(),
            // Tidak perlu mengupdate createdAt, karena kita ingin menggunakan 
            // waktu awal posting untuk pengecekan batas 10 menit.
        });
        console.log(`[FIREBASE] Komentar ${commentId} berhasil diupdate.`);
    } catch (error) {
        // Firestore akan melempar error di sini jika 10 menit sudah terlewat 
        // atau jika user bukan pemilik.
        console.error("Error mengedit komentar:", error);
        // Memberikan pesan error yang lebih spesifik
        throw new Error("Gagal mengedit komentar. Pastikan Anda adalah pemilik dan batas waktu 10 menit belum terlewat.");
    }
}