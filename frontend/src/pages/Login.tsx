import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Moon, Sun } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '@/hooks/useMutations';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface LoginForm {
  phone: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { phone: '9876543210', password: 'demo1234' },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(
      { phone: data.phone, password: data.password },
      {
        onSuccess: (result) => {
          setUser(result.user);
          navigate('/');
        },
      },
    );
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-950/70" />

      {/* Decorative cricket ball */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 opacity-20 blur-sm hidden md:block"
      />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow items-center justify-center mb-4">
            <span className="text-white font-black text-3xl font-display">M</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white mb-1">MySquad</h1>
          <p className="text-emerald-300/90 text-sm font-medium">
            Your team's companion. No more WhatsApp polling. 🏏
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-300 mb-6">Login to manage your cricket team</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  {...register('phone', { required: 'Phone number is required' })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  {...register('password', { required: 'Password is required', minLength: 4 })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded accent-emerald-500" />
                Remember me
              </label>
              <button
                type="button"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="success"
              size="lg"
              fullWidth
              loading={loginMutation.isPending}
              className="mt-2"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
              {!loginMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Demo credentials pre-filled. Just hit Login 👆
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            {/* <p className="text-sm text-slate-400">
              New player?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Register here
              </Link>
            </p> */}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Made for local cricket teams by a captain, for captains 💚
        </p>
      </motion.div>
    </div>
  );
}