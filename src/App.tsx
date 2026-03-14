import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Camera, 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  Globe,
  ArrowLeft,
  Loader2,
  MapPin,
  AlertTriangle,
  Truck,
  History,
  CheckCircle2,
  User,
  Lock,
  LogOut,
  Settings,
  Calendar,
  Award,
  Activity,
  UserPlus,
  Edit3,
  Save,
  Phone,
  Briefcase,
  AlertCircle,
  Flag,
  ChevronDown,
  PlayCircle,
  Video,
  X,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Search,
  Upload,
  BrainCircuit,
  AlertOctagon,
  Ban,
  Key,
  Trash2,
  Download,
  RefreshCcw,
  UserCheck,
  UserX,
  RotateCcw,
  Leaf,
  Printer
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { api } from './services/api';

// --- Types ---
interface UserProfile {
  id: number;
  username: string;
  role: 'farmer' | 'manufacturer' | 'admin';
  points: number;
  name?: string;
  phone?: string;
  location?: string;
  language?: string;
  status?: 'active' | 'suspended';
}

interface Seed {
  id: string;
  seed_name: string;
  manufacturer: string;
  batch_number: string;
  production_date: string;
  expiry_date: string;
  hash: string;
  previous_hash: string;
  is_recalled?: boolean;
}

interface Scan {
  id: number;
  seed_id: string;
  user_id: number;
  scan_location: string;
  scan_time: string;
  is_fraudulent: boolean;
  seed_name?: string;
  manufacturer?: string;
}

interface Report {
  id: number;
  seed_id: string;
  user_id: number;
  issue: string;
  location: string;
  status: 'pending' | 'resolved';
  reported_at: string;
  seed_name?: string;
  manufacturer?: string;
  farmer_name?: string;
}

// --- Components ---

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger"
}: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  confirmText?: string,
  cancelText?: string,
  type?: "danger" | "primary"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1A1A1A] rounded-[32px] p-8 border border-white/10 shadow-2xl space-y-6"
      >
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
              type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-agri-green hover:bg-agri-green/90 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' ? 'bg-agri-green/20 border-agri-green/30 text-white' : 'bg-red-500/20 border-red-500/30 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-agri-green" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
    <span className="text-sm font-bold tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors">
      <X className="w-4 h-4 opacity-50" />
    </button>
  </motion.div>
);

const LoadingOverlay = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-12 h-12 text-agri-green animate-spin" />
    <p className="text-white font-medium animate-pulse">{message || 'Processing...'}</p>
  </div>
);

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div className={`glass rounded-[32px] p-6 ${className}`} onClick={onClick}>
    {children}
  </div>
);

const Badge = ({ children, color = "green" }: { children: React.ReactNode, color?: "green" | "red" | "yellow" | "blue" }) => {
  const colors = {
    green: "bg-agri-green/20 text-agri-green border-agri-green/30",
    red: "bg-red-500/20 text-red-500 border-red-500/30",
    yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Pages ---

const LoginView = ({ onLogin, initialIsLogin = true }: { onLogin: (u: UserProfile) => void, initialIsLogin?: boolean }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'manufacturer' | 'admin' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!isLogin) {
      if (!role) {
        setError('Please select a role');
        setLoading(false);
        return;
      }
      // Password validation: 8+ chars, upper, lower, number, special
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        setLoading(false);
        return;
      }
    }
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await api.post(endpoint, { username, password, role });
      if (data.token) {
        localStorage.setItem('agritrust_token', data.token);
      }
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-agri-green/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-agri-accent/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass rounded-[48px] p-8 md:p-12 space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="inline-block p-5 rounded-[32px] bg-gradient-to-br from-agri-green/30 to-agri-green/10 mb-2 shadow-inner"
          >
            <ShieldCheck className="w-14 h-14 text-agri-green drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">AgriTrust</h1>
          <p className="text-gray-400 font-medium tracking-wide">Secure Seed Verification System</p>
        </div>

        <div className="flex p-1.5 bg-black/20 rounded-3xl border border-white/5">
          <button 
            onClick={() => { setIsLogin(true); navigate('/login'); }}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-agri-green text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); navigate('/register'); }}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-agri-green text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Join Now
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-16">Identifier</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-agri-green transition-colors" />
              <input 
                type="text" 
                className="input-field w-full pl-16 h-14 bg-black/20 border-white/5 focus:border-agri-green/50" 
                placeholder="Email or Mobile"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-16">Credentials</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-agri-green transition-colors" />
              <input 
                type="password" 
                className="input-field w-full pl-16 h-14 bg-black/20 border-white/5 focus:border-agri-green/50" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isLogin && (
              <div className="flex justify-end px-2">
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold uppercase tracking-widest text-agri-green hover:text-white transition-colors underline underline-offset-4 decoration-agri-green/30"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            {!isLogin && (
              <p className="text-[9px] text-gray-500 ml-16 leading-relaxed font-medium">
                Must include: 8+ chars, Uppercase, Lowercase, Number, Special char.
              </p>
            )}
          </div>
          {!isLogin && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-16">Your Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-agri-green transition-colors" />
                <select 
                  className="input-field w-full pl-16 h-14 appearance-none pr-10 bg-black/20 border-white/5 focus:border-agri-green/50"
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-[#0a0f0a] text-white">Select Role</option>
                  <option value="farmer" className="bg-[#0a0f0a] text-white">Farmer</option>
                  <option value="manufacturer" className="bg-[#0a0f0a] text-white">Manufacturer</option>
                  <option value="admin" className="bg-[#0a0f0a] text-white">Admin</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-500 text-xs font-bold">{error}</p>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full h-14 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)]"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="font-black uppercase tracking-widest text-sm">
                  {isLogin ? 'Authorize' : 'Register'}
                </span>
                {isLogin ? <ShieldCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </>
            )}
          </button>
        </form>
        
        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
            Blockchain Secured Verification
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ForgotPasswordView = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Mocking a password reset request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-agri-green/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-[48px] p-8 md:p-12 space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="inline-block p-5 rounded-[32px] bg-agri-green/10 mb-2">
            <Lock className="w-12 h-12 text-agri-green" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter">Reset Password</h2>
          <p className="text-gray-400 font-medium">Enter your identifier to receive a reset link</p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="p-6 rounded-3xl bg-agri-green/10 border border-agri-green/20">
              <CheckCircle2 className="w-12 h-12 text-agri-green mx-auto mb-4" />
              <p className="text-sm font-bold text-white">Reset link sent to your registered identifier!</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-agri-green font-bold">Note:</span> This is a simulation. In a production environment, you would receive a secure link via email or SMS.
              </p>
            </div>
            <button onClick={() => navigate('/login')} className="btn-primary w-full h-14 uppercase tracking-widest font-black">
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-16">Identifier</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-agri-green transition-colors" />
                <input 
                  type="text" 
                  className="input-field w-full pl-16 h-14 bg-black/20 border-white/5 focus:border-agri-green/50" 
                  placeholder="Email or Mobile"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full h-14 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span className="font-black uppercase tracking-widest text-sm">Send Reset Link</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>

            <button type="button" onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white w-full transition-colors">
              Cancel
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const FarmerDashboard = ({ user, onBack, initialView = 'home' }: { user: UserProfile, onBack: () => void, initialView?: 'home' | 'scan' | 'verifying' | 'verify' | 'report' | 'ai' | 'bot' | 'history' }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'scan' | 'verifying' | 'verify' | 'report' | 'ai' | 'bot' | 'history'>(initialView);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (view === 'home') {
      fetchRecentScans();
    }
  }, [view]);

  const fetchRecentScans = async () => {
    try {
      const data = await api.get(`/seeds/user-scans/${user.id}`);
      setRecentScans(data.scans.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch scans:', err);
    }
  };

  const handleScan = async (id: string) => {
    setView('verifying');
    setLoading(true);
    try {
      // Get location (mocked for now)
      const location = "Maharashtra, India";
      const result = await api.get(`/seeds/verify-seed/${id}?location=${location}&user_id=${user.id}`);
      
      // Artificial delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationResult(result);
      setScannedId(id);
      setView('verify');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'scan') {
    return <QRScanner onScan={handleScan} onBack={() => setView('home')} />;
  }

  if (view === 'verifying') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-48 h-48 rounded-full border-4 border-dashed border-agri-green/30"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-4 bg-agri-green/10 rounded-full blur-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="w-16 h-16 text-agri-green animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">Verifying Authenticity</h3>
          <p className="text-gray-500 font-medium animate-pulse">Querying Blockchain Ledger...</p>
        </div>
      </div>
    );
  }

  if (view === 'verify' && verificationResult) {
    return <VerificationResult result={verificationResult} user={user} onBack={() => setView('home')} onReport={() => setView('report')} />;
  }

  if (view === 'report') {
    return <ReportFakeView seedId={scannedId!} userId={user.id} onBack={() => setView('home')} />;
  }

  if (view === 'ai') {
    return <AIAnalysisView onBack={() => setView('home')} />;
  }

  if (view === 'bot') {
    return <AgriBotView onBack={() => setView('home')} />;
  }

  if (view === 'history') {
    return <ScanHistoryView userId={user.id} onBack={() => setView('home')} />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Farmer Dashboard</p>
          <h2 className="text-3xl font-bold">Welcome, {user.username}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="p-3 rounded-2xl bg-white/5 hover:bg-agri-green/10 hover:text-agri-green transition-all">
            <User className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 rounded-2xl bg-agri-green/10 border border-agri-green/20 flex items-center gap-2">
            <Award className="w-5 h-5 text-agri-green" />
            <span className="font-bold">{user.points} <span className="text-[10px] opacity-50">PTS</span></span>
          </div>
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center text-center space-y-4 py-8 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('scan')}>
          <div className="p-5 rounded-[28px] bg-agri-green/20 group-hover:scale-110 transition-transform">
            <Camera className="w-10 h-10 text-agri-green" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Verify Seed</h3>
            <p className="text-gray-400 text-xs">Scan QR to check authenticity</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 py-8 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('bot')}>
          <div className="p-5 rounded-[28px] bg-blue-500/20 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-10 h-10 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Agri-Bot</h3>
            <p className="text-gray-400 text-xs">Ask agricultural questions</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 py-8 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('history')}>
          <div className="p-5 rounded-[28px] bg-orange-500/20 group-hover:scale-110 transition-transform">
            <History className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Scan History</h3>
            <p className="text-gray-400 text-xs">View your previous scans</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 py-8 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('ai')}>
          <div className="p-5 rounded-[28px] bg-purple-500/20 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-10 h-10 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Analysis</h3>
            <p className="text-gray-400 text-xs">Quality prediction from image</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-agri-green" /> Recent Scans
          </h3>
          <button onClick={() => setView('history')} className="text-xs font-bold text-agri-green uppercase tracking-widest">View All</button>
        </div>
        <div className="space-y-4">
          {recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${scan.is_fraudulent ? 'bg-red-500/20' : 'bg-agri-green/20'}`}>
                    {scan.is_fraudulent ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-agri-green" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{scan.seed_name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{scan.scan_location} • {new Date(scan.scan_time).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge color={scan.is_fraudulent ? 'red' : 'green'}>{scan.is_fraudulent ? 'Fake' : 'Genuine'}</Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent scans found.</p>
          )}
        </div>
      </Card>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

const AgriBotView = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Hello! I am your Agri-Bot. How can I help you with your farming today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 h-[85vh] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">AI Agri-Bot</h2>
          <p className="text-xs text-agri-green font-bold uppercase tracking-widest">Expert Agricultural Assistant</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-white/5">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl ${msg.role === 'user' ? 'bg-agri-green text-white rounded-tr-none' : 'bg-white/5 border border-white/5 rounded-tl-none'}`}>
                {msg.role === 'bot' ? (
                  <div className="text-sm leading-relaxed">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none">
                <Loader2 className="w-5 h-5 animate-spin text-agri-green" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-black/40 border-t border-white/5">
          <div className="flex gap-3">
            <input 
              type="text" 
              className="input-field flex-1 h-12" 
              placeholder="Ask about planting, fertilizers, irrigation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading} className="p-3 rounded-2xl bg-agri-green text-white hover:scale-105 active:scale-95 transition-all">
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ScanHistoryView = ({ userId, onBack }: { userId: number, onBack: () => void }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [tracking, setTracking] = useState<any[]>([]);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const data = await api.get(`/seeds/user-scans/${userId}`);
      setScans(data.scans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (seedId: string) => {
    try {
      const data = await api.get(`/seeds/seed-history/${seedId}`);
      setTracking(data.scans);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingOverlay message="Fetching scan history..." />;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold">Scan History</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {scans.map((scan) => (
            <Card 
              key={scan.id} 
              className={`cursor-pointer hover:bg-white/10 transition-all border-l-4 ${selectedScan?.id === scan.id ? 'border-agri-green' : 'border-transparent'}`}
              onClick={() => {
                setSelectedScan(scan);
                fetchTracking(scan.seed_id);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${scan.is_fraudulent ? 'bg-red-500/20' : 'bg-agri-green/20'}`}>
                    {scan.is_fraudulent ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-agri-green" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{scan.seed_name}</h4>
                    <p className="text-xs text-gray-500">{scan.manufacturer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{new Date(scan.scan_time).toLocaleDateString()}</p>
                  <Badge color={scan.is_fraudulent ? 'red' : 'green'}>{scan.is_fraudulent ? 'Fake' : 'Genuine'}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {scans.length === 0 && <p className="text-center text-gray-500 py-20">No scan history found.</p>}
        </div>

        <div>
          <Card className="sticky top-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-agri-green" /> Seed Tracking
            </h3>
            {selectedScan ? (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Selection</p>
                  <p className="font-bold text-agri-green">{selectedScan.seed_name}</p>
                </div>
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {tracking.map((t, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-[#0a0f0a] z-10 ${i === 0 ? 'bg-agri-green' : 'bg-gray-600'}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{t.scan_location}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(t.scan_time).toLocaleString()}</p>
                        {t.is_fraudulent === 1 && <p className="text-[9px] text-red-500 font-bold uppercase">Suspicious Activity Detected</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10 text-sm">Select a scan to view tracking timeline.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const QRScanner = ({ onScan, onBack }: { onScan: (id: string) => void, onBack: () => void }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        // Use back camera by default
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              if (data.id) {
                html5QrCode.stop().then(() => {
                  onScan(data.id);
                });
              }
            } catch (e) {
              // If not JSON, try using the text directly if it looks like a UUID
              if (decodedText.length > 20) {
                html5QrCode.stop().then(() => {
                  onScan(decodedText);
                });
              }
            }
          },
          (errorMessage) => {
            // ignore errors
          }
        );
      } catch (err: any) {
        console.error("Scanner error:", err);
        setError("Could not start camera. Please ensure permissions are granted.");
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error(err));
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode("reader-file");
      const decodedText = await html5QrCode.scanFile(file, true);
      
      try {
        const data = JSON.parse(decodedText);
        if (data.id) {
          onScan(data.id);
        }
      } catch (e) {
        if (decodedText.length > 20) {
          onScan(decodedText);
        } else {
          alert("Invalid QR Code Format in image");
        }
      }
    } catch (err) {
      alert("Could not find a valid QR code in this image.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6 bg-[#0a0f0a]">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Secure Scanner</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Point at Agritrust QR Code</p>
      </div>

      <div className="w-full max-w-md glass rounded-[40px] overflow-hidden relative border border-white/10 shadow-2xl">
        <div id="reader" className="w-full aspect-square"></div>
        <div id="reader-file" className="hidden"></div>
        {isScanning && <div className="scan-line"></div>}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/80 backdrop-blur-md">
            <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-sm font-bold text-white mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-agri-green rounded-2xl font-bold text-xs uppercase tracking-widest"
            >
              Retry Permission
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full max-w-md gap-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
        >
          <Upload className="w-5 h-5 text-agri-green group-hover:scale-110 transition-transform" />
          <span className="font-black uppercase tracking-widest text-xs">Scan From Image File</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        <button onClick={onBack} className="w-full h-16 rounded-3xl bg-white/5 flex items-center justify-center gap-3 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest text-xs">Cancel Scanning</span>
        </button>
      </div>

      <div className="pt-8 opacity-20">
        <ShieldCheck className="w-12 h-12 text-agri-green" />
      </div>
    </div>
  );
};

const VerificationResult = ({ result, user, onBack, onReport }: { result: any, user: UserProfile, onBack: () => void, onReport: () => void }) => {
  const { seed, is_fraudulent } = result;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 relative"
    >
      {/* Background Glow Effect */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[120px] -z-10 opacity-20 transition-colors duration-1000 ${is_fraudulent ? 'bg-red-500' : 'bg-agri-green'}`} />

      <div className="text-center space-y-6 relative">
        <motion.div 
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className={`inline-block p-8 rounded-[48px] relative ${is_fraudulent ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'bg-agri-green/20 shadow-[0_0_50px_rgba(16,185,129,0.3)]'}`}
        >
          {is_fraudulent ? (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ShieldAlert className="w-24 h-24 text-red-500" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            >
              <ShieldCheck className="w-24 h-24 text-agri-green" />
            </motion.div>
          )}
          
          {/* Decorative Rings */}
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute inset-0 rounded-[48px] border-2 ${is_fraudulent ? 'border-red-500/30' : 'border-agri-green/30'}`}
          />
        </motion.div>

        <div className="space-y-2">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-5xl font-black tracking-tighter ${is_fraudulent ? 'text-red-500' : 'text-agri-green'}`}
          >
            {is_fraudulent ? 'Verification Failed' : 'Authenticity Verified'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 font-medium tracking-wide"
          >
            {is_fraudulent 
              ? 'This seed batch has been flagged as counterfeit or suspicious.' 
              : 'Blockchain signature matches. This product is 100% genuine.'}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="space-y-8 border-white/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {is_fraudulent ? <ShieldX className="w-32 h-32 text-red-500" /> : <ShieldCheck className="w-32 h-32 text-agri-green" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Product Identity</p>
              <p className="font-bold text-xl text-white">{seed.seed_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Origin Source</p>
              <p className="font-bold text-xl text-white">{seed.manufacturer}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Batch Reference</p>
              <p className="font-mono text-lg text-agri-green">{seed.batch_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Timestamp</p>
              <p className="font-bold text-xl text-white">{seed.production_date}</p>
            </div>
          </div>

          <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Blockchain Ledger Hash</p>
              <Badge color={is_fraudulent ? "red" : "green"}>Immutable Record</Badge>
            </div>
            <p className="text-[11px] font-mono break-all opacity-40 leading-relaxed">{seed.hash}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-4"
      >
        {is_fraudulent && (
          <button onClick={onReport} className="btn-primary bg-red-500 hover:bg-red-600 flex items-center justify-center gap-3 h-16 shadow-[0_10px_30px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-black uppercase tracking-widest">Report Counterfeit</span>
          </button>
        )}
        <button onClick={onBack} className="btn-secondary w-full h-16 flex items-center justify-center gap-3">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest">Return to Dashboard</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

const ReportFakeView = ({ seedId, userId, onBack }: { seedId: string, userId: number, onBack: () => void }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reports/report-fake', { seed_id: seedId, farmer_id: userId, issue: reason });
      setToast({ message: "Report submitted successfully! You earned 50 points.", type: 'success' });
      setTimeout(onBack, 2000);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-block p-4 rounded-3xl bg-red-500/20 mb-4">
          <AlertOctagon className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold">Report Fake Seed</h2>
        <p className="text-gray-400">Help us stop counterfeit seeds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Reason for Report</label>
          <textarea 
            className="input-field w-full min-h-[150px] resize-none" 
            placeholder="Describe the issue (e.g., damaged packaging, scan failed, suspicious seller)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full bg-red-500 hover:bg-red-600">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Report'}
        </button>
        <button type="button" onClick={onBack} className="btn-secondary w-full">Cancel</button>
      </form>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

const AIAnalysisView = ({ onBack }: { onBack: () => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await api.post('/ai/analyze-seed', { image });
      setAnalysis(data.analysis);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-block p-4 rounded-3xl bg-blue-500/20 mb-4">
          <BrainCircuit className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold">AI Seed Analysis</h2>
        <p className="text-gray-400">Powered by Gemini AI Vision</p>
      </div>

      <Card className="space-y-6">
        <div className="aspect-video bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          {image ? (
            <img src={image} className="w-full h-full object-cover" />
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-500 mb-2" />
              <p className="text-gray-500 font-medium">Upload seed image</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </>
          )}
        </div>

        {image && !analysis && (
          <button onClick={analyzeImage} disabled={loading} className="btn-primary w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><BrainCircuit className="w-5 h-5" /> Start Analysis</>}
          </button>
        )}

        {analysis && (
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-400">
              <CheckCircle2 className="w-5 h-5" /> AI Prediction
            </h3>
            <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none">
              <Markdown>{analysis}</Markdown>
            </div>
          </div>
        )}
      </Card>

      <button onClick={onBack} className="btn-secondary w-full">Back to Dashboard</button>
    </div>
  );
};

const ManufacturerDashboard = ({ user, onBack }: { user: UserProfile, onBack: () => void }) => {
  const [view, setView] = useState<'home' | 'add'>('home');
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    if (view === 'home') {
      fetchSeeds();
    }
  }, [view]);

  const fetchSeeds = async () => {
    try {
      const data = await api.get(`/seeds/manufacturer-seeds/${user.username}`);
      setSeeds(data.seeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecall = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Recall Batch',
      message: 'Are you sure you want to recall this batch? This will mark all seeds in this batch as suspicious.',
      onConfirm: async () => {
        try {
          await api.post(`/seeds/recall-seed/${id}`, {});
          setToast({ message: 'Batch recalled successfully', type: 'success' });
          fetchSeeds();
        } catch (err: any) {
          setToast({ message: err.message, type: 'error' });
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (view === 'add') {
    return <AddSeedView manufacturer={user.username} onBack={() => setView('home')} />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Manufacturer Dashboard</p>
          <h2 className="text-3xl font-bold">Welcome, {user.username}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('add')} className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Register Batch
          </button>
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-agri-green/20 to-transparent border-agri-green/20">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-agri-green/20">
              <Package className="w-8 h-8 text-agri-green" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Batches</p>
              <h4 className="text-3xl font-black">{seeds.length}</h4>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Verified Seeds</p>
              <h4 className="text-3xl font-black">{seeds.filter(s => !s.is_recalled).length * 100}+</h4>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/20 to-transparent border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Recalled Batches</p>
              <h4 className="text-3xl font-black">{seeds.filter(s => s.is_recalled).length}</h4>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Seed Batch Management</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search batch..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:border-agri-green outline-none" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                <th className="pb-4 font-bold">Seed Name</th>
                <th className="pb-4 font-bold">Batch #</th>
                <th className="pb-4 font-bold">Reg. Date</th>
                <th className="pb-4 font-bold">Expiry</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {seeds.map((seed) => (
                <tr key={seed.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-agri-green/10 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-agri-green" />
                      </div>
                      <span className="font-bold text-sm">{seed.seed_name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-mono text-gray-400">{seed.batch_number}</td>
                  <td className="py-4 text-xs text-gray-400">{new Date(seed.production_date).toLocaleDateString()}</td>
                  <td className="py-4 text-xs text-gray-400">{new Date(seed.expiry_date).toLocaleDateString()}</td>
                  <td className="py-4">
                    <Badge color={seed.is_recalled ? 'red' : 'green'}>{seed.is_recalled ? 'Recalled' : 'Active'}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-all" title="View Stats">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      {!seed.is_recalled && (
                        <button onClick={() => handleRecall(seed.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all" title="Recall Batch">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {seeds.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">No seed batches registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

const AddSeedView = ({ manufacturer, onBack }: { manufacturer: string, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    seed_name: '',
    batch_number: '',
    production_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // +1 year
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/seeds', { ...formData, manufacturer });
      setResult(data.seed);
      setToast({ message: 'Batch registered successfully', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto p-8 space-y-8 text-center">
        <div className="p-6 rounded-[40px] bg-agri-green/10 border border-agri-green/20 inline-block">
          <ShieldCheck className="w-16 h-16 text-agri-green" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Batch Registered</h2>
          <p className="text-gray-500 font-medium">Blockchain Hash Generated Successfully</p>
        </div>
        
        <Card className="p-8 bg-white flex flex-col items-center space-y-6">
          <div className="p-4 bg-white rounded-2xl shadow-2xl">
            <QRCodeSVG value={result.qr_data} size={200} />
          </div>
          <div className="w-full space-y-3 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-bold uppercase">Seed ID</span>
              <span className="text-black font-mono font-bold">{result.seed_id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-bold uppercase">Hash</span>
              <span className="text-black font-mono font-bold truncate ml-4">{result.verification_hash.substring(0, 16)}...</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <button onClick={() => window.print()} className="btn-primary w-full flex items-center justify-center gap-2">
            <Printer className="w-5 h-5" /> Print QR Codes
          </button>
          <button onClick={onBack} className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold">Register New Batch</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seed Variety Name</label>
            <input 
              required
              type="text" 
              className="input-field" 
              placeholder="e.g. Hybrid Basmati Rice X-102"
              value={formData.seed_name}
              onChange={(e) => setFormData({...formData, seed_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Batch Number</label>
              <input 
                required
                type="text" 
                className="input-field" 
                placeholder="BATCH-2024-001"
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Production Date</label>
              <input 
                required
                type="date" 
                className="input-field"
                value={formData.production_date}
                onChange={(e) => setFormData({...formData, production_date: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry Date</label>
            <input 
              required
              type="date" 
              className="input-field"
              value={formData.expiry_date}
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Generate Blockchain QR'}
          </button>
        </form>
      </Card>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};const AdminDashboard = ({ user, onBack }: { user: UserProfile, onBack: () => void }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'seeds' | 'transactions' | 'reports'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [seedSearch, setSeedSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [allSeeds, setAllSeeds] = useState<Seed[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: () => void,
    type?: 'danger' | 'primary'
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, usersData, seedsData, transactionsData] = await Promise.all([
        api.get('/stats'),
        api.get('/reports/all-reports'),
        api.get('/users/all-users'),
        api.get('/seeds'),
        api.get('/transactions')
      ]);
      setStats(statsData);
      setReports(reportsData.reports);
      setUsers(usersData.users);
      setAllSeeds(seedsData.seeds);
      setTransactions(transactionsData.transactions);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Resolve Report',
      message: 'Are you sure you want to mark this report as resolved?',
      type: 'primary',
      onConfirm: async () => {
        try {
          await api.post(`/reports/resolve-report/${id}`, {});
          setToast({ message: 'Report resolved successfully', type: 'success' });
          fetchData();
        } catch (err: any) {
          setToast({ message: err.message, type: 'error' });
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateUserStatus = async (id: number, status: 'active' | 'suspended') => {
    try {
      await api.post(`/users/update-status/${id}`, { status });
      setToast({ message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`, type: 'success' });
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone and will remove all their data.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/users/delete-user/${id}`);
          setToast({ message: 'User deleted successfully', type: 'success' });
          fetchData();
        } catch (err: any) {
          setToast({ message: err.message, type: 'error' });
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleChangeRole = async (id: number, role: string) => {
    try {
      await api.post(`/users/update-role/${id}`, { role });
      setToast({ message: `User role updated to ${role}`, type: 'success' });
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleResetPassword = async () => {
    if (!showResetModal || !newPassword) return;
    try {
      await api.post(`/users/reset-password/${showResetModal}`, { newPassword });
      setToast({ message: 'Password reset successfully', type: 'success' });
      setShowResetModal(null);
      setNewPassword('');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const downloadReportsCSV = () => {
    const headers = ['ID', 'Seed ID', 'Seed Name', 'Manufacturer', 'Farmer', 'Issue', 'Location', 'Status', 'Date'];
    const rows = reports.map(r => [
      r.id, r.seed_id, r.seed_name, r.manufacturer, r.farmer_name, 
      `"${r.issue.replace(/"/g, '""')}"`, r.location, r.status, new Date(r.reported_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "agritrust_reports.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.seed_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                         r.issue.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesFilter = reportFilter === 'all' || r.status === reportFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingOverlay message="Loading Admin Panel..." />;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Admin Control Panel</p>
          <h2 className="text-3xl font-bold">System Management</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-agri-green text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Overview</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-agri-green text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Users</button>
            <button onClick={() => setActiveTab('seeds')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'seeds' ? 'bg-agri-green text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Seeds</button>
            <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'transactions' ? 'bg-agri-green text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Transactions</button>
            <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-agri-green text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Reports</button>
          </div>
          <button onClick={() => navigate('/profile')} className="p-3 rounded-2xl bg-white/5 hover:bg-agri-green/10 hover:text-agri-green transition-all">
            <User className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 space-y-2 bg-gradient-to-br from-white/5 to-transparent">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Seeds</p>
                <Package className="w-4 h-4 text-agri-green" />
              </div>
              <p className="text-3xl font-black">{stats?.totalSeeds.count}</p>
            </Card>
            <Card className="p-6 space-y-2 bg-gradient-to-br from-white/5 to-transparent">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Scans</p>
                <Camera className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-black">{stats?.totalScans.count}</p>
            </Card>
            <Card className="p-6 space-y-2 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/10">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Fraud Detected</p>
                <ShieldAlert className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-black text-red-500">{stats?.fraudulentScans.count}</p>
            </Card>
            <Card className="p-6 space-y-2 bg-gradient-to-br from-white/5 to-transparent">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fake Reports</p>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-3xl font-black">{stats?.totalReports.count}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-agri-green" /> Fraud Heatmap (Scan Locations)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.scanHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="scan_location" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-500" /> User Roles
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="role"
                    >
                      {stats?.roleDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-agri-green" /> Farmer</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Manufacturer</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Admin</span>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold">User Management</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="input-field pl-10 h-10 text-xs"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                  <th className="pb-4 font-bold">User</th>
                  <th className="pb-4 font-bold">Role</th>
                  <th className="pb-4 font-bold">Location</th>
                  <th className="pb-4 font-bold">Points</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.username}</p>
                          <p className="text-[10px] text-gray-500">{u.name || 'No full name'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <select 
                        className="bg-transparent text-xs font-bold outline-none cursor-pointer hover:text-agri-green"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      >
                        <option value="farmer">Farmer</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 text-xs text-gray-400">{u.location || 'Not Set'}</td>
                    <td className="py-4 text-xs font-bold text-agri-green">{u.points}</td>
                    <td className="py-4">
                      <Badge color={u.status === 'suspended' ? 'red' : 'green'}>{u.status || 'active'}</Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateUserStatus(u.id, u.status === 'suspended' ? 'active' : 'suspended')} 
                          className={`p-2 rounded-lg bg-white/5 transition-all ${u.status === 'suspended' ? 'hover:bg-green-500/10 hover:text-green-500' : 'hover:bg-red-500/10 hover:text-red-500'}`}
                          title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        >
                          {u.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setShowResetModal(u.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'seeds' && (
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold">All Registered Seeds</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search seeds..." 
                className="input-field pl-10 h-10 text-xs"
                value={seedSearch}
                onChange={(e) => setSeedSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                  <th className="pb-4 font-bold">Seed Name</th>
                  <th className="pb-4 font-bold">Manufacturer</th>
                  <th className="pb-4 font-bold">Batch #</th>
                  <th className="pb-4 font-bold">Reg. Date</th>
                  <th className="pb-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allSeeds.filter(s => 
                  s.seed_name.toLowerCase().includes(seedSearch.toLowerCase()) ||
                  s.manufacturer.toLowerCase().includes(seedSearch.toLowerCase()) ||
                  s.batch_number.toLowerCase().includes(seedSearch.toLowerCase())
                ).map((s) => (
                  <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-agri-green/10 flex items-center justify-center">
                          <Leaf className="w-4 h-4 text-agri-green" />
                        </div>
                        <span className="font-bold text-sm">{s.seed_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-gray-400">{s.manufacturer}</td>
                    <td className="py-4 text-xs font-mono text-gray-400">{s.batch_number}</td>
                    <td className="py-4 text-xs text-gray-400">{new Date(s.production_date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <Badge color={s.is_recalled ? 'red' : 'green'}>{s.is_recalled ? 'Recalled' : 'Active'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold">System Transactions</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="input-field pl-10 h-10 text-xs"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                  <th className="pb-4 font-bold">Transaction ID</th>
                  <th className="pb-4 font-bold">Farmer</th>
                  <th className="pb-4 font-bold">Seed</th>
                  <th className="pb-4 font-bold">Manufacturer</th>
                  <th className="pb-4 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.filter(t => 
                  t.farmer_name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                  t.seed_name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                  t.manufacturer?.toLowerCase().includes(transactionSearch.toLowerCase())
                ).map((t) => (
                  <tr key={t.transaction_id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 text-xs font-mono text-gray-500">#{t.transaction_id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-agri-green" />
                        <span className="font-bold text-sm">{t.farmer_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-gray-400">{t.seed_name}</td>
                    <td className="py-4 text-xs text-gray-400">{t.manufacturer}</td>
                    <td className="py-4 text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h3 className="text-lg font-bold">Counterfeit Reports</h3>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                <button onClick={() => setReportFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${reportFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>All</button>
                <button onClick={() => setReportFilter('pending')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${reportFilter === 'pending' ? 'bg-red-500/20 text-red-500' : 'text-gray-500'}`}>Pending</button>
                <button onClick={() => setReportFilter('resolved')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${reportFilter === 'resolved' ? 'bg-agri-green/20 text-agri-green' : 'text-gray-500'}`}>Resolved</button>
              </div>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="input-field pl-10 h-10 text-xs"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
              <button onClick={downloadReportsCSV} className="p-2.5 rounded-xl bg-agri-green/10 text-agri-green border border-agri-green/20 hover:bg-agri-green hover:text-white transition-all">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between gap-6 hover:border-white/10 transition-all">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${report.status === 'pending' ? 'bg-red-500/20' : 'bg-agri-green/20'}`}>
                      <AlertOctagon className={`w-6 h-6 ${report.status === 'pending' ? 'text-red-500' : 'text-agri-green'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{report.seed_name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Batch ID: <span className="font-mono text-white/60">{report.seed_id}</span> • Manufacturer: {report.manufacturer}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{report.issue}"</p>
                  </div>
                  <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-2"><User className="w-4 h-4 text-agri-green" /> Reported By: {report.farmer_name}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Location: {report.location}</span>
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500" /> Date: {new Date(report.reported_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end gap-4 min-w-[160px]">
                  <Badge color={report.status === 'pending' ? 'red' : 'green'}>{report.status}</Badge>
                  {report.status === 'pending' && (
                    <button 
                      onClick={() => handleResolveReport(report.id)} 
                      className="btn-primary py-3 px-6 text-xs w-full shadow-lg shadow-agri-green/20"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <div className="inline-block p-6 rounded-full bg-white/5">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-500 font-medium">No reports matching your criteria.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass rounded-[40px] p-8 relative z-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-block p-4 rounded-2xl bg-blue-500/20 mb-2">
                  <Key className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Reset Password</h3>
                <p className="text-gray-400 text-sm">Set a new password for this user</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">New Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button onClick={handleResetPassword} className="btn-primary w-full py-4 font-bold uppercase tracking-widest text-sm">Update Password</button>
                <button onClick={() => setShowResetModal(null)} className="btn-secondary w-full py-4 font-bold uppercase tracking-widest text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Profile View ---
const ProfileView = ({ user, onLogout }: { user: UserProfile, onLogout: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    location: user.location || '',
    language: user.language || 'English'
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/users/update-profile/${user.id}`, formData);
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('agritrust_user', JSON.stringify(updatedUser));
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.post(`/users/change-password/${user.id}`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/users/delete-user/${user.id}`);
      setToast({ message: 'Account deleted successfully.', type: 'success' });
      setTimeout(onLogout, 1500);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
    setShowDeleteConfirm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => window.history.back()} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold">Your Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center space-y-6">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-[40px] bg-agri-green/20 flex items-center justify-center overflow-hidden border-2 border-agri-green/30">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-agri-green" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-agri-green text-white rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            
            <div>
              <h3 className="text-xl font-bold">{user.username}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Trust Points</p>
                <p className="text-xl font-black text-agri-green">{user.points}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <Badge color="green">Active</Badge>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-all text-sm font-bold"
            >
              <Key className="w-5 h-5 text-agri-green" /> Change Password
            </button>
            <button 
              onClick={onLogout}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-red-500/10 text-red-500 transition-all text-sm font-bold"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-3 hover:bg-red-500/20 text-red-500/60 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold">Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditing ? 'bg-red-500/10 text-red-500' : 'bg-agri-green/10 text-agri-green'}`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Full Name</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="input-field" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Phone Number</label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="input-field" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Location / Farm Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="input-field pl-12" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Village, District, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Preferred Language</label>
                <select 
                  disabled={!isEditing}
                  className="input-field appearance-none"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Kannada</option>
                  <option>Telugu</option>
                </select>
              </div>
              
              {isEditing && (
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
              )}
            </form>
          </Card>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1A1A1A] rounded-[32px] p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Current Password</label>
                <input 
                  type="password" 
                  required
                  className="input-field"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">New Password</label>
                <input 
                  type="password" 
                  required
                  className="input-field"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  className="input-field"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-4">
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
;

// --- Main App ---

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agritrust_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('agritrust_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agritrust_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
          
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <LoginView onLogin={setUser} initialIsLogin={true} />
          } />

          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <LoginView onLogin={setUser} initialIsLogin={false} />
          } />

          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          
          <Route path="/dashboard" element={
            !user ? <Navigate to="/login" /> : (
              user.role === 'farmer' ? <FarmerDashboard user={user} onBack={handleLogout} /> :
              user.role === 'manufacturer' ? <ManufacturerDashboard user={user} onBack={handleLogout} /> :
              <AdminDashboard user={user} onBack={handleLogout} />
            )
          } />

          <Route path="/farmer" element={
            !user || user.role !== 'farmer' ? <Navigate to="/" /> : <FarmerDashboard user={user} onBack={handleLogout} />
          } />

          <Route path="/manufacturer" element={
            !user || user.role !== 'manufacturer' ? <Navigate to="/" /> : <ManufacturerDashboard user={user} onBack={handleLogout} />
          } />

          <Route path="/admin" element={
            !user || user.role !== 'admin' ? <Navigate to="/" /> : <AdminDashboard user={user} onBack={handleLogout} />
          } />

          <Route path="/verify-seed" element={
            !user || user.role !== 'farmer' ? <Navigate to="/login" /> : <FarmerDashboard user={user} onBack={handleLogout} initialView="scan" />
          } />

          <Route path="/profile" element={
            !user ? <Navigate to="/" /> : <ProfileView user={user} onLogout={handleLogout} />
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Markdown Helper ---
const Markdown = ({ children }: { children: string }) => {
  // Simple markdown-to-html for analysis results
  const lines = children.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-white mt-4">{line.replace('###', '')}</h3>;
        if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.replace('##', '')}</h2>;
        if (line.startsWith('*')) return <li key={i} className="ml-4">{line.replace('*', '')}</li>;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
};
