import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Droplet, Croissant } from 'lucide-react';

export default function NutritionSummary({ compact = false }) {
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadNutrition = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        // Get today's date range (start and end of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Fetch meal plans for today
        const mealPlans = await base44.entities.MealPlan.filter({ user_email: u.email });
        
        // Filter for today's meals and calculate totals
        const todayMeals = mealPlans.filter(meal => {
          const mealDate = new Date(meal.week_start);
          // Simple date comparison - check if meal is within today's range
          return mealDate >= today && mealDate < tomorrow;
        });
        
        // Calculate totals
        const totals = todayMeals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
          }),
          { calories: 0, protein: 0, carbs: 0 }
        );
        
        setNutrition(totals);
        setLoading(false);
      } catch (error) {
        console.error('Error loading nutrition data:', error);
        setLoading(false);
      }
    };

    loadNutrition();
  }, []);

  if (loading) {
    return (
      <div className="p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">Today's Nutrition</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={13} className="text-orange-400" />
            <span className="text-sm font-bold text-white">{nutrition.calories}</span>
            <span className="text-[10px] text-gray-500">cal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplet size={13} className="text-blue-400" />
            <span className="text-sm font-bold text-white">{nutrition.protein}g</span>
            <span className="text-[10px] text-gray-500">protein</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Croissant size={13} className="text-yellow-400" />
            <span className="text-sm font-bold text-white">{nutrition.carbs}g</span>
            <span className="text-[10px] text-gray-500">carbs</span>
          </div>
          {nutrition.calories === 0 && <p className="text-[10px] text-gray-600">No meals logged today</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🍽️</span>
        <div>
          <h3 className="font-bold text-white text-sm">Today's Nutrition</h3>
          <p className="text-xs text-gray-400">From your meal plan</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-center gap-1 mb-1"><Flame size={14} className="text-orange-400" /></div>
          <p className="text-lg font-bold text-white">{nutrition.calories}</p>
          <p className="text-xs text-gray-400">Calories</p>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-center gap-1 mb-1"><Droplet size={14} className="text-blue-400" /></div>
          <p className="text-lg font-bold text-white">{nutrition.protein}g</p>
          <p className="text-xs text-gray-400">Protein</p>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-center gap-1 mb-1"><Croissant size={14} className="text-yellow-400" /></div>
          <p className="text-lg font-bold text-white">{nutrition.carbs}g</p>
          <p className="text-xs text-gray-400">Carbs</p>
        </div>
      </div>
      {nutrition.calories === 0 && nutrition.protein === 0 && nutrition.carbs === 0 && (
        <p className="text-xs text-gray-500 text-center mt-3">Add meals in Meal Planner to see your daily nutrition</p>
      )}
    </div>
  );
}