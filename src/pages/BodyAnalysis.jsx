/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Activity, Heart, Award, Zap, Check, Loader2 } from 'lucide-react';
import useUserStore from '../store/useUserStore';

const BodyAnalysis = () => {
  const { profileDetails, updateProfile, fetchProfile, loading } = useUserStore();

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    dateOfBirth: '',
    gender: 'MALE',
    targetFitness: 'MAINTAIN',
    activityLevel: 'MODERATELY_ACTIVE',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProfile().then((data) => {
      if (data?.profile) {
        const { height, weight, dateOfBirth, gender, targetFitness, activityLevel } = data.profile;
        setFormData({
          height: height.toString(),
          weight: weight.toString(),
          dateOfBirth: dateOfBirth ? dateOfBirth.substring(0, 10) : '',
          gender,
          targetFitness,
          activityLevel,
        });
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuccess(false);
    try {
      await updateProfile({
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        targetFitness: formData.targetFitness,
        activityLevel: formData.activityLevel,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Gagal memperbarui data profil: ' + err.message);
    }
  };

  const getBmiCategoryLabel = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return 'Kurang Berat Badan (Underweight)';
      case 'NORMAL': return 'Normal / Berat Badan Ideal';
      case 'OVERWEIGHT': return 'Kelebihan Berat Badan (Overweight)';
      case 'OBESE': return 'Obesitas (Obese)';
      default: return '-';
    }
  };

  const getBmiCategoryDesc = (category) => {
    switch (category) {
      case 'UNDERWEIGHT':
        return 'Berat badan Anda di bawah batas ideal. Disarankan meningkatkan asupan nutrisi padat kalori dan melakukan latihan beban (strength training) untuk menaikkan massa otot.';
      case 'NORMAL':
        return 'Selamat! Komposisi tubuh Anda berada dalam kategori sehat. Pertahankan kebiasaan makan bernutrisi tinggi dan rutinitas olahraga Anda.';
      case 'OVERWEIGHT':
        return 'Anda sedikit di atas rentang ideal. Memulai defisit kalori moderat dan meningkatkan frekuensi kardio dapat membantu mengembalikan komposisi tubuh ideal.';
      case 'OBESE':
        return 'Kategori ini dapat memicu risiko kesehatan jantung dan persendian. Sangat disarankan fokus pada diet gizi seimbang konsisten, kardio ringan low-impact, dan konsultasi fitness rutin.';
      default:
        return 'Lengkapi data fisik Anda di samping untuk melihat analisis tubuh.';
    }
  };

  const getBmiBgColor = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'NORMAL': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'OVERWEIGHT': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'OBESE': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-neutral-800/40 border-neutral-700/30 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Analisis Kondisi Tubuh</h1>
        <p className="text-neutral-400 mt-1">Kelola informasi fisik Anda untuk menghitung BMR, TDEE, skor BMI, dan anjuran fitness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Pengisian Data Fisik */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2">Perbarui Data Fisik</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Tinggi Badan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Tinggi (cm)</label>
              <input
                type="number"
                required
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="Misal: 170"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
              />
            </div>
            {/* Berat Badan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Berat (kg)</label>
              <input
                type="number"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Misal: 68"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tanggal Lahir */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Tgl Lahir</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
              />
            </div>
            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Target Fitness */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase">Target Fitness</label>
            <select
              value={formData.targetFitness}
              onChange={(e) => setFormData({ ...formData, targetFitness: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
            >
              <option value="BULKING">Bulking (Surplus Kalori & Otot)</option>
              <option value="CUTTING">Cutting (Defisit Kalori & Bakar Lemak)</option>
              <option value="MAINTAIN">Maintain (Jaga Berat Badan & Stamina)</option>
            </select>
          </div>

          {/* Tingkat Aktivitas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase">Tingkat Aktivitas Harian</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition-all"
            >
              <option value="SEDENTARY">Sedentary (Jarang berolahraga)</option>
              <option value="LIGHTLY_ACTIVE">Lightly Active (Olahraga 1-3 hari/minggu)</option>
              <option value="MODERATELY_ACTIVE">Moderately Active (Olahraga 3-5 hari/minggu)</option>
              <option value="VERY_ACTIVE">Very Active (Olahraga 6-7 hari/minggu)</option>
              <option value="EXTRA_ACTIVE">Extra Active (Olahraga berat/Atlet fisik harian)</option>
            </select>
          </div>

          {showSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl animate-in fade-in duration-200">
              <Check size={14} />
              <span>Data fisik berhasil disimpan dan dianalisis!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Hitung & Simpan Profil'}
          </button>
        </form>

        {/* Panel Hasil Kalkulasi Kebugaran */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Utama BMI */}
          <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white">Hasil Analisis BMI & Status Tubuh</h3>
            
            {!profileDetails ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500 text-center gap-2">
                <Activity size={40} className="text-neutral-700 animate-bounce" />
                <p className="text-sm">Data tubuh Anda masih kosong.</p>
                <p className="text-xs text-neutral-600">Lengkapi formulir di samping untuk melihat kalkulasi metabolisme tubuh.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BMI Card */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase">Skor BMI</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white">{profileDetails.bmi}</span>
                      <span className="text-xs text-neutral-500">kg/m²</span>
                    </div>
                  </div>

                  {/* Berat Ideal Card */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 col-span-2 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase">Rentang Berat Badan Ideal</span>
                    <div className="mt-2">
                      <span className="text-2xl font-extrabold text-white">
                        {profileDetails.idealWeight.min} kg - {profileDetails.idealWeight.max} kg
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">Recomended Ideal: {profileDetails.idealWeight.ideal} kg</p>
                    </div>
                  </div>
                </div>

                {/* Status Tubuh Alert */}
                <div className={`p-5 rounded-xl border ${getBmiBgColor(profileDetails.status)}`}>
                  <div className="flex items-center gap-2 font-bold text-md mb-2">
                    <Heart size={18} />
                    <span>{getBmiCategoryLabel(profileDetails.status)}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{getBmiCategoryDesc(profileDetails.status)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card Metabolisme BMR & TDEE */}
          {profileDetails && (
            <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Estimasi Metabolisme & Kalori Harian</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BMR */}
                <div className="p-5 bg-neutral-950 border border-neutral-850 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">BMR (Basal Metabolic Rate)</h4>
                    <p className="text-2xl font-extrabold text-white mt-1">{profileDetails.bmr.toLocaleString('id-ID')} kcal</p>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                      Kalori minimum yang dibutuhkan tubuh Anda untuk bertahan hidup saat tidur atau istirahat total.
                    </p>
                  </div>
                </div>

                {/* TDEE */}
                <div className="p-5 bg-neutral-950 border border-neutral-850 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">TDEE (Daily Energy Expenditure)</h4>
                    <p className="text-2xl font-extrabold text-white mt-1">{profileDetails.tdee.toLocaleString('id-ID')} kcal</p>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                      Kalori yang Anda bakar per hari berdasarkan tingkat aktivitas Anda. Ini batas kalori pemeliharaan (Maintenance).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyAnalysis;
