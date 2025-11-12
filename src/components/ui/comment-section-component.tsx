import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Star } from "lucide-react";
import { Button } from "./button";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Comment {
  id: string;
  userName: string;
  comment: string;
  rating?: number;
  createdAt: Timestamp | null;
}

interface CommentSectionProps {
  attractionId: string;
  countryId: string;
}

export function CommentSection({ attractionId, countryId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  // 🔹 Koleksi Firestore: countries/{countryId}/attractions/{attractionId}/comments
  const commentsRef = collection(
    db,
    "countries",
    countryId,
    "attractions",
    attractionId,
    "comments"
  );

  // 🔹 Ambil data komentar secara realtime
  useEffect(() => {
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, "id">),
      }));
      setComments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [countryId, attractionId]);

  // 🔹 Tambah komentar baru ke Firestore
  const handleSubmit = async () => {
    if (!userName.trim() || !commentText.trim()) {
      alert("Mohon isi nama dan komentar!");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(commentsRef, {
        userName: userName.trim(),
        comment: commentText.trim(),
        rating: rating > 0 ? rating : null,
        createdAt: serverTimestamp(),
      });

      setUserName("");
      setCommentText("");
      setRating(0);
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      alert("Terjadi kesalahan saat mengirim ulasan. Coba lagi nanti.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Format tanggal dari Timestamp Firestore
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 🔹 Hitung rata-rata rating
  const averageRating =
    comments.filter((c) => c.rating).length > 0
      ? (
          comments.reduce((a, c) => a + (c.rating || 0), 0) /
          comments.filter((c) => c.rating).length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-sky-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ulasan Pengunjung</h2>
            <p className="text-gray-500">{comments.length} ulasan</p>
          </div>
        </div>
        {comments.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-semibold text-gray-800">{averageRating}</span>
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
        )}
      </div>

      {/* Form Input */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Tulis Ulasan Anda</h3>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition ${
                  star <= (hoveredStar || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 fill-gray-200"
                }`}
              />
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Nama Anda"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <textarea
          placeholder="Bagikan pengalaman Anda..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full !bg-sky-400 hover:!bg-sky-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-300 ease-in-out hover:cursor-pointer hover:scale-105"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Kirim Ulasan
            </>
          )}
        </Button>
      </div>

      {/* Daftar Komentar */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Memuat ulasan...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-2xl">
          Belum ada ulasan. Jadilah yang pertama! 🌟
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 text-base">{comment.userName}</h4>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {comment.rating && (
                <div className="flex items-center mb-3">
                  {Array.from({ length: comment.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1"
                    />
                  ))}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed text-[15px]">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}