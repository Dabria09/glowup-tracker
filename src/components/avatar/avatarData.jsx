// Roblox-inspired Avatar Creator Data for GGU App
// Age-appropriate, blocky, cute 3D-looking 2D illustration style

export const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelain', color: '#f8e8d8' },
  { id: 'ivory', label: 'Ivory', color: '#f5dcc5' },
  { id: 'warm_beige', label: 'Warm Beige', color: '#e8c5a3' },
  { id: 'sand', label: 'Sand', color: '#d4b08c' },
  { id: 'honey', label: 'Honey', color: '#c69666' },
  { id: 'caramel', label: 'Caramel', color: '#b57b4a' },
  { id: 'butterscotch', label: 'Butterscotch', color: '#a0623a' },
  { id: 'sienna', label: 'Sienna', color: '#8d5535' },
  { id: 'chestnut', label: 'Chestnut', color: '#7a4628' },
  { id: 'mocha', label: 'Mocha', color: '#663824' },
  { id: 'espresso', label: 'Espresso', color: '#4a2918' },
  { id: 'ebony', label: 'Ebony', color: '#2d1a0f' },
];

export const HAIR_STYLES = [
  // Natural/Afro
  { id: 'twa', label: 'TWA', category: 'natural', emoji: '🌟' },
  { id: 'afro_full', label: 'Full Afro', category: 'natural', emoji: '🌀' },
  { id: 'afro_puffs_one', label: 'Afro Puff', category: 'natural', emoji: '🎀' },
  { id: 'afro_puffs_two', label: 'Double Puffs', category: 'natural', emoji: '👧' },
  { id: 'bantu_knots', label: 'Bantu Knots', category: 'natural', emoji: '🌸' },
  { id: 'locs_short', label: 'Short Locs', category: 'natural', emoji: '✨' },
  { id: 'locs_long', label: 'Long Locs', category: 'natural', emoji: '💫' },
  { id: 'coils', label: 'Coils', category: 'natural', emoji: '🌀' },
  // Braided
  { id: 'box_braids_short', label: 'Short Box Braids', category: 'braided', emoji: '👩' },
  { id: 'box_braids_medium', label: 'Medium Box Braids', category: 'braided', emoji: '💁' },
  { id: 'box_braids_long', label: 'Long Box Braids', category: 'braided', emoji: '👸' },
  { id: 'cornrows', label: 'Cornrows', category: 'braided', emoji: '🌾' },
  { id: 'fulani_braids', label: 'Fulani Braids', category: 'braided', emoji: '👑' },
  { id: 'knotless_braids', label: 'Knotless Braids', category: 'braided', emoji: '✨' },
  { id: 'goddess_braids', label: 'Goddess Braids', category: 'braided', emoji: '👸' },
  // Straight/Wavy
  { id: 'bone_straight', label: 'Bone Straight', category: 'straight', emoji: '💁‍♀️' },
  { id: 'sleek_ponytail', label: 'Sleek Ponytail', category: 'straight', emoji: '🐎' },
  { id: 'side_part', label: 'Side Part', category: 'straight', emoji: '👩' },
  { id: 'curtain_bangs', label: 'Curtain Bangs', category: 'straight', emoji: '🌊' },
  { id: 'beach_waves', label: 'Beach Waves', category: 'straight', emoji: '🏖️' },
  // Curly
  { id: 'ringlet_curls', label: 'Ringlet Curls', category: 'curly', emoji: '🌀' },
  { id: 'loose_curls', label: 'Loose Curls', category: 'curly', emoji: '💫' },
  { id: 'curly_high_ponytail', label: 'Curly Ponytail', category: 'curly', emoji: '🎀' },
  // Protective
  { id: 'bun_low', label: 'Low Bun', category: 'protective', emoji: '🍩' },
  { id: 'bun_high', label: 'High Bun', category: 'protective', emoji: '🎀' },
  { id: 'space_buns', label: 'Space Buns', category: 'protective', emoji: '👽' },
  { id: 'half_up_half_down', label: 'Half Up Half Down', category: 'protective', emoji: '✨' },
];

export const HAIR_COLORS = [
  { id: 'black', label: 'Black', color: '#0a0a0a' },
  { id: 'dark_brown', label: 'Dark Brown', color: '#2c1a0e' },
  { id: 'medium_brown', label: 'Medium Brown', color: '#5c3a21' },
  { id: 'auburn', label: 'Auburn', color: '#8b4513' },
  { id: 'red', label: 'Red', color: '#c41e3a' },
  { id: 'strawberry_blonde', label: 'Strawberry Blonde', color: '#e8a87c' },
  { id: 'dirty_blonde', label: 'Dirty Blonde', color: '#d4b46a' },
  { id: 'platinum_blonde', label: 'Platinum Blonde', color: '#f5e6d3' },
  { id: 'honey_blonde', label: 'Honey Blonde', color: '#f5d67c' },
  { id: 'ombre_brown_blonde', label: 'Ombre Brown→Blonde', color: 'gradient' },
  { id: 'ombre_black_red', label: 'Ombre Black→Red', color: 'gradient' },
  { id: 'purple', label: 'Purple', color: '#9b59b6' },
  { id: 'pink', label: 'Pink', color: '#ff69b4' },
  { id: 'blue', label: 'Blue', color: '#3498db' },
  { id: 'silver_gray', label: 'Silver/Gray', color: '#c0c0c0' },
];

export const EYE_STYLES = [
  { id: 'almond', label: 'Almond', emoji: '👁️' },
  { id: 'round', label: 'Round', emoji: '👀' },
  { id: 'hooded', label: 'Hooded', emoji: '😌' },
  { id: 'wide', label: 'Wide', emoji: '😊' },
  { id: 'monolid', label: 'Monolid', emoji: '🌸' },
  { id: 'upturned', label: 'Upturned', emoji: '😉' },
  { id: 'cat_eye', label: 'Cat Eye', emoji: '🐱' },
  { id: 'natural', label: 'Natural', emoji: '✨' },
];

export const EYE_COLORS = [
  { id: 'dark_brown', label: 'Dark Brown', color: '#3b2414' },
  { id: 'medium_brown', label: 'Medium Brown', color: '#6b4423' },
  { id: 'hazel', label: 'Hazel', color: '#8c6f3f' },
  { id: 'green', label: 'Green', color: '#2d6e3f' },
  { id: 'blue', label: 'Blue', color: '#4a90c7' },
  { id: 'gray', label: 'Gray', color: '#8b9bb4' },
  { id: 'amber', label: 'Amber', color: '#d4a017' },
  { id: 'black', label: 'Black', color: '#1a1a1a' },
];

export const EYEBROW_STYLES = [
  { id: 'thick_natural', label: 'Thick Natural', emoji: '🌿' },
  { id: 'thin_arched', label: 'Thin Arched', emoji: '🎯' },
  { id: 'straight', label: 'Straight', emoji: '📏' },
  { id: 'bushy', label: 'Bushy', emoji: '🦋' },
  { id: 'feathered', label: 'Feathered', emoji: '🪶' },
  { id: 'bold', label: 'Bold', emoji: '💪' },
];

export const TOP_STYLES = [
  { id: 'hoodie_classic', label: 'Classic Hoodie', category: 'casual', emoji: '🧥' },
  { id: 'hoodie_cropped', label: 'Crop Hoodie', category: 'casual', emoji: '✨', ageGroup: 'teen+' },
  { id: 'graphic_tee_ggu', label: 'GGU Graphic Tee', category: 'casual', emoji: '👕' },
  { id: 'graphic_tee_plain', label: 'Plain Graphic Tee', category: 'casual', emoji: '🎨' },
  { id: 'off_shoulder', label: 'Off Shoulder Top', category: 'casual', emoji: '👚', ageGroup: 'teen+' },
  { id: 'turtleneck', label: 'Turtleneck', category: 'casual', emoji: '🧣' },
  { id: 'denim_jacket', label: 'Denim Jacket', category: 'jacket', emoji: '🧥' },
  { id: 'varsity_jacket', label: 'Varsity Jacket', category: 'jacket', emoji: '🏆' },
  { id: 'sports_bra_jacket', label: 'Sports Bra + Jacket', category: 'athletic', emoji: '🏃‍♀️', ageGroup: 'teen+' },
  { id: 'tank_top', label: 'Tank Top', category: 'casual', emoji: '🎽' },
  { id: 'cardigan', label: 'Cardigan', category: 'casual', emoji: '🧶' },
  { id: 'school_uniform', label: 'School Uniform Top', category: 'formal', emoji: '🎓' },
  { id: 'button_up', label: 'Button Up Shirt', category: 'formal', emoji: '👔' },
  { id: 'tie_dye', label: 'Tie Dye Shirt', category: 'casual', emoji: '🌈' },
  { id: 'puffer_vest', label: 'Puffer Vest', category: 'jacket', emoji: '🦺' },
  { id: 'blazer', label: 'Blazer', category: 'formal', emoji: '💼', ageGroup: 'women' },
];

export const BOTTOM_STYLES = [
  { id: 'jeans_skinny', label: 'Skinny Jeans', category: 'casual', emoji: '👖' },
  { id: 'jeans_straight', label: 'Straight Jeans', category: 'casual', emoji: '👖' },
  { id: 'leggings', label: 'Leggings', category: 'athletic', emoji: '🏃‍♀️' },
  { id: 'joggers', label: 'Joggers', category: 'athletic', emoji: '👟' },
  { id: 'mini_skirt', label: 'Mini Skirt', category: 'casual', emoji: '👗', ageGroup: 'teen+' },
  { id: 'pleated_skirt', label: 'Pleated Skirt', category: 'school', emoji: '🎀' },
  { id: 'biker_shorts', label: 'Biker Shorts', category: 'athletic', emoji: '🚴‍♀️' },
  { id: 'cargo_pants', label: 'Cargo Pants', category: 'casual', emoji: '🎒' },
  { id: 'sweatpants', label: 'Sweatpants', category: 'casual', emoji: '😌' },
  { id: 'school_uniform_skirt', label: 'School Uniform Skirt', category: 'school', emoji: '🎓' },
  { id: 'shorts_denim', label: 'Denim Shorts', category: 'casual', emoji: '🩳' },
  { id: 'shorts_athletic', label: 'Athletic Shorts', category: 'athletic', emoji: '⚽' },
];

export const SHOE_STYLES = [
  { id: 'sneakers_classic', label: 'Classic Sneakers', category: 'casual', emoji: '👟' },
  { id: 'sneakers_high_top', label: 'High Top Sneakers', category: 'casual', emoji: '👟' },
  { id: 'sneakers_platform', label: 'Platform Sneakers', category: 'casual', emoji: '✨', ageGroup: 'teen+' },
  { id: 'boots_ankle', label: 'Ankle Boots', category: 'boots', emoji: '👢' },
  { id: 'boots_knee_high', label: 'Knee High Boots', category: 'boots', emoji: '👢', ageGroup: 'teen+' },
  { id: 'platform_shoes', label: 'Platform Shoes', category: 'heels', emoji: '👠', ageGroup: 'teen+' },
  { id: 'slides', label: 'Slides', category: 'casual', emoji: '🩴' },
  { id: 'loafers', label: 'Loafers', category: 'formal', emoji: '👞' },
  { id: 'uggs', label: 'Uggs', category: 'boots', emoji: '🧦' },
  { id: 'heels', label: 'Heels', category: 'heels', emoji: '👠', ageGroup: 'women' },
];

export const ACCESSORIES = [
  { id: 'none', label: 'None', emoji: '❌', category: 'none' },
  { id: 'hoop_earrings_small', label: 'Small Hoops', category: 'jewelry', emoji: '⭕' },
  { id: 'hoop_earrings_large', label: 'Large Hoops', category: 'jewelry', emoji: '🔴', ageGroup: 'teen+' },
  { id: 'stud_earrings', label: 'Stud Earrings', category: 'jewelry', emoji: '💎' },
  { id: 'headband_simple', label: 'Simple Headband', category: 'hair', emoji: '🎀' },
  { id: 'headband_decorated', label: 'Decorated Headband', category: 'hair', emoji: '🌸' },
  { id: 'hair_bow', label: 'Hair Bow', category: 'hair', emoji: '🎀' },
  { id: 'glasses_clear', label: 'Clear Glasses', category: 'glasses', emoji: '👓' },
  { id: 'glasses_sunglasses', label: 'Sunglasses', category: 'glasses', emoji: '🕶️' },
  { id: 'necklace_simple', label: 'Simple Necklace', category: 'jewelry', emoji: '📿' },
  { id: 'necklace_pendant', label: 'Pendant Necklace', category: 'jewelry', emoji: '💎', ageGroup: 'teen+' },
  { id: 'scrunchie_wrist', label: 'Scrunchie on Wrist', category: 'hair', emoji: '🌈' },
  { id: 'backpack', label: 'Backpack', category: 'bags', emoji: '🎒' },
  { id: 'crown_radiant', label: 'Radiant Crown', category: 'special', emoji: '👑', tier: 'radiant' },
  { id: 'ggu_badge', label: 'GGU Badge', category: 'special', emoji: '⭐' },
  { id: 'halo', label: 'Halo', category: 'special', emoji: '😇' },
  { id: 'headphones', label: 'Headphones', category: 'tech', emoji: '🎧' },
];

export const CLOTHING_COLORS = [
  { id: 'black', label: 'Black', color: '#1a1a1a' },
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'gray', label: 'Gray', color: '#808080' },
  { id: 'navy', label: 'Navy', color: '#1a237e' },
  { id: 'red', label: 'Red', color: '#e53935' },
  { id: 'hot_pink', label: 'Hot Pink', color: '#ff1493' },
  { id: 'baby_pink', label: 'Baby Pink', color: '#ffb6c1' },
  { id: 'purple', label: 'Purple', color: '#9c27b0' },
  { id: 'lavender', label: 'Lavender', color: '#e6e6fa' },
  { id: 'royal_blue', label: 'Royal Blue', color: '#4169e1' },
  { id: 'sky_blue', label: 'Sky Blue', color: '#87ceeb' },
  { id: 'green', label: 'Green', color: '#4caf50' },
  { id: 'mint', label: 'Mint', color: '#98ff98' },
  { id: 'yellow', label: 'Yellow', color: '#ffeb3b' },
  { id: 'orange', label: 'Orange', color: '#ff9800' },
  { id: 'cream', label: 'Cream', color: '#fffdd0' },
  { id: 'brown', label: 'Brown', color: '#795548' },
  { id: 'burgundy', label: 'Burgundy', color: '#800020' },
  { id: 'gold', label: 'Gold', color: '#ffd700' },
  { id: 'silver', label: 'Silver', color: '#c0c0c0' },
  { id: 'tie_dye_pink', label: 'Tie Dye Pink', color: 'gradient_pink' },
  { id: 'tie_dye_rainbow', label: 'Tie Dye Rainbow', color: 'gradient_rainbow' },
];

export const BG_COLORS = [
  { id: 'dark_purple', label: 'Dark Purple', color: '#1a0a2e' },
  { id: 'midnight_blue', label: 'Midnight Blue', color: '#0a1a2e' },
  { id: 'forest_green', label: 'Forest Green', color: '#0a2e0a' },
  { id: 'warm_brown', label: 'Warm Brown', color: '#2e1a0a' },
  { id: 'charcoal', label: 'Charcoal', color: '#0d0d0d' },
  { id: 'deep_pink', label: 'Deep Pink', color: '#1a0a1a' },
  { id: 'soft_gradient', label: 'Soft Gradient', color: 'gradient_soft' },
  { id: 'sunset', label: 'Sunset', color: 'gradient_sunset' },
  { id: 'ocean', label: 'Ocean', color: 'gradient_ocean' },
  { id: 'transparent', label: 'Transparent', color: 'transparent' },
];

// Age group filtering helper
export const filterByAgeGroup = (items, ageGroup) => {
  if (ageGroup === 'glow_girls') {
    return items.filter(item => !item.ageGroup || item.ageGroup === 'women');
  } else if (ageGroup === 'glow_teens') {
    return items.filter(item => !item.ageGroup || item.ageGroup === 'women' || item.ageGroup === 'teen+');
  } else {
    return items; // glow_women gets everything
  }
};