import { useState, useEffect } from 'react';
import { Shuffle, Save, Download, Share2, Check, Sparkles, Copy, Clock, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { awardPoints } from '@/lib/pointsHelper';

// ── Data ──────────────────────────────────────────────────────────────────────

const SKIN_COLORS = [
  // Natural tones
  { label: 'Porcelain', value: 'f8d5c2' },
  { label: 'Light', value: 'ffdbb4' },
  { label: 'Pale', value: 'edb98a' },
  { label: 'Warm Beige', value: 'f1c27d' },
  { label: 'Mellow', value: 'd08b5b' },
  { label: 'Tan', value: 'c68642' },
  { label: 'Wheat', value: 'ae5d29' },
  { label: 'Caramel', value: '8d5524' },
  { label: 'Brown', value: '614335' },
  { label: 'Dark Brown', value: '4a312c' },
  { label: 'Deep', value: '3b2219' },
  { label: 'Ebony', value: '2d1b12' },
  // Fantasy
  { label: '🌸 Pastel Pink', value: 'fdb5b5' },
  { label: '💜 Lavender', value: 'e0b0ff' },
  { label: '🌊 Ocean Blue', value: '93c5fd' },
  { label: '🌿 Cyber Mint', value: 'bbf7d0' },
  { label: '🧡 Peach Glow', value: 'ffcba4' },
  { label: '💛 Golden Sun', value: 'fde68a' },
  { label: '🩵 Ice Blue', value: 'bfdbfe' },
  { label: '🟣 Amethyst', value: 'd8b4fe' },
];

const HAT_STYLES = ['hat', 'hijab', 'turban', 'winterHat1', 'winterHat02', 'winterHat03', 'winterHat04', 'froBand'];

const HAIR_STYLES = [
  // Long / feminine
  { label: 'Big Hair', value: 'bigHair' },
  { label: 'Bob', value: 'bob' },
  { label: 'Bun', value: 'bun' },
  { label: 'Curly', value: 'curly' },
  { label: 'Curvy', value: 'curvy' },
  { label: 'Frida', value: 'frida' },
  { label: 'Long Curvy', value: 'longButNotTooLong' },
  { label: 'Mia Wallace', value: 'miaWallace' },
  { label: 'Straight 1', value: 'straight01' },
  { label: 'Straight 2', value: 'straight02' },
  { label: 'Straight & Strand', value: 'straightAndStrand' },
  // Natural / textured
  { label: 'Locs', value: 'dreads' },
  { label: 'Locs Alt 1', value: 'dreads01' },
  { label: 'Locs Alt 2', value: 'dreads02' },
  { label: 'Frizzle', value: 'frizzle' },
  { label: 'Fro', value: 'fro' },
  // Short / masc
  { label: 'Shaggy', value: 'shaggy' },
  { label: 'Shaggy Mullet', value: 'shaggyMullet' },
  { label: 'Shaved Sides', value: 'shavedSides' },
  { label: 'Short Curly', value: 'shortCurly' },
  { label: 'Short Flat', value: 'shortFlat' },
  { label: 'Short Round', value: 'shortRound' },
  { label: 'Short Waved', value: 'shortWaved' },
  { label: 'Sides', value: 'sides' },
  { label: 'The Caesar', value: 'theCaesar' },
  { label: 'Caesar Side Part', value: 'theCaesarAndSidePart' },
  // Headwear (keeps hair visible inside)
  { label: 'Fro Band', value: 'froBand' },
  { label: 'Hijab', value: 'hijab' },
  { label: 'Turban', value: 'turban' },
  { label: 'Top Hat', value: 'hat' },
  { label: 'Winter Hat 1', value: 'winterHat1' },
  { label: 'Winter Hat 2', value: 'winterHat02' },
  { label: 'Winter Hat 3', value: 'winterHat03' },
  { label: 'Winter Hat 4', value: 'winterHat04' },
];

const HAIR_COLORS = [
  { label: 'Auburn', value: 'a55728' },
  { label: 'Black', value: '2c1b18' },
  { label: 'Blonde', value: 'b58143' },
  { label: 'Golden', value: 'd6b370' },
  { label: 'Honey', value: 'c9a84c' },
  { label: 'Light Brown', value: '9a6134' },
  { label: 'Brown', value: '724133' },
  { label: 'Dark Brown', value: '4a312c' },
  { label: 'Chestnut', value: '7b3f00' },
  { label: 'Red', value: 'c93305' },
  { label: 'Dark Red', value: '8b0000' },
  { label: 'Platinum', value: 'ecdcbf' },
  { label: 'Silver', value: 'e8e1e1' },
  { label: 'White', value: 'f5f5f5' },
  // Fantasy
  { label: '🌸 Pastel Pink', value: 'f59797' },
  { label: '🌹 Hot Pink', value: 'ff69b4' },
  { label: '💜 Purple', value: 'a855f7' },
  { label: '💙 Blue', value: '6bd9e9' },
  { label: '🩵 Sky Blue', value: '87ceeb' },
  { label: '💚 Green', value: '50c878' },
  { label: '🧡 Orange', value: 'ff8c00' },
  { label: '🌈 Teal', value: '40e0d0' },
];

const HAT_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Charcoal', value: '3d4451' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Navy', value: '5199e4' },
  { label: 'Royal Blue', value: '4169e1' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Hot Pink', value: 'ff1493' },
  { label: 'Purple', value: 'a855f7' },
  { label: 'Lavender', value: 'ede9fe' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'Burgundy', value: '800020' },
  { label: 'Orange', value: 'ff8c42' },
  { label: 'White', value: 'ffffff' },
  { label: 'Gray', value: 'e6e6e6' },
  { label: 'Gold', value: 'fef08a' },
  { label: 'Mint', value: 'a7ffc4' },
  { label: 'Teal', value: '40e0d0' },
  { label: 'Pastel Yellow', value: 'ffffb1' },
];

const EYES = [
  { label: 'Default', value: 'default' },
  { label: 'Happy 😊', value: 'happy' },
  { label: 'Closed 😌', value: 'closed' },
  { label: 'Cry 😢', value: 'cry' },
  { label: 'Dizzy 😵', value: 'xDizzy' },
  { label: 'Eye Roll 🙄', value: 'eyeRoll' },
  { label: 'Hearts 😍', value: 'hearts' },
  { label: 'Side 👀', value: 'side' },
  { label: 'Squint 😏', value: 'squint' },
  { label: 'Surprised 😮', value: 'surprised' },
  { label: 'Wink 😉', value: 'wink' },
  { label: 'Wink Wacky 🤪', value: 'winkWacky' },
];

const EYEBROWS = [
  { label: 'Default', value: 'default' },
  { label: 'Natural', value: 'defaultNatural' },
  { label: 'Angry 😠', value: 'angry' },
  { label: 'Angry Natural', value: 'angryNatural' },
  { label: 'Flat Natural', value: 'flatNatural' },
  { label: 'Raised Excited', value: 'raisedExcited' },
  { label: 'Raised Natural', value: 'raisedExcitedNatural' },
  { label: 'Sad Concerned', value: 'sadConcerned' },
  { label: 'Sad Natural', value: 'sadConcernedNatural' },
  { label: 'Unibrow', value: 'unibrowNatural' },
  { label: 'Up Down', value: 'upDown' },
  { label: 'Up Down Natural', value: 'upDownNatural' },
];

const MOUTH = [
  { label: 'Smile 😊', value: 'smile' },
  { label: 'Default', value: 'default' },
  { label: 'Concerned 😟', value: 'concerned' },
  { label: 'Disbelief 😑', value: 'disbelief' },
  { label: 'Eating 😋', value: 'eating' },
  { label: 'Grimace 😬', value: 'grimace' },
  { label: 'Sad 😢', value: 'sad' },
  { label: 'Scream 😱', value: 'screamOpen' },
  { label: 'Serious 😐', value: 'serious' },
  { label: 'Tongue 😛', value: 'tongue' },
  { label: 'Twinkle 🤩', value: 'twinkle' },
  { label: 'Vomit 🤢', value: 'vomit' },
];

const CLOTHES = [
  { label: '👔 Blazer + Shirt', value: 'blazerAndShirt' },
  { label: '🧥 Blazer + Sweater', value: 'blazerAndSweater' },
  { label: '🎓 Collar Sweater', value: 'collarAndSweater' },
  { label: '🎨 Graphic Shirt', value: 'graphicShirt' },
  { label: '🦘 Hoodie', value: 'hoodie' },
  { label: '👕 Overall', value: 'overall' },
  { label: '👕 Crew Neck', value: 'shirtCrewNeck' },
  { label: '👗 Scoop Neck', value: 'shirtScoopNeck' },
  { label: '🔻 V Neck', value: 'shirtVNeck' },
];

const CLOTHES_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Charcoal', value: '4a5568' },
  { label: 'Navy', value: '1a365d' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Sky Blue', value: '5199e4' },
  { label: 'Royal Blue', value: '25557c' },
  { label: 'Teal', value: '319795' },
  { label: 'Green', value: '276749' },
  { label: 'Olive', value: '6b7280' },
  { label: 'Gray', value: 'e6e6e6' },
  { label: 'Heather', value: '929598' },
  { label: 'White', value: 'ffffff' },
  { label: 'Cream', value: 'fffff0' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Hot Pink', value: 'ff1493' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'Burgundy', value: '800020' },
  { label: 'Orange', value: 'ff8c42' },
  { label: 'Yellow', value: 'fbbf24' },
  { label: 'Purple', value: 'a855f7' },
  { label: 'Pastel Blue', value: 'b1e2ff' },
  { label: 'Pastel Green', value: 'a7ffc4' },
  { label: 'Pastel Orange', value: 'ffdeb5' },
  { label: 'Pastel Red', value: 'ffafb9' },
  { label: 'Pastel Yellow', value: 'ffffb1' },
  { label: 'Pastel Purple', value: 'e9d5ff' },
];

const GRAPHIC_DESIGNS = [
  { label: '🦇 Bat', value: 'bat' },
  { label: '💃 Cumbia', value: 'cumbia' },
  { label: '🦌 Deer', value: 'deer' },
  { label: '💎 Diamond', value: 'diamond' },
  { label: '👋 Hola', value: 'hola' },
  { label: '🍕 Pizza', value: 'pizza' },
  { label: '✊ Resist', value: 'resist' },
  { label: '⭐ Selena', value: 'selena' },
  { label: '🐻 Bear', value: 'bear' },
  { label: '💀 Skull', value: 'skull' },
  { label: '💀 Skull Outline', value: 'skullOutline' },
];

const ACCESSORIES = [
  { label: 'None', value: '' },
  { label: '🕶 Wayfarers', value: 'wayfarers' },
  { label: '👓 Round', value: 'round' },
  { label: '💊 Prescription 01', value: 'prescription01' },
  { label: '💊 Prescription 02', value: 'prescription02' },
  { label: '😎 Sunglasses', value: 'sunglasses' },
  { label: '🤓 Kurt', value: 'kurt' },
  { label: '🏴‍☠️ Eyepatch', value: 'eyepatch' },
];

const FACIAL_HAIR = [
  { label: 'None', value: '' },
  { label: '🪒 Light Beard', value: 'beardLight' },
  { label: '🧔 Medium Beard', value: 'beardMedium' },
  { label: '🧔 Majestic Beard', value: 'beardMajestic' },
  { label: '🎩 Fancy Moustache', value: 'moustacheFancy' },
  { label: '🎭 Magnum Moustache', value: 'moustacheMagnum' },
];

const FACIAL_HAIR_COLORS = [
  { label: 'Auburn', value: 'a55728' },
  { label: 'Black', value: '2c1b18' },
  { label: 'Blonde', value: 'b58143' },
  { label: 'Brown', value: '724133' },
  { label: 'Dark Brown', value: '4a312c' },
  { label: 'Platinum', value: 'ecdcbf' },
  { label: 'Red', value: 'c93305' },
  { label: 'Silver', value: 'e8e1e1' },
];

const ACCESSORIES_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Charcoal', value: '4a5568' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Navy', value: '5199e4' },
  { label: 'Gold ✨', value: 'fef08a' },
  { label: 'Rose Gold 🌹', value: 'f4a0a0' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Purple', value: 'a855f7' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'Silver 🪙', value: 'e8e1e1' },
  { label: 'Bronze 🥉', value: 'cd7f32' },
  { label: 'Pastel Blue', value: 'b1e2ff' },
  { label: 'Pastel Pink', value: 'ffafb9' },
  { label: 'Pastel Green', value: 'a7ffc4' },
  { label: 'White', value: 'ffffff' },
  { label: 'Tortoise 🐢', value: '8b5e3c' },
  { label: 'Crystal 💎', value: 'a8d8ea' },
];

// Hat styles (subset of hair styles that are hat-type)
const HAT_ONLY_STYLES = [
  { label: 'None (use Hair)', value: '' },
  { label: '🎩 Top Hat', value: 'hat' },
  { label: '🧕 Hijab', value: 'hijab' },
  { label: '🎯 Turban', value: 'turban' },
  { label: '🧣 Winter Hat 1', value: 'winterHat1' },
  { label: '🧣 Winter Hat 2', value: 'winterHat02' },
  { label: '🧣 Winter Hat 3', value: 'winterHat03' },
  { label: '🎿 Winter Hat 4', value: 'winterHat04' },
  { label: '🎀 Fro Band', value: 'froBand' },
];

const BACKGROUNDS = [
  { label: 'Sky Blue', value: 'b6e3f4' },
  { label: 'GGU Pink', value: 'FCE4EC' },
  { label: 'GGU Purple', value: 'F3E5F5' },
  { label: 'Blue', value: 'DBEAFE' },
  { label: 'Mint', value: 'D1FAE5' },
  { label: 'Lavender', value: 'EDE9FE' },
  { label: 'Cream', value: 'FEF3C7' },
  { label: 'Peach', value: 'FED7AA' },
  { label: 'Rose', value: 'FFE4E6' },
  { label: 'Lilac', value: 'F5D0FE' },
  { label: 'Teal', value: 'CCFBF1' },
  { label: 'Sage', value: 'DCFCE7' },
  { label: 'Sand', value: 'FEF9C3' },
  { label: 'Dark', value: '1F2937' },
  { label: 'Midnight', value: '0f0a1e' },
  { label: 'Slate', value: '334155' },
  { label: 'Gold', value: 'FEF08A' },
  { label: 'Coral', value: 'FECACA' },
  { label: 'Cyan', value: 'CFFAFE' },
  { label: 'Amber', value: 'FDE68A' },
];

// ── Avatar Frames ─────────────────────────────────────────────────────────────
const FRAMES = [
  { id: 'none', label: 'None', style: {} },
  { id: 'pink_glow', label: '💗 Pink Glow', style: { boxShadow: '0 0 0 4px #ec4899, 0 0 20px rgba(236,72,153,0.6)' } },
  { id: 'gold', label: '✨ Gold', style: { boxShadow: '0 0 0 4px #f59e0b, 0 0 20px rgba(245,158,11,0.5)' } },
  { id: 'rainbow', label: '🌈 Rainbow', style: { outline: '4px solid transparent', background: 'linear-gradient(white,white) padding-box, linear-gradient(135deg,#ec4899,#a855f7,#6366f1,#06b6d4,#10b981) border-box', border: '4px solid transparent' } },
  { id: 'purple', label: '💜 Purple', style: { boxShadow: '0 0 0 4px #a855f7, 0 0 20px rgba(168,85,247,0.5)' } },
  { id: 'silver', label: '🌟 Silver', style: { boxShadow: '0 0 0 4px #e8e1e1, 0 0 16px rgba(232,225,225,0.4)' } },
  { id: 'fire', label: '🔥 Fire', style: { boxShadow: '0 0 0 4px #f97316, 0 0 20px rgba(249,115,22,0.5)' } },
  { id: 'ice', label: '❄️ Ice', style: { boxShadow: '0 0 0 4px #bae6fd, 0 0 16px rgba(186,230,253,0.5)' } },
];

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: 'future_ceo', label: 'Future CEO 💼',
    config: { skin: 'edb98a', hairStyle: 'straight01', hairColor: '2c1b18', eyes: 'default', eyebrows: 'raisedExcited', mouth: 'smile', clothes: 'blazerAndShirt', clothesColor: '262e33', accessories: 'prescription01', accessoriesColor: 'fef08a', hatColor: '262e33', graphicDesign: 'diamond', background: 'FEF3C7', frame: 'gold' },
  },
  {
    id: 'soft_girl', label: 'Soft Girl 🌸',
    config: { skin: 'ffdbb4', hairStyle: 'longButNotTooLong', hairColor: 'f59797', eyes: 'hearts', eyebrows: 'raisedExcitedNatural', mouth: 'twinkle', clothes: 'hoodie', clothesColor: 'ffafb9', accessories: '', accessoriesColor: 'ff488e', hatColor: 'ff488e', graphicDesign: 'diamond', background: 'FCE4EC', frame: 'pink_glow' },
  },
  {
    id: 'sporty_chic', label: 'Sporty Chic ⚡',
    config: { skin: 'd08b5b', hairStyle: 'curly', hairColor: '4a312c', eyes: 'squint', eyebrows: 'raisedExcited', mouth: 'smile', clothes: 'hoodie', clothesColor: '5199e4', accessories: 'sunglasses', accessoriesColor: '262e33', hatColor: '5199e4', graphicDesign: 'bat', background: 'DBEAFE', frame: 'purple' },
  },
  {
    id: 'study_gram', label: 'Study Gram 📚',
    config: { skin: 'ae5d29', hairStyle: 'bob', hairColor: '724133', eyes: 'default', eyebrows: 'defaultNatural', mouth: 'serious', clothes: 'collarAndSweater', clothesColor: 'b1e2ff', accessories: 'round', accessoriesColor: '262e33', hatColor: 'b1e2ff', graphicDesign: 'diamond', background: 'EDE9FE', frame: 'ice' },
  },
  {
    id: 'ethereal_goddess', label: 'Ethereal Goddess ✨',
    config: { skin: 'ffdbb4', hairStyle: 'bigHair', hairColor: 'd6b370', eyes: 'hearts', eyebrows: 'raisedExcitedNatural', mouth: 'twinkle', clothes: 'shirtScoopNeck', clothesColor: 'ede9fe', accessories: 'kurt', accessoriesColor: 'fef08a', hatColor: 'fef08a', graphicDesign: 'diamond', background: 'F3E5F5', frame: 'rainbow' },
  },
  {
    id: 'street_style', label: 'Street Style 🔥',
    config: { skin: '614335', hairStyle: 'fro', hairColor: '2c1b18', eyes: 'wink', eyebrows: 'angry', mouth: 'smile', clothes: 'graphicShirt', clothesColor: 'ff5c5c', accessories: 'wayfarers', accessoriesColor: '262e33', hatColor: '262e33', graphicDesign: 'skull', background: '1F2937', frame: 'fire' },
  },
];

const TABS = [
  { id: 'presets', label: '✨ Presets' },
  { id: 'history', label: '🕐 History' },
  { id: 'skin', label: '🎨 Skin' },
  { id: 'hairStyle', label: '💇 Hair' },
  { id: 'hairColor', label: 'Hair Color' },
  { id: 'hatStyle', label: '🎩 Hats' },
  { id: 'hatColor', label: 'Hat Color' },
  { id: 'eyes', label: '👁 Eyes' },
  { id: 'eyebrows', label: 'Brows' },
  { id: 'mouth', label: '👄 Mouth' },
  { id: 'clothes', label: '👗 Outfit' },
  { id: 'clothesColor', label: 'Outfit Color' },
  { id: 'graphicDesign', label: 'Graphic' },
  { id: 'accessories', label: '🕶 Glasses' },
  { id: 'accessoriesColor', label: 'Frame Color' },
  { id: 'facialHair', label: '🧔 Facial Hair' },
  { id: 'facialHairColor', label: 'Beard Color' },
  { id: 'background', label: '🖼 BG' },
  { id: 'frame', label: '✨ Frame' },
];

const OPTIONS_MAP = {
  skin: SKIN_COLORS,
  hairStyle: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  hatStyle: HAT_ONLY_STYLES,
  hatColor: HAT_COLORS,
  eyes: EYES,
  eyebrows: EYEBROWS,
  mouth: MOUTH,
  clothes: CLOTHES,
  clothesColor: CLOTHES_COLORS,
  graphicDesign: GRAPHIC_DESIGNS,
  accessories: ACCESSORIES,
  accessoriesColor: ACCESSORIES_COLORS,
  facialHair: FACIAL_HAIR,
  facialHairColor: FACIAL_HAIR_COLORS,
  background: BACKGROUNDS,
};

const DEFAULT_CONFIG = {
  skin: 'd08b5b', hairStyle: 'fro', hairColor: '2c1b18',
  hatStyle: '', hatColor: 'ff488e',
  eyes: 'happy', eyebrows: 'default', mouth: 'smile',
  clothes: 'hoodie', clothesColor: 'ff488e', graphicDesign: 'diamond',
  accessories: '', accessoriesColor: '262e33',
  facialHair: '', facialHairColor: '2c1b18',
  background: 'FCE4EC', frame: 'pink_glow',
};

const COLOR_TABS = ['hairColor', 'hatColor', 'clothesColor', 'accessoriesColor', 'facialHairColor', 'background', 'skin'];
const MAX_HISTORY = 5;
const HISTORY_KEY = 'ggu_avatar_history';

function buildUrl(config, format = 'svg', size = null) {
  // hatStyle overrides hairStyle for the top slot when set
  const topVariant = config.hatStyle || config.hairStyle;
  const isHat = HAT_STYLES.includes(topVariant);
  const params = new URLSearchParams({
    skinColor: config.skin,
    topVariant,
    hairColor: config.hairColor,
    eyesVariant: config.eyes,
    eyebrowsVariant: config.eyebrows,
    mouthVariant: config.mouth,
    clothesVariant: config.clothes,
    clothesColor: config.clothesColor,
    backgroundColor: config.background,
  });
  if (isHat && config.hatColor) params.set('hatColor', config.hatColor);
  if (config.clothes === 'graphicShirt' && config.graphicDesign) params.set('clothingGraphic', config.graphicDesign);
  if (config.accessories) {
    params.set('accessoriesVariant', config.accessories);
    params.set('accessoriesProbability', '100');
    if (config.accessoriesColor) params.set('accessoriesColor', config.accessoriesColor);
  } else {
    params.set('accessoriesProbability', '0');
  }
  if (config.facialHair) {
    params.set('facialHairVariant', config.facialHair);
    params.set('facialHairProbability', '100');
    if (config.facialHairColor) params.set('facialHairColor', config.facialHairColor);
  } else {
    params.set('facialHairProbability', '0');
  }
  if (size) params.set('size', String(size));
  return `https://api.dicebear.com/10.x/avataaars/${format}?${params.toString()}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)].value;
}

function isFullyCustomized(config) {
  // Award points if user has touched at least 6 different fields from defaults
  const defaults = DEFAULT_CONFIG;
  const changed = Object.keys(defaults).filter(k => config[k] !== defaults[k]);
  return changed.length >= 6;
}

export default function DiceBearBuilder({ profile, user, onSaved }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('presets');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Load saved config + history
  useEffect(() => {
    if (profile?.avatar_builder_config) {
      try {
        const saved = JSON.parse(profile.avatar_builder_config);
        setConfig(prev => ({ ...DEFAULT_CONFIG, ...saved }));
      } catch {}
    }
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setHistory(h);
    } catch {}
  }, [profile]);

  const avatarUrl = buildUrl(config, 'svg');
  const currentFrame = FRAMES.find(f => f.id === (config.frame || 'none')) || FRAMES[0];

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2800); };

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const applyPreset = (preset) => {
    setConfig({ ...DEFAULT_CONFIG, ...preset.config });
    setActiveTab('skin');
  };

  const randomize = () => {
    setConfig({
      skin: randomFrom(SKIN_COLORS), hairStyle: randomFrom(HAIR_STYLES),
      hairColor: randomFrom(HAIR_COLORS),
      hatStyle: Math.random() > 0.7 ? randomFrom(HAT_ONLY_STYLES.filter(h => h.value)) : '',
      hatColor: randomFrom(HAT_COLORS),
      eyes: randomFrom(EYES), eyebrows: randomFrom(EYEBROWS), mouth: randomFrom(MOUTH),
      clothes: randomFrom(CLOTHES), clothesColor: randomFrom(CLOTHES_COLORS),
      graphicDesign: randomFrom(GRAPHIC_DESIGNS), accessories: randomFrom(ACCESSORIES),
      accessoriesColor: randomFrom(ACCESSORIES_COLORS),
      facialHair: Math.random() > 0.6 ? randomFrom(FACIAL_HAIR.filter(f => f.value)) : '',
      facialHairColor: randomFrom(FACIAL_HAIR_COLORS),
      background: randomFrom(BACKGROUNDS),
      frame: FRAMES[Math.floor(Math.random() * FRAMES.length)].id,
    });
  };

  // Push current look to local history (max 5)
  const pushToHistory = (cfg) => {
    const entry = { config: cfg, timestamp: Date.now(), url: buildUrl(cfg, 'png', 80) };
    const updated = [entry, ...history.filter((_, i) => i < MAX_HISTORY - 1)];
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const save = async () => {
    setSaving(true);
    pushToHistory(config);
    const pngUrl = buildUrl(config, 'png', 256);
    const data = { avatar_url: pngUrl, avatar_builder_config: JSON.stringify(config), identity_type: 'selfie' };

    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else if (user) {
      await base44.entities.UserProfile.create({ user_email: user.email, ...data });
    }

    // Award 25 points if fully customized (monthly cap enforced by awardPoints)
    if (isFullyCustomized(config) && user?.email) {
      try {
        const newTotal = await awardPoints(user.email, 'avatar_customized');
        if (newTotal > 0) {
          showMsg('✅ Saved! +25 Glow Points for fully customizing your avatar! 🎉');
        } else {
          showMsg('✅ Avatar saved as your profile picture!');
        }
      } catch {
        showMsg('✅ Avatar saved as your profile picture!');
      }
    } else {
      showMsg('✅ Avatar saved as your profile picture!');
    }

    setSaving(false);
    if (onSaved) await onSaved(pngUrl);
  };

  const downloadAvatar = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = buildUrl(config, 'png', 400);
    a.download = 'my-ggu-avatar.png';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  const shareToFeed = async () => {
    setSharing(true);
    try {
      await base44.entities.ShoutOut.create({
        user_email: user?.email || '',
        username: profile?.username || user?.full_name || 'GGU Member',
        content: '✨ Just customized my avatar on Girls Glowing Up! Check out my new look 🎨💅',
        media_url: buildUrl(config, 'png', 256),
        media_type: 'image',
        age_group: profile?.age_group || 'glow_teens',
      });
      showMsg('🌟 Shared to Shout-Outs feed!');
    } catch {
      showMsg('❌ Could not share. Try again!');
    }
    setSharing(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(buildUrl(config, 'png', 256));
    setCopied(true);
    showMsg('🔗 Avatar link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteHistory = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  // Visible tabs based on context
  const activeTop = config.hatStyle || config.hairStyle;
  const isHatActive = HAT_STYLES.includes(activeTop);
  const isGraphicShirt = config.clothes === 'graphicShirt';
  const hasAccessory = !!config.accessories;
  const hasFacialHair = !!config.facialHair;
  const hasHatStyle = !!config.hatStyle;

  const visibleTabs = TABS.filter(tab => {
    if (tab.id === 'hatColor') return isHatActive;
    if (tab.id === 'graphicDesign') return isGraphicShirt;
    if (tab.id === 'accessoriesColor') return hasAccessory;
    if (tab.id === 'facialHairColor') return hasFacialHair;
    return true;
  });

  const currentOptions = OPTIONS_MAP[activeTab] || [];
  const currentValue = config[activeTab];

  return (
    <div className="flex flex-col items-center">
      {/* Preview with frame */}
      <div className="relative mb-4">
        <div
          className="w-48 h-48 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{ background: `#${config.background}`, ...currentFrame.style }}
        >
          <img
            src={avatarUrl}
            alt="avatar preview"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        {/* Frame label */}
        {config.frame && config.frame !== 'none' && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/60 whitespace-nowrap">
            {currentFrame.label}
          </div>
        )}
      </div>

      {/* Buttons Row 1 */}
      <div className="flex gap-2 mb-2 flex-wrap justify-center">
        <button onClick={randomize}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-white"
          style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
          <Shuffle size={12} /> Randomize 🎲
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {saving ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={12} /> Save ✨</>}
        </button>
        <button onClick={copyLink}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-white"
          style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
        </button>
      </div>

      {/* Buttons Row 2 */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button onClick={downloadAvatar} disabled={downloading}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
          {downloading ? '⏳ Downloading...' : <><Download size={12} /> Download</>}
        </button>
        <button onClick={shareToFeed} disabled={sharing}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)' }}>
          {sharing ? '⏳ Sharing...' : <><Share2 size={12} /> Share to Feed</>}
        </button>
      </div>

      {msg && <p className="text-green-400 text-xs font-semibold mb-3 text-center px-2">{msg}</p>}

      <p className="text-[10px] text-yellow-500/70 mb-3 text-center">
        🎨 Customize 6+ features & save to earn +25 Glow Points (once per month)!
      </p>

      {/* Tab Bar */}
      <div className="w-full overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-1.5 px-1 min-w-max">
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition"
                style={isActive
                  ? { background: '#C2185B', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Presets Tab ── */}
      {activeTab === 'presets' && (
        <div className="w-full grid grid-cols-2 gap-2 px-1">
          {PRESETS.map(preset => (
            <button key={preset.id} onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold text-white text-left transition hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Sparkles size={12} className="text-yellow-400 flex-shrink-0" />
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div className="w-full px-1">
          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">
              <Clock size={24} className="mx-auto mb-2 opacity-40" />
              No saved looks yet. Save your avatar to create history!
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 mb-2">Last {history.length} saved look{history.length > 1 ? 's' : ''} · tap to restore</p>
              {history.map((entry, idx) => (
                <div key={entry.timestamp}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={entry.url} alt="look" className="w-12 h-12 rounded-full object-contain flex-shrink-0"
                    style={{ background: `#${entry.config?.background || 'FCE4EC'}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => { setConfig({ ...DEFAULT_CONFIG, ...entry.config }); setActiveTab('skin'); }}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg text-pink-300"
                    style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                    Restore
                  </button>
                  <button onClick={() => deleteHistory(idx)} className="text-gray-600 hover:text-red-400 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Frame Tab ── */}
      {activeTab === 'frame' && (
        <div className="w-full grid grid-cols-2 gap-2 px-1">
          {FRAMES.map(frame => {
            const isSelected = (config.frame || 'none') === frame.id;
            return (
              <button key={frame.id} onClick={() => set('frame', frame.id)}
                className="flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-semibold text-white text-left transition"
                style={isSelected
                  ? { background: 'rgba(194,24,91,0.25)', border: '2px solid #C2185B' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {frame.label}
                {isSelected && <Check size={11} className="ml-auto text-pink-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── All other tabs ── */}
      {activeTab !== 'presets' && activeTab !== 'history' && activeTab !== 'frame' && (
        <div className="w-full overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 px-1 min-w-max">
            {currentOptions.map(opt => {
              const isSelected = currentValue === opt.value;
              return (
                <button key={opt.value} onClick={() => set(activeTab, opt.value)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  style={isSelected
                    ? { background: 'rgba(194,24,91,0.25)', border: '2px solid #C2185B', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  {COLOR_TABS.includes(activeTab) && (
                    <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle border border-white/20"
                      style={{ background: `#${opt.value}` }} />
                  )}
                  {opt.label}
                  {isSelected && <Check size={10} className="inline ml-1 text-pink-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-600 mt-4 text-center">Powered by DiceBear · Free & open source</p>
    </div>
  );
}