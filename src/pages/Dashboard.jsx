/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Activity, Flame, Dumbbell, Target, CheckCircle2, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import useWorkoutStore from '../store/useWorkoutStore';
import useNutritionStore from '../store/useNutritionStore';

// Custom tooltips untuk grafik recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-xl">
        <p className="text-xs text-neutral-400 font-semibold mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-400">Berat: {payload[0].value} kg</p>
        {payload[1] && <p className="text-xs text-blue-400 mt-0.5">BMI: {payload[1].value}</p>}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { profileDetails, bodyHistory, fetchProfile, fetchHistory } = useUserStore();
  const { currentSession, fetchSessionByDate, updateAttendance, fetchSessionsHistory, sessionsHistory } = useWorkoutStore();
  const { nutritionPlan, fetchNutritionPlan } = useNutritionStore();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    status: 'COMPLETED',
    bodyWeight: '',
    missedReason: 'Sakit',
  });

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchProfile();
    fetchHistory();
    fetchNutritionPlan();
    fetchSessionsHistory();
    fetchSessionByDate(getTodayDateString());
  }, []);

  // Update form default ketika profil dimuat
  useEffect(() => {
    if (profileDetails?.profile?.weight) {
      setAttendanceData((prev) => ({
        ...prev,
        bodyWeight: profileDetails.profile.weight.toString(),
      }));
    }
  }, [profileDetails]);

  // Siapkan data grafik perkembangan berat badan
  const chartData = bodyHistory.map((item) => {
    const date = new Date(item.recordedAt);
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const month = monthNames[date.getMonth()];
    return {
      name: `${day} ${month}`,
      'Berat (kg)': item.weight,
      'BMI': item.bmi,
    };
  });

  const getBmiCategoryName = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return 'Kurang Berat Badan';
      case 'NORMAL': return 'Normal (Ideal)';
      case 'OVERWEIGHT': return 'Kelebihan Berat Badan';
      case 'OBESE': return 'Obesitas';
      default: return 'Belum Diisi';
    }
  };

  const getBmiCategoryColor = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return 'text-yellow-400';
      case 'NORMAL': return 'text-emerald-400';
      case 'OVERWEIGHT': return 'text-orange-400';
      case 'OBESE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSessionStatusBadge = (status, reason) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Latihan Selesai
          </span>
        );
      case 'REST_DAY':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle size={12} /> Hari Istirahat (Rest)
          </span>
        );
      case 'MISSED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle size={12} /> Absen ({reason || 'Tanpa Alasan'})
          </span>
        );
      case 'PLANNED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Rencana Latihan
          </span>
        );
    }
  };

  // Jumlah latihan selesai minggu ini
  const completedWorkoutsThisWeek = sessionsHistory.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return s.status === 'COMPLETED' && sessionDate >= oneWeekAgo;
  }).length;

  const handleOpenCheckIn = () => {
    setAttendanceData({
      status: currentSession?.status || 'COMPLETED',
      bodyWeight: currentSession?.bodyWeight || profileDetails?.profile?.weight || '',
      missedReason: currentSession?.missedReason || 'Sakit',
    });
    setShowCheckInModal(true);
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!currentSession) return;

    try {
      await updateAttendance(currentSession.id, {
        status: attendanceData.status,
        bodyWeight: attendanceData.bodyWeight ? parseFloat(attendanceData.bodyWeight) : null,
        missedReason: attendanceData.status === 'MISSED' ? attendanceData.missedReason : null,
      });
      // Sinkronkan state setelah update
      fetchProfile();
      fetchHistory();
      setShowCheckInModal(false);
    } catch (err) {
      alert('Gagal mengirim absensi: ' + (err.response?.data?.message || err.message));
    }
  };

  const activeWorkoutsCount = currentSession?.exercises?.length || 0;
  const completedExercisesCount = currentSession?.exercises?.filter(e => e.completed).length || 0;

  return (
    <div className="space-y-6">
      {/* Header Selamat Datang */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Halo, {user?.name || 'Fighter'}! 👋</h1>
          <p className="text-neutral-400 mt-1">Ini ringkasan perkembangan tubuh dan target latihan Anda hari ini.</p>
        </div>
        
        {/* Tombol Absensi Harian */}
        <button
          onClick={handleOpenCheckIn}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          <CheckCircle2 size={18} />
          <span>Absen & Check-in BB</span>
        </button>
      </div>

      {/* Grid Kartu Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Berat Badan */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800/80 flex items-center gap-4 hover:border-neutral-700/60 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Berat Badan</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {profileDetails?.profile?.weight ? `${profileDetails.profile.weight} kg` : '--'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Ideal: {profileDetails?.idealWeight ? `${profileDetails.idealWeight.ideal} kg` : '--'}
            </p>
          </div>
        </div>

        {/* BMI */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800/80 flex items-center gap-4 hover:border-neutral-700/60 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status BMI</p>
            <h3 className={`text-xl font-extrabold mt-1 truncate max-w-[170px] ${getBmiCategoryColor(profileDetails?.status)}`}>
              {profileDetails ? getBmiCategoryName(profileDetails.status) : 'Profil Kosong'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Skor: {profileDetails?.bmi ? profileDetails.bmi : '--'}
            </p>
          </div>
        </div>

        {/* Kalori Harian */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800/80 flex items-center gap-4 hover:border-neutral-700/60 transition-all">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Target Kalori</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {nutritionPlan ? `${nutritionPlan.dailyCalories.toLocaleString('id-ID')} kcal` : '--'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Goal: {profileDetails?.profile?.targetFitness || '--'}
            </p>
          </div>
        </div>

        {/* Latihan Selesai */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800/80 flex items-center gap-4 hover:border-neutral-700/60 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Latihan Selesai</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{completedWorkoutsThisWeek} Sesi</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Dalam 7 hari terakhir</p>
          </div>
        </div>
      </div>

      {/* Grid Grafik dan Jadwal Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Perkembangan Berat Badan */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-2xl border border-neutral-800/85 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Grafik Perkembangan Tubuh</h3>
              <p className="text-xs text-neutral-400">Pergerakan berat badan & skor BMI Anda harian</p>
            </div>
            {bodyHistory.length > 1 && (
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 font-semibold">
                Progres Aktif
              </span>
            )}
          </div>
          
          <div className="h-64 w-full">
            {bodyHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                <Target size={36} className="text-neutral-600 animate-pulse" />
                <p className="text-sm">Belum ada riwayat berat badan.</p>
                <p className="text-xs text-neutral-600">Klik "Absen & Check-in BB" untuk mengisi berat badan perdana!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Berat (kg)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
                  <Area type="monotone" dataKey="BMI" stroke="#3b82f6" strokeWidth={1} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Absensi & Latihan Hari Ini */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800/85 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white">Status Hari Ini</h3>
              {currentSession ? getSessionStatusBadge(currentSession.status, currentSession.missedReason) : '--'}
            </div>

            {currentSession?.status === 'COMPLETED' ? (
              <div className="space-y-4 my-auto py-6">
                <div className="flex flex-col items-center text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <CheckCircle2 size={44} className="text-emerald-500 mb-3" />
                  <h4 className="font-bold text-white">Latihan Selesai!</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                    Hari yang bagus! Anda menyelesaikan {completedExercisesCount} dari {activeWorkoutsCount} gerakan latihan.
                  </p>
                  {currentSession.bodyWeight && (
                    <div className="mt-3 px-3 py-1 bg-neutral-800 rounded-full text-xs text-neutral-300 font-semibold">
                      BB Tercatat: {currentSession.bodyWeight} kg
                    </div>
                  )}
                </div>
              </div>
            ) : currentSession?.status === 'REST_DAY' ? (
              <div className="space-y-4 my-auto py-6">
                <div className="flex flex-col items-center text-center p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <Activity size={44} className="text-blue-500 mb-3 animate-pulse" />
                  <h4 className="font-bold text-white">Waktunya Pemulihan</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                    Hari ini dijadwalkan sebagai Rest Day. Otot tumbuh saat Anda beristirahat dan memulihkan diri!
                  </p>
                </div>
              </div>
            ) : currentSession?.status === 'MISSED' ? (
              <div className="space-y-4 my-auto py-6">
                <div className="flex flex-col items-center text-center p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <AlertTriangle size={44} className="text-red-500 mb-3" />
                  <h4 className="font-bold text-white">Latihan Terlewat</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
                    Alasan: "{currentSession.missedReason}". Jangan berkecil hati, ayo kembali konsisten besok!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-800">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Jadwal Terdaftar</span>
                  <h4 className="text-md font-bold text-white mt-1">
                    {currentSession?.schedule?.title || 'Latihan Mandiri / Latihan Bebas'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    {activeWorkoutsCount > 0 ? `${activeWorkoutsCount} gerakan terdaftar.` : 'Belum ada gerakan latihan yang dicatat untuk hari ini.'}
                  </p>
                </div>
                <button
                  onClick={handleOpenCheckIn}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Ubah Presensi / Isi BB Harian
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4 mt-4 flex items-center justify-between text-xs text-neutral-500">
            <span>Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Modal Absen / Check-In Harian */}
      {showCheckInModal && currentSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCheckInModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 font-sans">
              <CheckCircle2 className="text-emerald-500" />
              Presensi & Berat Badan Harian
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Catat status latihan Anda untuk hari ini dan update berat badan Anda secara teratur.
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              {/* Status Pilihan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Status Latihan</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceData({ ...attendanceData, status: 'COMPLETED' })}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      attendanceData.status === 'COMPLETED'
                        ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    Latihan Selesai
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceData({ ...attendanceData, status: 'REST_DAY' })}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      attendanceData.status === 'REST_DAY'
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    Rest Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceData({ ...attendanceData, status: 'MISSED' })}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      attendanceData.status === 'MISSED'
                        ? 'bg-red-600/10 border-red-500 text-red-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    Absen Latihan
                  </button>
                </div>
              </div>

              {/* Input Berat Badan (BB) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Berat Badan Hari Ini (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={attendanceData.bodyWeight}
                  onChange={(e) => setAttendanceData({ ...attendanceData, bodyWeight: e.target.value })}
                  placeholder="Misal: 72.5"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
                />
                <p className="text-[10px] text-neutral-500">Berat badan Anda akan disinkronisasikan ke dalam grafik perkembangan tubuh harian.</p>
              </div>

              {/* Pilihan Alasan Jika Absen */}
              {attendanceData.status === 'MISSED' && (
                <div className="space-y-2 animate-in slide-in-from-top-3 duration-200">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Alasan Absen Latihan</label>
                  <select
                    value={attendanceData.missedReason}
                    onChange={(e) => setAttendanceData({ ...attendanceData, missedReason: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
                  >
                    <option value="Sakit">Sakit / Cedera</option>
                    <option value="Sibuk">Sibuk Pekerjaan / Studi</option>
                    <option value="Malas">Kurang Motivasi / Lelah</option>
                    <option value="Liburan">Sedang Liburan / Mudik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg hover:shadow-emerald-500/10"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
