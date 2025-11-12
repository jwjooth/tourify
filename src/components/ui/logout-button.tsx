// src/components/ui/LogoutButton.tsx
import { LogOut } from "lucide-react";
import { auth } from "../../firebase/firebase"; // Adjust path kalau beda

interface LogoutButtonProps {
  onLogoutSuccess: () => void; // Callback buat redirect setelah logout
}

export function LogoutButton({ onLogoutSuccess }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      onLogoutSuccess(); // Redirect ke login
    } catch (err) {
      console.error("Gagal logout:", err);
      // Tambah toast error nanti kalau perlu
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-1 shadow-md"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}