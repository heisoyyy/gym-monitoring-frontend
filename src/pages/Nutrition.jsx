/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Apple, Flame, Coffee, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import useNutritionStore from '../store/useNutritionStore';
import useUserStore from '../store/useUserStore';

const Nutrition = () => {
  const { profileDetails, fetchProfile } = useUserStore();
  const { nutritionPlan, recommendations, fetchNutritionPlan, fetchRecommendations } = useNutritionStore();
  
  // State untuk memilih mode preview target diet secara lokal
  const [selectedGoalPreview, setSelectedGoalPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchNutritionPlan();
    fetchRecommendations();
  }, []);

  // Update target preview berdasarkan profil user
  useEffect(() => {
    if (profileDetails?.profile?.targetFitness) {
      setSelectedGoalPreview(profileDetails.profile.targetFitness);
    }
  }, [profileDetails]);

  // Data makanan rekomendasi berdasarkan goal preview
  const getGoalRecommendations = () => {
    if (!recommendations) return null;
    
    // Jika user memilih preview tujuan lain harian
    if (selectedGoalPreview && selectedGoalPreview !== profileDetails?.profile?.targetFitness) {
      return getLocalRecommendations(selectedGoalPreview);
    }

    return recommendations;
  };

  // Mock recommendations lokal untuk preview split
  const getLocalRecommendations = (goal) => {
    const mealRecs = {
      BULKING: {
        goalDescription: 'Fokus pada surplus kalori bersih tinggi protein untuk membangun massa otot secara optimal.',
        meals: [
          {
            time: 'Sarapan (07:00 - 08:30)',
            menu: 'Oatmeal (100g) + 1 Pisang + 2 sdm Mentega Kacang + 3 Telur Rebus + 1 gelas Susu Sapi/Susu Protein.',
            estCalories: 750,
            macros: { protein: 45, carbs: 90, fat: 22 }
          },
          {
            time: 'Makan Siang (12:00 - 13:30)',
            menu: 'Nasi Putih/Merah (200g) + Dada Ayam Panggang (150g) + Tempe Bacem (2 potong) + Tumis Sayur Brokoli.',
            estCalories: 850,
            macros: { protein: 50, carbs: 110, fat: 18 }
          },
          {
            time: 'Camilan Sore (16:00 - 17:00)',
            menu: 'Roti Gandum (2 lembar) dengan Alpukat halus dan Telur ceplok (1 butir) + Pisang.',
            estCalories: 450,
            macros: { protein: 18, carbs: 55, fat: 16 }
          },
          {
            time: 'Makan Malam (19:00 - 20:30)',
            menu: 'Nasi Putih (150g) + Ikan Kembung/Salmon Panggang (150g) + Tahu Sutra + Sup Bayam.',
            estCalories: 650,
            macros: { protein: 40, carbs: 70, fat: 20 }
          }
        ]
      },
      CUTTING: {
        goalDescription: 'Fokus pada defisit kalori moderat dengan protein ekstra tinggi untuk membakar lemak sekaligus mempertahankan massa otot.',
        meals: [
          {
            time: 'Sarapan (07:00 - 08:30)',
            menu: 'Telur Orak-Arik (3 Putih Telur, 1 Telur Utuh) + Roti Gandum Panggang (1 lembar) + Kopi Hitam/Teh Hijau.',
            estCalories: 320,
            macros: { protein: 28, carbs: 22, fat: 10 }
          },
          {
            time: 'Makan Siang (12:00 - 13:30)',
            menu: 'Nasi Merah (100g) + Dada Ayam Kukus/Panggang (150g) + Tahu Kukus + Salad Sayuran Hijau.',
            estCalories: 480,
            macros: { protein: 45, carbs: 45, fat: 8 }
          },
          {
            time: 'Camilan Sore (16:00 - 17:00)',
            menu: 'Greek Yogurt Rendah Lemak (150g) + Segenggam Buah Beri (Stroberi) + 10 butir Kacang Almond.',
            estCalories: 230,
            macros: { protein: 17, carbs: 18, fat: 9 }
          },
          {
            time: 'Makan Malam (19:00 - 20:30)',
            menu: 'Ikan Kakap Panggang (150g) + Kentang Rebus (100g) + Tumis Buncis & Asparagus.',
            estCalories: 380,
            macros: { protein: 35, carbs: 32, fat: 7 }
          }
        ]
      },
      MAINTAIN: {
        goalDescription: 'Fokus pada menjaga berat badan stabil dengan komposisi tubuh seimbang dan tingkat energi optimal.',
        meals: [
          {
            time: 'Sarapan (07:00 - 08:30)',
            menu: 'Oatmeal (70g) dengan Pisang setengah + 1 sdm Madu + 2 Telur Rebus Utuh + Teh Hijau.',
            estCalories: 480,
            macros: { protein: 24, carbs: 60, fat: 14 }
          },
          {
            time: 'Makan Siang (12:00 - 13:30)',
            menu: 'Nasi Merah (150g) + Semur Daging Sapi tanpa lemak (120g) + Tempe Panggang + Tumis Sayur Pakcoy.',
            estCalories: 620,
            macros: { protein: 38, carbs: 75, fat: 16 }
          },
          {
            time: 'Camilan Sore (16:00 - 17:00)',
            menu: 'Apel 1 buah + Jus Whey Protein (1 scoop).',
            estCalories: 280,
            macros: { protein: 26, carbs: 25, fat: 8 }
          },
          {
            time: 'Makan Malam (19:00 - 20:30)',
            menu: 'Nasi Merah (100g) + Pepes Ikan Tuna (150g) + Tahu Goreng Udara + Sup Jamur.',
            estCalories: 520,
            macros: { protein: 38, carbs: 55, fat: 12 }
          }
        ]
      }
    };
    return mealRecs[goal] || mealRecs.MAINTAIN;
  };

  const getMealTimeIcon = (timeStr) => {
    const t = timeStr.toLowerCase();
    if (t.includes('sarapan')) return <Coffee className="text-yellow-400" size={18} />;
    if (t.includes('siang')) return <Sun className="text-orange-400" size={18} />;
    if (t.includes('sore') || t.includes('camilan')) return <Sunset className="text-purple-400" size={18} />;
    return <Moon className="text-blue-400" size={18} />;
  };

  const activeRecs = getGoalRecommendations();

  // Hitung persentase kontribusi energi makro
  const pProt = nutritionPlan ? Math.round((nutritionPlan.protein * 4 / nutritionPlan.dailyCalories) * 100) : 30;
  const pCarb = nutritionPlan ? Math.round((nutritionPlan.carbs * 4 / nutritionPlan.dailyCalories) * 100) : 50;
  const pFat = nutritionPlan ? Math.round((nutritionPlan.fat * 9 / nutritionPlan.dailyCalories) * 100) : 20;

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Kalkulator Nutrisi & Diet</h1>
          <p className="text-neutral-400 mt-1">Dapatkan target kalori harian beserta anjuran program gizi seimbang Anda.</p>
        </div>

        {/* Pemilih Goal Preview */}
        {profileDetails && (
          <div className="bg-neutral-900 border border-neutral-800 p-1 rounded-xl flex gap-1 text-xs">
            {['BULKING', 'CUTTING', 'MAINTAIN'].map((goal) => (
              <button
                key={goal}
                onClick={() => setSelectedGoalPreview(goal)}
                className={`px-4 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                  selectedGoalPreview === goal
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Jika Data Belum Lengkap */}
      {!profileDetails ? (
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-8 flex flex-col items-center justify-center text-center py-16 gap-3 shadow-xl">
          <Apple size={48} className="text-neutral-700 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Profil Fisik Belum Diisi</h3>
          <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
            Target kalori harian dan pembagian makro hanya dapat dihitung setelah Anda melengkapi data fisik Anda di menu **Analisis Tubuh**.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Panel Rencana Kalori & Makronutrisi */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card Target Kalori */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Target Kalori Harian</span>
              
              <div className="relative inline-flex items-center justify-center p-8 bg-neutral-950 rounded-full border border-neutral-800/80 shadow-inner w-44 h-44 mx-auto">
                <div className="text-center">
                  <Flame size={32} className="text-orange-500 mx-auto animate-pulse" />
                  <h2 className="text-2xl font-extrabold text-white mt-1.5">
                    {nutritionPlan ? nutritionPlan.dailyCalories.toLocaleString('id-ID') : '--'}
                  </h2>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">kcal / Hari</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl">
                <p className="text-xs text-neutral-400 leading-normal">
                  Rencana diet Anda diatur untuk target **{profileDetails.profile.targetFitness}** dengan kebutuhan kalori dasar metabolisme.
                </p>
              </div>
            </div>

            {/* Card Makronutrisi Detail */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-md font-bold text-white">Pembagian Makronutrisi</h3>
              
              {nutritionPlan && (
                <div className="space-y-4">
                  {/* Protein */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-300">Protein ({pProt}%)</span>
                      <span className="text-emerald-400">{nutritionPlan.protein} gram</span>
                    </div>
                    <div className="h-2.5 w-full bg-neutral-950 border border-neutral-850 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pProt}%` }}></div>
                    </div>
                    <p className="text-[10px] text-neutral-500">Penting untuk regenerasi dan pertumbuhan sel otot harian.</p>
                  </div>

                  {/* Karbohidrat */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-300">Karbohidrat ({pCarb}%)</span>
                      <span className="text-blue-400">{nutritionPlan.carbs} gram</span>
                    </div>
                    <div className="h-2.5 w-full bg-neutral-950 border border-neutral-850 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pCarb}%` }}></div>
                    </div>
                    <p className="text-[10px] text-neutral-500">Sumber energi utama untuk beraktivitas berat dan latihan beban.</p>
                  </div>

                  {/* Lemak */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-300">Lemak ({pFat}%)</span>
                      <span className="text-orange-400">{nutritionPlan.fat} gram</span>
                    </div>
                    <div className="h-2.5 w-full bg-neutral-950 border border-neutral-850 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pFat}%` }}></div>
                    </div>
                    <p className="text-[10px] text-neutral-500">Penting untuk mendukung regulasi hormon dan metabolisme lemak tubuh.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Panel Rekomendasi Menu Makanan Harian */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Rencana Pola Makan</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Rekomendasi Menu Makanan Harian</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="animate-spin-slow" />
                </div>
              </div>

              {activeRecs ? (
                <div className="space-y-5">
                  <p className="text-xs text-neutral-400 italic bg-neutral-950 border border-neutral-850 p-3 rounded-xl leading-relaxed">
                    ✨ **Saran Ahli Gizi**: {activeRecs.goalDescription}
                  </p>

                  <div className="space-y-4">
                    {activeRecs.meals.map((meal, index) => (
                      <div key={index} className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-neutral-700/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl shrink-0 mt-0.5">
                            {getMealTimeIcon(meal.time)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-300 block">{meal.time}</span>
                            <p className="text-xs text-white mt-1.5 leading-relaxed font-medium">{meal.menu}</p>
                          </div>
                        </div>

                        {/* Estimasi Kalori & Makro Meal */}
                        <div className="md:text-right shrink-0 bg-neutral-900/60 border border-neutral-850/80 p-3 rounded-lg md:min-w-[120px]">
                          <span className="text-xs font-bold text-emerald-400">{meal.estCalories} kcal</span>
                          <div className="flex md:flex-col gap-2 md:gap-0 text-[10px] text-neutral-500 mt-1">
                            <span>P: {meal.macros.protein}g</span>
                            <span className="hidden md:inline"> | </span>
                            <span>K: {meal.macros.carbs}g</span>
                            <span className="hidden md:inline"> | </span>
                            <span>L: {meal.macros.fat}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 text-center py-6">Memuat rekomendasi makanan diet...</p>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Nutrition;
