import React from "react";
import { AuthFormik } from "../components/AuthFormik";
import { User } from "../types";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<User>;
  onRegister: (name: string, email: string, password: string) => Promise<User>;
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onRegister,
  onNavigateToRegister,
  onSuccess,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#f7f9fb] px-4 pt-20 pb-12">
      <AuthFormik
        mode="login"
        onLogin={onLogin}
        onRegister={onRegister}
        onToggleMode={onNavigateToRegister}
        onSuccess={onSuccess}
      />
    </div>
  );
};
