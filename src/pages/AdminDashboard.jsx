/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  Users,
  Dumbbell,
  Bot,
  Scale,
  Trash2,
  Edit2,
  Shield,
  Loader2,
  X,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import useAdminStore from '../store/useAdminStore';

// Warna chart
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const {
    stats,
    users,
    exercises,
    loading,
    error,
    fetchStats,
    fetchUsers,
    fetchExercises,
    updateUser,
    deleteUser,
    addExercise,
    deleteExercise
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('overview'); // overview | users | exercises

  // State edit user
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'USER', password: '' });

  // State tambah gerakan
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseFormData, setExerciseFormData] = useState({
    name: '',
    muscleGroup: 'Dada',
    category: 'Kekuatan',
    description: ''
  });

  // State filter / search
  const [searchUser, setSearchUser] = useState('');
  const [searchExercise, setSearchExercise] = useState('');

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'exercises') {
      fetchExercises();
    }
  }, [activeTab]);

  // Handle Edit User
  const handleEditClick = (u) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      password: ''
    });
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, userFormData);
      setEditingUser(null);
    } catch (err) {
      alert('Gagal mengupdate pengguna: ' + err.message);
    }
  };

  // Handle Hapus User
  const handleDeleteUserClick = async (userId, userName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"? Tindakan ini akan menghapus seluruh data latihan, histori berat badan, dan riwayat chat secara permanen.`)) {
      try {
        await deleteUser(userId);
      } catch (err) {
        alert('Gagal menghapus pengguna: ' + err.message);
      }
    }
  };

  // Handle Tambah Gerakan Latihan
  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault();
    try {
      await addExercise(exerciseFormData);
      setShowAddExerciseModal(false);
      setExerciseFormData({
        name: '',
        muscleGroup: 'Dada',
        category: 'Kekuatan',
        description: ''
      });
    } catch (err) {
      alert('Gagal menambahkan gerakan latihan: ' + err.message);
    }
  };

  // Handle Hapus Gerakan Latihan
  const handleDeleteExerciseClick = async (id, name) => {
    if (confirm(`Hapus gerakan latihan "${name}" dari database? Gerakan ini tidak akan bisa lagi dipilih oleh user.`)) {
      try {
        await deleteExercise(id);
      } catch (err) {
        alert('Gagal menghapus gerakan latihan: ' + err.message);
      }
    }
  };

  // Data formatting untuk Recharts
  const fitnessGoalData = stats?.fitnessGoals
    ? Object.keys(stats.fitnessGoals).map((key) => ({
        name: key === 'MAINTAIN' ? 'Maintain' : key === 'BULKING' ? 'Bulking' : 'Cutting',
        value: stats.fitnessGoals[key]
      }))
    : [];

  const bmiData = stats?.bmiDistribution
    ? Object.keys(stats.bmiDistribution).map((key) => ({
        name: key === 'UNDERWEIGHT' ? 'Underweight' : key === 'NORMAL' ? 'Normal' : key === 'OVERWEIGHT' ? 'Overweight' : 'Obesity',
        count: stats.bmiDistribution[key]
      }))
    : [];

  // Filter lists harian
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchExercise.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchExercise.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="text-emerald-500" /> Admin System Panel
          </h1>
          <p className="text-neutral-400 mt-1">Pantau statistik server, kelola data pengguna, dan atur gerakan latihan.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1 self-start md:self-auto shadow-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Ringkasan Sistem
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Kelola Pengguna
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'exercises' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Kelola Latihan
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl">
          Error: {error}
        </div>
      )}

      {/* -------------------- 1. TAB RINGKASAN SISTEM -------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Grid Cards */}
          {loading && !stats ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Pengguna</span>
                    <h3 className="text-3xl font-black text-white">{stats?.totalUsers || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users size={22} />
                  </div>
                </div>

                {/* Total Workouts */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Latihan Selesai</span>
                    <h3 className="text-3xl font-black text-white">{stats?.totalWorkouts || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
                    <Dumbbell size={22} />
                  </div>
                </div>

                {/* Total Chat AI */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Chat AI</span>
                    <h3 className="text-3xl font-black text-white">{stats?.totalChats || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center">
                    <Bot size={22} />
                  </div>
                </div>

                {/* Rata-Rata Berat */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Rerata Berat User</span>
                    <h3 className="text-3xl font-black text-white">{stats?.averageWeight || 0} kg</h3>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl flex items-center justify-center">
                    <Scale size={22} />
                  </div>
                </div>
              </div>

              {/* Grafik Aggregasi */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Distribusi Goal */}
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-md font-bold text-white">Distribusi Target Fitness User</h4>
                  <div className="h-64 relative flex items-center justify-center">
                    {fitnessGoalData.length === 0 ? (
                      <p className="text-xs text-neutral-500">Belum ada data profil user.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fitnessGoalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {fitnessGoalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Distribusi BMI */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-md font-bold text-white">Distribusi Kategori BMI User</h4>
                  <div className="h-64">
                    {bmiData.length === 0 ? (
                      <p className="text-xs text-neutral-500">Belum ada data fisik user.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bmiData}>
                          <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
                          <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: '#262626', opacity: 0.4 }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
                            {bmiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* -------------------- 2. TAB KELOLA PENGGUNA -------------------- */}
      {activeTab === 'users' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Sistem Manajemen Pengguna</h3>
            <input
              type="text"
              placeholder="Cari user berdasarkan nama/email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-white text-xs outline-none transition-all w-full sm:max-w-xs"
            />
          </div>

          {loading && users.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-emerald-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">Pengguna tidak ditemukan.</div>
          ) : (
            <div className="overflow-x-auto border border-neutral-850 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-950 border-b border-neutral-850 text-neutral-400 uppercase tracking-wider font-semibold">
                    <th className="p-4">Nama</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Target Fitness</th>
                    <th className="p-4">Kondisi (BMI)</th>
                    <th className="p-4">Tgl Terdaftar</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-850/40 transition-colors">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 text-neutral-400">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400">
                        {u.profile?.targetFitness ? u.profile.targetFitness : '-'}
                      </td>
                      <td className="p-4 text-neutral-400">
                        {u.profile?.bmi ? `${u.profile.bmi} kg/m²` : '-'}
                      </td>
                      <td className="p-4 text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(u.id, u.name)}
                            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -------------------- 3. TAB KELOLA GERAKAN LATIHAN -------------------- */}
      {activeTab === 'exercises' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <BookOpen size={18} className="text-emerald-500" /> Database Gerakan Latihan
              </h3>
              <p className="text-xs text-neutral-400">Kelola dan tambahkan gerakan latihan yang dapat dipilih oleh pengguna.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Cari gerakan atau kelompok otot..."
                value={searchExercise}
                onChange={(e) => setSearchExercise(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-white text-xs outline-none transition-all flex-1"
              />
              <button
                onClick={() => setShowAddExerciseModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                <PlusCircle size={14} /> Tambah Gerakan
              </button>
            </div>
          </div>

          {loading && exercises.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-emerald-500" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">Gerakan tidak ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-semibold text-emerald-400">
                        {ex.muscleGroup}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-3 leading-normal">
                      {ex.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-900 mt-4 pt-3 text-[10px] text-neutral-600">
                    <span>Kategori: {ex.category}</span>
                    <button
                      onClick={() => handleDeleteExerciseClick(ex.id, ex.name)}
                      className="text-neutral-500 hover:text-red-500 p-1 hover:bg-neutral-900 rounded transition-colors cursor-pointer"
                      title="Hapus Gerakan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------- DIALOG MODAL EDIT USER -------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Edit Data Pengguna</h3>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Nama</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Peran (Role)</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                >
                  <option value="USER">USER (Pengguna Biasa)</option>
                  <option value="ADMIN">ADMIN (Pengelola Sistem)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Password Baru (Kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Ketik password baru..."
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- DIALOG MODAL TAMBAH GERAKAN LATIHAN -------------------- */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddExerciseModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Tambah Gerakan Latihan Baru</h3>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Nama Gerakan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Barbell Curl / Shoulder Press"
                  value={exerciseFormData.name}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Kelompok Otot</label>
                <select
                  value={exerciseFormData.muscleGroup}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, muscleGroup: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                >
                  <option value="Dada">Dada (Chest)</option>
                  <option value="Punggung">Punggung (Back)</option>
                  <option value="Bahu">Bahu (Shoulders)</option>
                  <option value="Lengan">Lengan (Arms - Biceps/Triceps)</option>
                  <option value="Kaki">Kaki (Legs)</option>
                  <option value="Core">Core (Abs/Perut)</option>
                  <option value="Seluruh Tubuh">Seluruh Tubuh (Full Body)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Kategori</label>
                <select
                  value={exerciseFormData.category}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, category: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs"
                >
                  <option value="Kekuatan">Kekuatan (Strength/Hypertrophy)</option>
                  <option value="Kardio">Kardio (Endurance/Burn)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Deskripsi Ringkas</label>
                <textarea
                  rows="3"
                  placeholder="Bagaimana melakukan gerakan, manfaat gerakan, dll."
                  value={exerciseFormData.description}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(false)}
                  className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !exerciseFormData.name}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Tambah Gerakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
