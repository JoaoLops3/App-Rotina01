import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
}

export function AuthFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  maxLength,
}: AuthFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-obsidian-400">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-2xl border bg-white/[0.04] py-3.5 text-sm text-white placeholder:text-obsidian-600 outline-none transition-colors focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/30 ${
            isPassword ? "pl-4 pr-12" : "px-4"
          } ${error ? "border-coral-500/60" : "border-white/10"}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-obsidian-500 hover:text-obsidian-300 transition-colors touch-manipulation"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-coral-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
