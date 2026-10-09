export interface AvatarItem {
  id: string;
  name: string;
  gradient: string;
}

export const AVATAR_LIST: AvatarItem[] = [
  { id: 'avatar_1', name: 'Broco', gradient: 'from-emerald-500 to-teal-700' },
  { id: 'avatar_2', name: 'Tonot', gradient: 'from-slate-900 to-sky-950' },
  { id: 'avatar_3', name: 'Bochill', gradient: 'from-sky-400 to-blue-600' },
  { id: 'avatar_4', name: 'Bredo', gradient: 'from-sky-500 to-blue-700' },
  { id: 'avatar_5', name: 'Kocheng', gradient: 'from-rose-500 to-red-700' },
  { id: 'avatar_6', name: 'Yo', gradient: 'from-slate-600 to-slate-800' },
  { id: 'avatar_7', name: 'Ded', gradient: 'from-amber-600 to-amber-900' },
  { id: 'avatar_8', name: 'Wuhu', gradient: 'from-fuchsia-950 to-purple-900' },
  { id: 'avatar_9', name: 'Drino', gradient: 'from-amber-500 to-yellow-600' },
];

export function getAvatarInfo(avatarId: string): AvatarItem {
  const found = AVATAR_LIST.find(a => a.id === avatarId);
  return found || AVATAR_LIST[0];
}
