export interface BoardTypeConfig {
  label: string;
  color: string;
  icon: string;
  priceSuffix: string;
}

export const BOARD_TYPES: Record<string, BoardTypeConfig> = {
  'OFFRO': { label: 'Offro', color: 'bg-green-500 text-black', icon: '🟢', priceSuffix: '' },
  'CERCO': { label: 'Cerco', color: 'bg-blue-500 text-white', icon: '🔵', priceSuffix: '' },
  'VENDO': { label: 'Vendo', color: 'bg-pink-500 text-white', icon: '💰', priceSuffix: '' },
  'REGALO': { label: 'Regalo', color: 'bg-yellow-500 text-black', icon: '🎁', priceSuffix: '' },
  'STANZE': { label: 'Stanza', color: 'bg-yellow-500 text-black', icon: '🏠', priceSuffix: '/mese' },
  'RIPETIZIONI': { label: 'Ripetizioni', color: 'bg-green-500 text-black', icon: '🧑‍🏫', priceSuffix: '/ora' },
  'DISPENSA': { label: 'Dispensa', color: 'bg-blue-500 text-white', icon: '📚', priceSuffix: '' },
  'PROVA_ESAME': { label: 'Prova Esame', color: 'bg-red-500 text-white', icon: '📝', priceSuffix: '' },
  'STAGE_LAVORO': { label: 'Lavoro', color: 'bg-teal-500 text-white', icon: '💼', priceSuffix: '' },
};

export const getRealBoardType = (post: any): string => {
  if (post.tags?.includes('DISPENSA')) return 'DISPENSA';
  if (post.tags?.includes('PROVA_ESAME')) return 'PROVA_ESAME';
  if (post.tags?.includes('STAGE_LAVORO')) return 'STAGE_LAVORO';
  if (post.category === 'STANZE') return 'STANZE';
  if (post.category === 'STUDIO') return 'RIPETIZIONI';
  return post.type || 'OFFRO';
};