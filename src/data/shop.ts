import type { ShopItemDef } from '@/types';

export const SHOP_CATALOG: ShopItemDef[] = [
  { id: 'car_red', name: 'Xe Đua Đỏ', emoji: '🏎️', category: 'car', cost: 10, rarity: 'common', description: 'Xe đua màu đỏ rực lửa' },
  { id: 'car_blue', name: 'Xe Đua Xanh', emoji: '🚙', category: 'car', cost: 20, rarity: 'rare', description: 'Xe xanh mạnh mẽ' },
  { id: 'car_super', name: 'Xe Siêu Tốc', emoji: '🏁', category: 'car', cost: 50, rarity: 'epic', description: 'Siêu xe tốc độ cao' },
  { id: 'ship_green', name: 'Tàu Xanh', emoji: '🛸', category: 'special', cost: 15, rarity: 'common', description: 'Tàu vũ trụ xanh lá' },
  { id: 'ship_gold', name: 'Tàu Vàng', emoji: '✨', category: 'special', cost: 30, rarity: 'rare', description: 'Tàu vàng sáng lấp lánh' },
  { id: 'ship_dragon', name: 'Tàu Rồng', emoji: '🐉', category: 'special', cost: 50, rarity: 'epic', description: 'Tàu hình rồng huyền bí' },
  { id: 'avatar_hero', name: 'Siêu Nhân', emoji: '🦸', category: 'character', cost: 5, rarity: 'common', description: 'Siêu anh hùng dũng cảm' },
  { id: 'avatar_princess', name: 'Công Chúa', emoji: '👸', category: 'character', cost: 10, rarity: 'common', description: 'Công chúa xinh đẹp' },
  { id: 'avatar_ninja', name: 'Ninja', emoji: '🥷', category: 'character', cost: 20, rarity: 'rare', description: 'Ninja bí ẩn' },
  { id: 'pet_dragon', name: 'Rồng Nhỏ', emoji: '🐲', category: 'pet', cost: 80, rarity: 'legendary', description: 'Thú cưng rồng huyền thoại' },
  { id: 'pet_unicorn', name: 'Kỳ Lân', emoji: '🦄', category: 'pet', cost: 60, rarity: 'epic', description: 'Kỳ lân thần thoại' },
];

export function findShopItem(id: string): ShopItemDef | undefined {
  return SHOP_CATALOG.find((item) => item.id === id);
}
