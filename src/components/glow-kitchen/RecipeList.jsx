import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Star, Clock, Users, ChefHat } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ background: 'rgba(236,72,153,0.2)' }}>
        <ChefHat size={28} className="text-pink-400" />
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍳' },
  { id: 'Quick & Easy', label: 'Quick', emoji: '⚡' },
  { id: 'Budget-Friendly', label: 'Budget', emoji: '💰' },
  { id: 'Healthy Swaps', label: 'Healthy', emoji: '🥗' },
  { id: 'Meal Prep', label: 'Prep', emoji: '📦' },
  { id: 'Cultural', label: 'Cultural', emoji: '🌍' },
];

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-900/30 text-green-300 border-green-700/50',
  Medium: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
  Hard: 'bg-red-900/30 text-red-300 border-red-700/50',
};

export default function RecipeList({ recipes, user, onAddRecipe }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = async (recipe) => {
    await base44.entities.Recipe.update(recipe.id, {
      likes: (recipe.likes || 0) + 1
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Search recipes..."
          className="w-full pl-4 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              selectedCategory === cat.id
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Add Recipe Button */}
      {user && (
        <button
          onClick={onAddRecipe}
          className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          <Plus size={18} /> Add Your Recipe
        </button>
      )}

      {/* Recipe List */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-4xl mb-3">👨‍🍳</div>
          <p className="text-gray-400 text-sm">No recipes found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredRecipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="text-left rounded-2xl p-4 transition hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-3">
               <ImageWithFallback
                 src={recipe.image_url}
                 alt={recipe.title}
                 className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
               />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm mb-1 truncate">{recipe.title}</h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.prep_time + recipe.cook_time} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {recipe.servings}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS.Easy}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(recipe);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-400 transition"
                  >
                    <Star size={14} />
                    {recipe.likes || 0}
                  </button>
                  <span className="text-xs text-gray-500">{recipe.category}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl p-6"
            style={{ background: '#1a0a30' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedRecipe(null)}>
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <h2 className="font-bold text-white text-lg">Recipe Details</h2>
              <div className="w-5" />
            </div>

            {selectedRecipe.image_url && (
               <ImageWithFallback
                 src={selectedRecipe.image_url}
                 alt={selectedRecipe.title}
                 className="w-full h-48 object-cover rounded-2xl mb-4"
               />
             )}

            <h3 className="text-xl font-bold text-white mb-2">{selectedRecipe.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{selectedRecipe.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {selectedRecipe.prep_time + selectedRecipe.cook_time} min total
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {selectedRecipe.servings} servings
              </span>
              <span className={`px-2 py-1 rounded-full text-xs border ${DIFFICULTY_COLORS[selectedRecipe.difficulty] || DIFFICULTY_COLORS.Easy}`}>
                {selectedRecipe.difficulty}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white mb-2">Ingredients</h4>
                <div className="space-y-1">
                  {JSON.parse(selectedRecipe.ingredients || '[]').map((ingredient, i) => (
                    <p key={i} className="text-sm text-gray-300">• {ingredient}</p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Instructions</h4>
                <ol className="space-y-2">
                  {JSON.parse(selectedRecipe.instructions || '[]').map((step, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-pink-400 font-bold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.tips && JSON.parse(selectedRecipe.tips || '[]').length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-2">Pro Tips</h4>
                  <ul className="space-y-1">
                    {JSON.parse(selectedRecipe.tips || '[]').map((tip, i) => (
                      <li key={i} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-green-400">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}