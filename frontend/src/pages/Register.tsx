import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, User as UserIcon, ShieldCheck, ArrowRight, Moon, Sun } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useRegisterMutation } from '@/hooks/useMutations';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirm: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { name: '', phone: '', password: '', confirm: '' },
  });

  const password = watch('password');

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(
      { name: data.name, phone: data.phone, password: data.password },
      {
        onSuccess: (result) => {
          setUser(result.user);
          navigate('/');
        },
      },
    );
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 py-10">
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-950/70" />

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
          <h1 className="font-display text-3xl font-extrabold text-white mb-1">Join MySquad</h1>
          <p className="text-emerald-300/90 text-sm font-medium">
            Register to join your team and get match updates 🏏
          </p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-sm text-slate-300 mb-6">Players can register themselves to the team</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  {...register('name', { required: 'Name is required', minLength: 3 })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

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
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit mobile number',
                    },
                  })}
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
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  {...register('confirm', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="success"
              size="lg"
              fullWidth
              loading={registerMutation.isPending}
              className="mt-2"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Register'}
              {!registerMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Login
            </Link>
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Made for local cricket teams by a captain, for captains 💚
        </p>
      </motion.div>
    </div>
  );
}