"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopBar({ onToggleSidebar }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // call the API route to clear the cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // redirect to login page
      router.push("/admin-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-between bg-blue-950 text-gray-50 px-4 py-3 shadow-md">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
        <h1 className="hidden sm:block text-lg sm:text-xl font-semibold">
          TUPC Helmet Locker System
        </h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 bg-gray-50 text-sm text-red-600 px-3 py-1 rounded hover:bg-red-50"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}
