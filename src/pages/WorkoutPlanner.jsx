/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Plus, Trash2, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle, AlertCircle } from 'lucide-react';
import useWorkoutStore from '../store/useWorkoutStore';
import useUserStore from '../store/useUserStore';

const WorkoutPlanner = () => {
  const { profileDetails, fetchProfile } = useUserStore();
  const {
    exercises,
    schedules,
    currentSession,
    fetchExercises,
    fetchSchedules,
    saveSchedule,
    fetchSessionByDate,
    updateAttendance,
    addExerciseToSession,
    updateExerciseLog,
    deleteExerciseFromSession
  } = useWorkoutStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  
  // States untuk form jadwal mingguan
  const [scheduleForm, setScheduleForm] = useState(Array(7).fill(''));

  // States untuk tambah gerakan latihan
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBySplit, setFilterBySplit] = useState(true);
  const [exerciseFormData, setExerciseFormData] = useState({
    exerciseId: '',
    sets: '3',
    reps: '10',
    weight: '20',
  });

  // States untuk presensi cepat harian
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    status: 'COMPLETED',
    bodyWeight: '',
    missedReason: 'Sakit',
  });

  const getFormattedDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchExercises();
    fetchSchedules();
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchSessionByDate(getFormattedDateString(selectedDate));
  }, [selectedDate]);

  // Sync data jadwal ketika schedules termuat
  useEffect(() => {
    if (schedules.length > 0) {
      const arr = Array(7).fill('Rest Day');
      schedules.forEach((item) => {
        arr[item.dayOfWeek] = item.title;
      });
      setScheduleForm(arr);
    }
  }, [schedules]);

  // Sync form berat badan ketika profil termuat
  useEffect(() => {
    if (profileDetails?.profile?.weight) {
      setAttendanceData((prev) => ({
        ...prev,
        bodyWeight: profileDetails.profile.weight.toString(),
      }));
    }
  }, [profileDetails]);

  // Ubah Hari Calendar
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Simpan Jadwal Mingguan
  const handleSaveSchedules = async () => {
    try {
      for (let i = 0; i < 7; i++) {
        await saveSchedule(i, scheduleForm[i]);
      }
      setShowEditSchedule(false);
      // Refresh sesi hari ini jika jadwal mingguan berubah
      fetchSessionByDate(getFormattedDateString(selectedDate));
    } catch (err) {
      alert('Gagal menyimpan jadwal split latihan: ' + err.message);
    }
  };

  const handleScheduleChange = (dayIndex, value) => {
    const nextArr = [...scheduleForm];
    nextArr[dayIndex] = value;
    setScheduleForm(nextArr);
  };

  // Kirim Presensi Kehadiran
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!currentSession) return;
    try {
      await updateAttendance(currentSession.id, {
        status: attendanceData.status,
        bodyWeight: attendanceData.bodyWeight ? parseFloat(attendanceData.bodyWeight) : null,
        missedReason: attendanceData.status === 'MISSED' ? attendanceData.missedReason : null,
      });
      setShowAttendanceForm(false);
    } catch (err) {
      alert('Gagal mencatat presensi: ' + err.message);
    }
  };

  // Tambah Latihan
  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault();
    if (!currentSession || !exerciseFormData.exerciseId) return;

    try {
      await addExerciseToSession(currentSession.id, {
        exerciseId: parseInt(exerciseFormData.exerciseId),
        sets: parseInt(exerciseFormData.sets),
        reps: parseInt(exerciseFormData.reps),
        weight: parseFloat(exerciseFormData.weight),
      });
      setShowAddExercise(false);
      // Reset form
      setExerciseFormData((prev) => ({
        ...prev,
        exerciseId: '',
      }));
    } catch (err) {
      alert('Gagal menambahkan latihan: ' + err.message);
    }
  };

  const handleToggleExerciseCompleted = async (logId, currentCompleted) => {
    if (!currentSession) return;
    try {
      await updateExerciseLog(currentSession.id, logId, {
        completed: !currentCompleted,
      });
    } catch (err) {
      console.error('Gagal memperbarui status penyelesaian latihan:', err);
    }
  };

  const handleDeleteExercise = async (logId) => {
    if (!currentSession) return;
    if (confirm('Hapus gerakan latihan ini dari log?')) {
      try {
        await deleteExerciseFromSession(currentSession.id, logId);
      } catch (err) {
        console.error('Gagal menghapus latihan:', err);
      }
    }
  };

  // Helper untuk memfilter gerakan berdasarkan split latihan hari ini
  const getExercisesForSchedule = (scheduleTitle, allExercises) => {
    if (!scheduleTitle) return allExercises;
    const title = scheduleTitle.toLowerCase();

    if (title.includes('pull')) {
      // Pull: Punggung, dan Lengan (hanya jika nama mengandung Bicep atau Curl)
      return allExercises.filter(ex => 
        ex.muscleGroup === 'Punggung' || 
        (ex.muscleGroup === 'Lengan' && (ex.name.toLowerCase().includes('bicep') || ex.name.toLowerCase().includes('curl')))
      );
    }
    if (title.includes('push')) {
      // Push: Dada, Bahu, dan Lengan (hanya jika nama mengandung Tricep atau Press)
      return allExercises.filter(ex => 
        ex.muscleGroup === 'Dada' || 
        ex.muscleGroup === 'Bahu' || 
        (ex.muscleGroup === 'Lengan' && (ex.name.toLowerCase().includes('tricep') || ex.name.toLowerCase().includes('press')))
      );
    }
    if (title.includes('leg') || title.includes('kaki')) {
      return allExercises.filter(ex => ex.muscleGroup === 'Kaki');
    }
    if (title.includes('upper')) {
      return allExercises.filter(ex => 
        ['Dada', 'Punggung', 'Bahu', 'Lengan'].includes(ex.muscleGroup)
      );
    }
    if (title.includes('abs') || title.includes('core') || title.includes('perut')) {
      return allExercises.filter(ex => ex.muscleGroup === 'Core');
    }
    return allExercises;
  };

  const currentSplitTitle = scheduleForm[selectedDate.getDay()] || '';

  const hasMatchingSplit = (() => {
    if (!currentSplitTitle) return false;
    const title = currentSplitTitle.toLowerCase();
    return (
      title.includes('pull') ||
      title.includes('push') ||
      title.includes('leg') ||
      title.includes('kaki') ||
      title.includes('upper') ||
      title.includes('abs') ||
      title.includes('core') ||
      title.includes('perut')
    );
  })();

  const activeExercises = (filterBySplit && hasMatchingSplit)
    ? getExercisesForSchedule(currentSplitTitle, exercises)
    : exercises;

  // Pencarian Latihan
  const filteredExercises = activeExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDayNameInIndonesian = (dayOfWeek) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Workout Planner</h1>
          <p className="text-neutral-400 mt-1">Susun jadwal latihan mingguan dan catat latihan fisik harian Anda.</p>
        </div>
        
        {/* Tombol Buka Split Mingguan */}
        <button
          onClick={() => setShowEditSchedule(true)}
          className="flex items-center gap-2 px-5 py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold rounded-xl cursor-pointer text-sm shadow-md transition-colors"
        >
          <Calendar size={18} className="text-emerald-500" />
          <span>Atur Jadwal Mingguan (Split)</span>
        </button>
      </div>

      {/* Grid Kalender Harian & Presensi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kontrol Sesi Latihan Hari Ini */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Kontrol Tanggal (Date Picker & Navigation) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">
                {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-xs text-neutral-500">
                Mingguan: {getDayNameInIndonesian(selectedDate.getDay())} - {scheduleForm[selectedDate.getDay()] || 'Hari Istirahat'}
              </p>
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Sesi Latihan */}
          {currentSession && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Info Sesi & Absensi Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Sesi Aktif ({currentSession.status === 'COMPLETED' ? 'Latihan Selesai' : currentSession.status === 'REST_DAY' ? 'Rest Day' : currentSession.status === 'MISSED' ? 'Absen' : 'Rencana'})
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {scheduleForm[selectedDate.getDay()] || 'Latihan Harian'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setAttendanceData({
                      status: currentSession.status,
                      bodyWeight: currentSession.bodyWeight || profileDetails?.profile?.weight || '',
                      missedReason: currentSession.missedReason || 'Sakit',
                    });
                    setShowAttendanceForm(true);
                  }}
                  className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Ubah Presensi / BB Harian
                </button>
              </div>

              {/* Log Gerakan Latihan */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-bold text-white">Daftar Gerakan Latihan</h4>
                  {currentSession.status !== 'REST_DAY' && currentSession.status !== 'MISSED' && (
                    <button
                      onClick={() => setShowAddExercise(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-md shadow-emerald-500/5"
                    >
                      <Plus size={14} /> Tambah Gerakan
                    </button>
                  )}
                </div>

                {currentSession.status === 'REST_DAY' ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-neutral-950 border border-neutral-800/80 rounded-xl text-neutral-500 gap-2">
                    <AlertCircle size={32} className="text-blue-500" />
                    <h5 className="font-bold text-neutral-400 text-sm">Hari Ini Adalah Rest Day</h5>
                    <p className="text-xs text-neutral-600 max-w-[250px] text-center leading-relaxed">
                      Anda menjadwalkan hari ini sebagai pemulihan fisik. Istirahatlah dengan optimal untuk otot tumbuh berkembang.
                    </p>
                  </div>
                ) : currentSession.status === 'MISSED' ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-neutral-950 border border-neutral-800/80 rounded-xl text-neutral-500 gap-2">
                    <AlertTriangle size={32} className="text-red-500" />
                    <h5 className="font-bold text-neutral-400 text-sm">Latihan Terlewat (Absen)</h5>
                    <p className="text-xs text-neutral-600 max-w-[250px] text-center leading-relaxed">
                      Latihan hari ini ditandai sebagai dilewatkan dengan alasan: **"{currentSession.missedReason}"**. Ayo ganti di esok hari!
                    </p>
                  </div>
                ) : currentSession.exercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-neutral-950 border border-neutral-800/80 rounded-xl text-neutral-500 gap-2">
                    <Dumbbell size={36} className="text-neutral-700 animate-pulse" />
                    <h5 className="font-bold text-neutral-400 text-sm">Belum Ada Gerakan</h5>
                    <p className="text-xs text-neutral-600">Tekan "+ Tambah Gerakan" untuk menambahkan set beban latihan hari ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentSession.exercises.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          log.completed
                            ? 'bg-emerald-500/5 border-emerald-500/25 text-neutral-400'
                            : 'bg-neutral-950 border-neutral-800 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Checkbox status selesai */}
                          <input
                            type="checkbox"
                            checked={log.completed}
                            onChange={() => handleToggleExerciseCompleted(log.id, log.completed)}
                            className="w-5 h-5 accent-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <p className={`text-sm font-bold ${log.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                              {log.exercise?.name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {log.sets} Set x {log.reps} Reps | Beban: {log.weight} kg
                            </p>
                          </div>
                        </div>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDeleteExercise(log.id)}
                          className="text-neutral-500 hover:text-red-500 p-1.5 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Petunjuk / Informasi Program Kebugaran Terkait Target */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Anjuran Jadwal Latihan</h3>
            <p className="text-xs text-neutral-400 leading-normal">
              Susun jadwal split latihan Anda agar sejalan dengan tujuan utama **{profileDetails?.profile?.targetFitness || 'FITNESS'}**.
            </p>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl">
                <span className="font-bold text-emerald-400 block mb-0.5">Bulking (Penambahan Otot)</span>
                4-5 hari latihan beban intensitas tinggi per minggu. 2 hari istirahat total (Rest) untuk pemulihan optimal.
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl">
                <span className="font-bold text-blue-400 block mb-0.5">Cutting (Pembakaran Lemak)</span>
                3-4 hari latihan beban kekuatan untuk menjaga otot. Tambahkan 2-3 hari kardio terpisah atau sehabis sesi latihan.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT JADWAL MINGGUAN */}
      {showEditSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEditSchedule(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 font-sans">Edit Split Latihan Mingguan</h3>
            <p className="text-xs text-neutral-400 mb-6 font-sans">
              Atur fokus program latihan utama Anda di tiap harinya.
            </p>

            <div className="space-y-3">
              {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((dayName, index) => (
                <div key={index} className="grid grid-cols-3 items-center gap-4">
                  <span className="text-xs font-bold text-neutral-300">{dayName}</span>
                  <input
                    type="text"
                    value={scheduleForm[index]}
                    onChange={(e) => handleScheduleChange(index, e.target.value)}
                    placeholder="Contoh: Chest & Triceps / Rest Day"
                    className="col-span-2 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-white outline-none text-xs transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6 border-t border-neutral-800 mt-6">
              <button
                type="button"
                onClick={() => setShowEditSchedule(false)}
                className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSchedules}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg hover:shadow-emerald-500/10"
              >
                Simpan Split Mingguan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ABSENSI & BB HARIAN */}
      {showAttendanceForm && currentSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAttendanceForm(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" />
              Update Presensi Latihan
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Tentukan status keaktifan latihan Anda untuk tanggal {selectedDate.toLocaleDateString('id-ID')}.
            </p>

            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Status Latihan</label>
                <div className="grid grid-cols-3 gap-2">
                  {['COMPLETED', 'REST_DAY', 'MISSED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceData({ ...attendanceData, status: st })}
                      className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        attendanceData.status === st
                          ? st === 'COMPLETED' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                            : st === 'REST_DAY' ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                            : 'bg-red-600/10 border-red-500 text-red-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {st === 'COMPLETED' ? 'Selesai' : st === 'REST_DAY' ? 'Rest Day' : 'Absen'}
                    </button>
                  ))}
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
              </div>

              {/* Alasan jika Absen */}
              {attendanceData.status === 'MISSED' && (
                <div className="space-y-2 animate-in slide-in-from-top-3 duration-200">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Alasan Absen</label>
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

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAttendanceForm(false)}
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

      {/* MODAL TAMBAH GERAKAN LATIHAN */}
      {showAddExercise && currentSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddExercise(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Tambah Gerakan Latihan</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Pilih gerakan dari database latihan standar dan isikan set target Anda.
            </p>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
              {/* Cari Latihan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Cari & Pilih Gerakan</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama gerakan atau kelompok otot... (Misal: Bench Press)"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none text-xs transition-all mb-2"
                />

                {hasMatchingSplit && (
                  <div className="flex items-center gap-2 mb-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
                    <input
                      type="checkbox"
                      id="splitFilter"
                      checked={filterBySplit}
                      onChange={(e) => setFilterBySplit(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded border-neutral-805 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="splitFilter" className="text-[10px] text-emerald-400 font-semibold cursor-pointer select-none">
                      Filter gerakan untuk split "{currentSplitTitle}" aktif
                    </label>
                  </div>
                )}
                
                <div className="max-h-40 overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950 p-2 space-y-1">
                  {filteredExercises.length === 0 ? (
                    <p className="text-xs text-neutral-500 p-2 text-center">Gerakan tidak ditemukan.</p>
                  ) : (
                    filteredExercises.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          setExerciseFormData({ ...exerciseFormData, exerciseId: ex.id.toString() });
                          setSearchQuery(ex.name);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                          exerciseFormData.exerciseId === ex.id.toString()
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        <span>{ex.name}</span>
                        <span className="opacity-80 text-[10px]">({ex.muscleGroup})</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Set target detail (sets, reps, weight) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Jumlah Set</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={exerciseFormData.sets}
                    onChange={(e) => setExerciseFormData({ ...exerciseFormData, sets: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-white outline-none text-xs transition-all text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Reps / Set</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={exerciseFormData.reps}
                    onChange={(e) => setExerciseFormData({ ...exerciseFormData, reps: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-white outline-none text-xs transition-all text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Beban (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    required
                    value={exerciseFormData.weight}
                    onChange={(e) => setExerciseFormData({ ...exerciseFormData, weight: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-white outline-none text-xs transition-all text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-neutral-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddExercise(false)}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!exerciseFormData.exerciseId}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg hover:shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner;
