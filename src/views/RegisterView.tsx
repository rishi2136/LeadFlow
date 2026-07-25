import React from "react";
import { AuthFormik } from "../components/AuthFormik";
import { User } from "../types";

interface RegisterViewProps {
  onLogin: (email: string, password: string) => Promise<User>;
  onRegister: (name: string, email: string, password: string) => Promise<User>;
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onLogin,
  onRegister,
  onNavigateToLogin,
  onSuccess,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#f7f9fb] px-4 pt-20 pb-12">
      <AuthFormik
        mode="register"
        onLogin={onLogin}
        onRegister={onRegister}
        onToggleMode={onNavigateToLogin}
        onSuccess={onSuccess}
      />
    </div>
  );
};
