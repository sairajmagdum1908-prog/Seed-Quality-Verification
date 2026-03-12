import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, AlertTriangle, BarChart3, 
  Settings, LogOut, User as UserIcon,
  Activity, TrendingUp, Search, Filter,
  CheckCircle2, XCircle, Trash2, RefreshCcw,
  ShieldAlert, ShieldCheck, Database, Globe
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import { Card, Badge, LoadingOverlay, ConfirmationModal } from '../components/UI';

export const AdminDashboard = ({ user, onLogout, showToast }: { user: any, onLogout: () => void, showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: 'delete' | 'resolve', id: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, reportsData] = await Promise.all([
        api.getStats(),
        api.getUsers(),
        api.getReports()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!modalConfig) return;
    setIsLoading(true);
    try {
      if (modalConfig.type === 'delete') {
        await api.deleteUser(modalConfig.id);
        showToast("User deleted successfully", "success");
      } else {
        await api.resolveReport(modalConfig.id);
        showToast("Report resolved", "success");
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Action failed", "error");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setModalConfig(null);
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {isLoading && <LoadingOverlay message="Updating System..." />}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        title={modalConfig?.type === 'delete' ? "Delete User" : "Resolve Report"}
        message={modalConfig?.type === 'delete' 
          ? "Are you sure you want to delete this user? This action cannot be undone." 
          : "Are you sure you want to mark this report as resolved?"}
        onConfirm={handleAction}
        onCancel={() => setIsModalOpen(false)}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-green/20 flex items-center justify-center border border-agri-green/30">
              <Shield className="w-6 h-6 text-agri-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AgriTrust</h1>
              <p className="text-[10px] text-agri-green font-bold uppercase tracking-widest">System Administrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-agri-green/20 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-agri-green" />
              </div>
              <span className="text-sm font-bold">{user.username}</span>
            </div>
            <button onClick={onLogout} className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Seeds', value: stats?.totalSeeds || 0, icon: Database, color: 'agri-green' },
            { label: 'Total Scans', value: stats?.totalScans || 0, icon: Activity, color: 'blue' },
            { label: 'Fraud Alerts', value: stats?.fraudulentScans || 0, icon: ShieldAlert, color: 'red' },
            { label: 'Active Users', value: users.length, icon: Users, color: 'yellow' }
          ].map((item, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                  <h2 className="text-3xl font-bold">{item.value}</h2>
                </div>
                <div className={`p-3 rounded-2xl bg-${item.color}-500/10`}>
                  <item.icon className={`w-6 h-6 text-${item.color === 'agri-green' ? 'agri-green' : item.color + '-500'}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">System Control</h3>
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'reports', label: 'Fraud Reports', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
                    activeTab === tab.id 
                    ? 'bg-agri-green border-agri-green text-white shadow-lg shadow-agri-green/20' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <Card className="mt-8 bg-agri-green/5 border-agri-green/10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-agri-green" />
                  <span className="text-xs font-bold uppercase tracking-widest text-agri-green">Network Status</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Blockchain</span>
                  <span className="text-agri-green font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">API Latency</span>
                  <span className="text-agri-green font-bold">24ms</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8">
                      <h3 className="text-lg font-bold mb-8">Scan Activity (Heatmap)</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.scanHeatmap || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ color: '#10B981' }}
                            />
                            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="p-8">
                      <h3 className="text-lg font-bold mb-8">User Distribution</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats?.roleDistribution || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="role"
                            >
                              {(stats?.roleDistribution || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold">User Management</h2>
                    <button onClick={fetchData} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <RefreshCcw className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {users.map((u) => (
                      <Card key={u.id} className="hover:bg-white/5 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-agri-green/20 transition-all">
                              <UserIcon className="w-6 h-6 text-gray-500 group-hover:text-agri-green" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold">{u.username}</h4>
                                <Badge color={u.role === 'admin' ? 'red' : u.role === 'manufacturer' ? 'blue' : 'green'}>
                                  {u.role}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{u.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
                              <p className="text-sm font-medium text-agri-green">Active</p>
                            </div>
                            {u.id !== user.id && (
                              <button 
                                onClick={() => {
                                  setModalConfig({ type: 'delete', id: u.id });
                                  setIsModalOpen(true);
                                }}
                                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold">Fraud Reports</h2>
                    <Badge color="red">{reports.filter(r => r.status === 'pending').length} Pending</Badge>
                  </div>

                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <Card className="text-center py-20">
                        <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No reports found</p>
                      </Card>
                    ) : (
                      reports.map((report) => (
                        <Card key={report.id} className={`border ${report.status === 'pending' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.status === 'pending' ? 'bg-red-500/20' : 'bg-white/5'}`}>
                                <AlertTriangle className={`w-6 h-6 ${report.status === 'pending' ? 'text-red-500' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold">Seed ID: {report.seed_id}</h4>
                                  <Badge color={report.status === 'pending' ? 'red' : 'green'}>{report.status}</Badge>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                              </div>
                            </div>
                            {report.status === 'pending' && (
                              <button 
                                onClick={() => {
                                  setModalConfig({ type: 'resolve', id: report.id });
                                  setIsModalOpen(true);
                                }}
                                className="px-6 py-3 rounded-xl bg-agri-green hover:bg-agri-green/90 text-white text-xs font-bold transition-all"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
