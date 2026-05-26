import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, X } from 'lucide-react';

const CATEGORIES = ['Quick & Easy', 'Budget-Friendly', 'Healthy Swaps', 'Meal Prep', 'Cultural'];
const CUISINES = ['African', 'Asian', 'Caribbean', 'European', 'Latin American', 'Middle Eastern', 'American'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function AddRecipeModal({ isOpen, onClose, user, onRecipeAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Quick & Easy',
    cuisine: 'American',
    prep_time: 10,
    cook_time: 20,
    servings: 4,
    difficulty: 'Easy',
    ingredients: '',
    instructions: '',
    tips: '',
    image_url: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) return;

    try {
      await base44.entities.Recipe.create({
        user_email: user.email,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        cuisine: formData.cuisine,
        prep_time: parseInt(formData.prep_time),
        cook_time: parseInt(formData.cook_time),
        servings: parseInt(formData.servings),
        difficulty: formData.difficulty,
        ingredients: JSON.stringify(formData.ingredients.split('\n').filter(i => i.trim())),
        instructions: JSON.stringify(formData.instructions.split('\n').filter(i => i.trim())),
        tips: JSON.stringify(formData.tips.split('\n').filter(i => i.trim())),
        image_url: formData.image_url,
        is_public: true,
        likes: 0,
      });
      onRecipeAdded();
      onClose();
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl px-8 pt-8 pb-20"
        style={{ background: '#1a0a30' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">Add Your Recipe</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-7">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Recipe Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl px-5 py-4 text-sm text-white outline-none"
              placeholder="Enter recipe title"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Brief description of your recipe"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Cuisine</label>
              <select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Prep (min)</label>
              <input
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Cook (min)</label>
              <input
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Servings</label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {DIFFICULTIES.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Ingredients (one per line)</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar"
              rows={4}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Instructions (one step per line)</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
              rows={4}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Pro Tips (optional, one per line)</label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Use room temperature eggs&#10;Don't overmix the batter"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">Image URL (optional)</label>
            <input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.title}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={18} /> Add Recipe
          </button>
        </div>
      </div>
    </div>
  );
}