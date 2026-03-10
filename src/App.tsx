import React, { useState, useEffect, useRef } from 'react';
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
  BarChart3,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Search,
  Upload,
  BrainCircuit,
  AlertOctagon
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
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
}

interface Seed {
  id: string;
  seed_name: string;
  manufacturer: string;
  batch_number: string;
  production_date: string;
  hash: string;
  previous_hash: string;
  is_recalled?: boolean;
}

// --- Components ---

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

const LoginView = ({ onLogin }: { onLogin: (u: UserProfile) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'manufacturer' | 'admin' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const endpoint = isLogin ? '/login' : '/signup';
      const data = await api.post(endpoint, { username, password, role });
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-agri-green text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-agri-green text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Join Now
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-14">Identifier</label>
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
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-14">Credentials</label>
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
            {!isLogin && (
              <p className="text-[9px] text-gray-500 ml-4 leading-relaxed font-medium">
                Must include: 8+ chars, Uppercase, Lowercase, Number, Special char.
              </p>
            )}
          </div>
          {!isLogin && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-green/80 ml-14">Your Role</label>
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
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
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

const FarmerDashboard = ({ user, onBack }: { user: UserProfile, onBack: () => void }) => {
  const [view, setView] = useState<'home' | 'scan' | 'verifying' | 'verify' | 'report' | 'ai'>('home');
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (id: string) => {
    setView('verifying');
    setLoading(true);
    try {
      // Get location (mocked for now)
      const location = "Maharashtra, India";
      const result = await api.get(`/verify-seed/${id}?location=${location}`);
      
      // Artificial delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationResult(result);
      setScannedId(id);
      setView('verify');
    } catch (err: any) {
      alert(err.message);
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

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Farmer Dashboard</p>
          <h2 className="text-3xl font-bold">Welcome, {user.username}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-agri-green/10 border border-agri-green/20 flex items-center gap-2">
            <Award className="w-5 h-5 text-agri-green" />
            <span className="font-bold">{user.points} <span className="text-[10px] opacity-50">PTS</span></span>
          </div>
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center text-center space-y-4 py-10 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('scan')}>
          <div className="p-6 rounded-[32px] bg-agri-green/20 group-hover:scale-110 transition-transform">
            <Camera className="w-12 h-12 text-agri-green" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Verify Seed</h3>
            <p className="text-gray-400 text-sm">Scan QR code to check authenticity</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 py-10 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('ai')}>
          <div className="p-6 rounded-[32px] bg-blue-500/20 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Seed Analysis</h3>
            <p className="text-gray-400 text-sm">Upload image for quality prediction</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-agri-green" /> Recent Scans
          </h3>
          <button className="text-xs font-bold text-agri-green uppercase tracking-widest">View All</button>
        </div>
        <div className="space-y-4">
          <p className="text-center text-gray-500 py-4">No recent scans found.</p>
        </div>
      </Card>
    </div>
  );
};

const QRScanner = ({ onScan, onBack }: { onScan: (id: string) => void, onBack: () => void }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current.render((decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.id) {
          scannerRef.current?.clear();
          onScan(data.id);
        }
      } catch (e) {
        alert("Invalid QR Code Format");
      }
    }, (error) => {});

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md glass rounded-[40px] overflow-hidden relative">
        <div id="reader" className="w-full"></div>
        <div className="scan-line"></div>
      </div>
      <button onClick={onBack} className="btn-secondary flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" /> Go Back
      </button>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/report-fake', { seed_id: seedId, farmer_id: userId, report_reason: reason });
      alert("Report submitted successfully! You earned 50 points.");
      onBack();
    } catch (err: any) {
      alert(err.message);
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
      const data = await api.post('/analyze-seed', { image });
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
  const [loading, setLoading] = useState(false);

  const fetchSeeds = async () => {
    // Mocked for now, in real app we'd have a route for this
    // const data = await api.get('/my-seeds');
    // setSeeds(data.seeds);
  };

  if (view === 'add') {
    return <AddSeedView manufacturer={user.username} onBack={() => setView('home')} />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Manufacturer Dashboard</p>
          <h2 className="text-3xl font-bold">Welcome, {user.username}</h2>
        </div>
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center text-center space-y-4 py-10 cursor-pointer hover:bg-white/10 transition-all group" onClick={() => setView('add')}>
          <div className="p-6 rounded-[32px] bg-agri-green/20 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-12 h-12 text-agri-green" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Register New Batch</h3>
            <p className="text-gray-400 text-sm">Add seeds to blockchain ledger</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 py-10">
          <div className="p-6 rounded-[32px] bg-blue-500/20">
            <BarChart3 className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Production Stats</h3>
            <p className="text-gray-400 text-sm">Monitor your seed distribution</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold mb-6">Registered Seed Batches</h3>
        <p className="text-center text-gray-500 py-4">No batches registered yet.</p>
      </Card>
    </div>
  );
};

const AddSeedView = ({ manufacturer, onBack }: { manufacturer: string, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    seed_name: '',
    batch_number: '',
    production_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/add-seed', { ...formData, manufacturer });
      setQrData(data.qr_data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (qrData) {
    return (
      <div className="max-w-md mx-auto p-4 md:p-8 space-y-8 text-center">
        <div className="inline-block p-6 bg-white rounded-[40px] shadow-2xl">
          <QRCodeSVG value={qrData} size={250} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Batch Registered!</h2>
          <p className="text-gray-400">Download and print this QR code for your seed packets.</p>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => window.print()} className="btn-primary">Print QR Code</button>
          <button onClick={onBack} className="btn-secondary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-block p-4 rounded-3xl bg-agri-green/20 mb-4">
          <PlusCircle className="w-12 h-12 text-agri-green" />
        </div>
        <h2 className="text-3xl font-bold">Register Batch</h2>
        <p className="text-gray-400">Add new seed batch to AgriTrust</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Seed Name</label>
          <input 
            type="text" 
            className="input-field w-full" 
            placeholder="e.g. Hybrid Corn X1"
            value={formData.seed_name}
            onChange={(e) => setFormData({...formData, seed_name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Batch Number</label>
          <input 
            type="text" 
            className="input-field w-full" 
            placeholder="e.g. BATCH-2024-001"
            value={formData.batch_number}
            onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Production Date</label>
          <input 
            type="date" 
            className="input-field w-full" 
            value={formData.production_date}
            onChange={(e) => setFormData({...formData, production_date: e.target.value})}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Register & Generate QR'}
        </button>
        <button type="button" onClick={onBack} className="btn-secondary w-full">Cancel</button>
      </form>
    </div>
  );
};

const AdminDashboard = ({ user, onBack }: { user: UserProfile, onBack: () => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reportsData] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/all-reports')
        ]);
        setStats(statsData);
        setReports(reportsData.reports);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingOverlay message="Loading Admin Panel..." />;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-agri-green text-xs font-bold uppercase tracking-widest">Admin Control Panel</p>
          <h2 className="text-3xl font-bold">System Overview</h2>
        </div>
        <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Seeds</p>
          <p className="text-2xl font-bold">{stats?.totalSeeds.count}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Scans</p>
          <p className="text-2xl font-bold">{stats?.totalScans.count}</p>
        </Card>
        <Card className="p-4 space-y-1 border-red-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Fraud Detected</p>
          <p className="text-2xl font-bold text-red-500">{stats?.fraudulentScans.count}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fake Reports</p>
          <p className="text-2xl font-bold">{stats?.totalReports.count}</p>
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
            <AlertTriangle className="w-5 h-5 text-red-500" /> Recent Reports
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {reports.map((report) => (
              <div key={report.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm">{report.seed_name}</p>
                  <Badge color="red">Fake</Badge>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{report.report_reason}</p>
                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                  <span>By: {report.farmer_name}</span>
                  <span>{new Date(report.report_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-center text-gray-500 py-10">No reports found.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agritrust_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('agritrust_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agritrust_user');
    }
  }, [user]);

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {user.role === 'farmer' && <FarmerDashboard user={user} onBack={() => setUser(null)} />}
        {user.role === 'manufacturer' && <ManufacturerDashboard user={user} onBack={() => setUser(null)} />}
        {user.role === 'admin' && <AdminDashboard user={user} onBack={() => setUser(null)} />}
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
