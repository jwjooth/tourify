// src/components/ui/CommentSection.tsx

import { useState, useEffect, useMemo } from "react";
import { Send, User, Loader2, MessageCircle, Edit, Save, X } from "lucide-react"; // Import ikon Edit, Save, X
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader } from "../ui/card";
import { 
  listenToComments, 
  postComment, 
  updateComment, // Import fungsi updateComment
  Comment 
} from "../../data/commentApi";
import { auth } from "../../firebase/firebase";
import { 
  formatDistanceToNowStrict, 
  isPast, 
  differenceInMinutes, 
  addMinutes // Import fungsi date-fns yang diperlukan
} from "date-fns";
import { id } from "date-fns/locale"; 

interface CommentSectionProps {
  attractionId: string;
}

// ---------------------------------------------
// Sub-Komponen: Menampilkan satu komentar (DIPERBARUI DENGAN EDIT LOGIC)
// ---------------------------------------------
interface CommentItemProps {
  comment: Comment;
}

const EDIT_TIME_LIMIT_MINUTES = 10; // Batas waktu edit 10 menit (sesuai rules)

function CommentItem({ comment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isOwner = auth.currentUser?.uid === comment.userId;
  
  // Hitung status batas waktu edit secara dinamis (menggunakan useMemo untuk performa)
  const canEdit = useMemo(() => {
    // Jika tidak ada waktu pembuatan atau bukan pemilik, langsung false
    if (!comment.createdAt || !isOwner) return false;

    // Hitung waktu kadaluarsa (waktu dibuat + 10 menit)
    const expirationTime = addMinutes(comment.createdAt, EDIT_TIME_LIMIT_MINUTES);
    
    // Izinkan edit jika waktu saat ini BELUM melewati waktu kadaluarsa
    return !isPast(expirationTime);
  }, [comment.createdAt, isOwner, comment.id]); 
  
  // Hitung waktu tersisa (Hanya untuk tampilan)
  const minutesPassed = comment.createdAt 
    ? differenceInMinutes(new Date(), comment.createdAt) 
    : 0;
  const minutesLeft = Math.max(0, EDIT_TIME_LIMIT_MINUTES - minutesPassed);

  // Teks waktu posting
  const timeAgo = comment.createdAt 
    ? formatDistanceToNowStrict(comment.createdAt, { 
        addSuffix: true,
        locale: id
      }) 
    : "Baru saja";

  // Handler untuk menyimpan hasil edit
  const handleSaveEdit = async () => {
    if (editedContent.trim() === comment.content || !editedContent.trim()) {
      setIsEditing(false); // Batalkan jika tidak ada perubahan atau kosong
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      // Panggil API updateComment yang akan divalidasi oleh Firestore Rules
      await updateComment(comment.id, editedContent); 
      setIsEditing(false);
    } catch (err: any) {
      // Tangani error dari Firestore Rules (jika batas waktu terlampaui)
      console.error("Error mengedit komentar:", err);
      setEditError(err.message || "Gagal menyimpan edit. Batas waktu 10 menit mungkin telah terlewat.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex space-x-4 border-b pb-4 mb-4">
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.userName} />
        <AvatarFallback className="bg-sky-100 text-sky-600">
          {comment.userName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold text-gray-900 truncate flex-1">
            {comment.userName}
            {isOwner && (
              <span className="ml-2 text-xs font-normal text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
                Anda
              </span>
            )}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
            {timeAgo}
          </span>
        </div>
        
        {/* Konten Komentar */}
        {isEditing ? (
          // Mode Edit
          <div className="mt-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isSaving}
            />
            {editError && <p className="text-sm text-red-500 mt-1">{editError}</p>}
            
            <div className="flex justify-end space-x-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEditedContent(comment.content); // Kembalikan ke konten asli saat batal
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" /> Batal
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit}
                disabled={isSaving || !editedContent.trim()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan
              </Button>
            </div>
          </div>
        ) : (
          // Mode Tampil Normal
          <p className="text-gray-700 mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
        
        {/* Kontrol Komentar (Edit) - HANYA JIKA BISA DIEDIT */}
        {canEdit && !isEditing && (
          <div className="mt-2 text-sm space-x-3 flex items-center">
            <button 
              className="text-sky-600 hover:text-sky-700 font-medium flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </button>
            <span className="text-xs text-gray-500">
              (Sisa waktu: **{minutesLeft} menit**)
            </span>
          </div>
        )}
        
        {/* Kontrol Komentar (Placeholder untuk Delete) */}
        {isOwner && !canEdit && !isEditing && (
          <div className="mt-2 text-sm space-x-3">
            <span className="text-xs text-red-500">
              Batas waktu edit sudah habis.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


// ---------------------------------------------
// Komponen Utama: CommentSection (Tidak Berubah)
// ---------------------------------------------
export function CommentSection({ attractionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!auth.currentUser;
  const userPhoto = auth.currentUser?.photoURL;
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Anonim";

  useEffect(() => {
    if (!attractionId) return; 
    const unsubscribe = listenToComments(attractionId, (newComments) => {
      setComments(newComments);
    });
    return () => unsubscribe();
  }, [attractionId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    setIsPosting(true);
    setError(null);
    
    try {
      await postComment(attractionId, newComment.trim());
      setNewComment(""); 
    } catch (err: any) {
      setError(err.message || "Gagal memposting komentar.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <MessageCircle className="h-6 w-6 text-sky-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          Ulasan Pengunjung ({comments.length})
        </h2>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Area Input Komentar */}
        <form onSubmit={handlePostComment} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-start space-x-3 mb-3">
             <Avatar className="h-9 w-9 flex-shrink-0">
               <AvatarImage src={userPhoto || undefined} alt={userName} />
               <AvatarFallback className="bg-sky-100 text-sky-600">
                 {userName.charAt(0)}
               </AvatarFallback>
             </Avatar>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isLoggedIn ? "Tulis ulasan Anda tentang destinasi ini..." : "Anda harus login untuk menulis ulasan."}
              rows={3}
              className="flex-1 resize-none"
              disabled={!isLoggedIn || isPosting}
            />
          </div>
          
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!isLoggedIn || isPosting || !newComment.trim()}
              className="bg-sky-500 hover:bg-sky-600"
            >
              {isPosting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isPosting ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
          </div>
          
          {!isLoggedIn && (
            <p className="text-sm text-center mt-3 text-gray-500">
              Silakan login untuk dapat berbagi pengalaman Anda.
            </p>
          )}
        </form>

        {/* Daftar Komentar */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Belum ada ulasan. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}