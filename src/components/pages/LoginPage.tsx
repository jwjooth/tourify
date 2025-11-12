import { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success" | ""; message: string }>({
    type: "",
    message: "",
  });

  /** 🔍 Cek jika user klik link dari email login */
  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem("emailForSignIn");
        if (!storedEmail) {
          setStatus({ type: "error", message: "Email tidak ditemukan. Silakan login ulang." });
          return;
        }

        try {
          await signInWithEmailLink(auth, storedEmail, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          onLoginSuccess();
        } catch (err) {
          console.error(err);
          setStatus({ type: "error", message: "Link tidak valid. Silakan kirim ulang." });
        }
      }
    };
    checkEmailLink();
  }, [onLoginSuccess]);

  /** ✉️ Kirim link login via email */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setStatus({
        type: "success",
        message: "Link login telah dikirim ke emailmu. Cek inbox!",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Gagal mengirim link. Periksa koneksi atau email.",
      });
    } finally {
      setLoading(false);
    }
  };

  /** 🔑 Login dengan Google */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Login Google gagal. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-800 flex items-center justify-center px-4 relative overflow-hidden">
      {/* 🌄 Background Subtle */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1631684181713-e697596d2165?auto=format&fit=crop&q=80&w=1080')",
        }}
      />

      {/* 🧱 Login Card */}
      <div className="relative z-10
        bg-white/95 dark:bg-gray-900/90
        backdrop-blur-xl
        p-8 sm:p-10
        rounded-2xl shadow-2xl
        w-[90%] sm:w-[85%] md:w-[70%] lg:w-[480px] max-w-lg
        animate-fade-in
        border border-white/20 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Masuk ke <span className="text-sky-600 dark:text-sky-400">Tourify</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mulai petualanganmu sekarang
          </p>
        </div>

        {/* 📢 Status Message */}
        {status.message && (
          <p
            className={`mb-4 text-center font-medium ${status.type === "error" ? "text-red-600" : "text-green-600"
              }`}
          >
            {status.message}
          </p>
        )}

        {/* ✉️ Email Login Form */}
        <form onSubmit={handleEmailLogin} className="mb-6">
          <div className="relative mb-4">
            <input
              type="email"
              placeholder="Masukkan emailmu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-300 outline-none transition-all duration-200"
              required
            />
          </div>

          <AuthButton label="Kirim Email" loading={loading} />
        </form>

        {/* 🔵 Google Login */}
        <AuthButton
          label="Login dengan Google"
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="secondary"
          icon={
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
          }
        />

        <p className="text-center text-gray-500 dark:text-gray-400 mt-500 text-sm">
          Belum punya akun? Login akan otomatis membuat akun baru.
        </p>
      </div>

      {/* ⏳ Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}

interface AuthButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

function AuthButton({
  label,
  onClick,
  loading,
  disabled,
  variant = "primary",
  icon,
}: AuthButtonProps) {
  const baseStyle =
    "w-full py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";

  const variantStyle =
    variant === "primary"
      ? "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400"
      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700";

  const stateStyle =
    disabled || loading
      ? "opacity-70 cursor-not-allowed hover:shadow-none hover:scale-100"
      : "cursor-pointer hover:shadow-lg";

  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyle} ${stateStyle}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}