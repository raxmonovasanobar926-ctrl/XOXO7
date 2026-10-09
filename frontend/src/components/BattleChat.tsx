import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { MessageSquare, X } from 'lucide-react';
import { haptics } from '../utils/haptics.ts';
import { ChatStickerIcon } from './graphics/ChatStickers.tsx';

type StickerType = 'gg' | 'luck' | 'great_move' | 'oops' | 'rematch' | 'laugh' | 'thinking' | 'fire';

const STICKER_LIST: Array<{ id: StickerType; labelKey: string }> = [
  { id: 'gg', labelKey: 'gg' },
  { id: 'luck', labelKey: 'luck' },
  { id: 'great_move', labelKey: 'great_move' },
  { id: 'fire', labelKey: 'i_will_win' },
  { id: 'thinking', labelKey: 'watch_out' },
  { id: 'oops', labelKey: 'omg' },
  { id: 'rematch', labelKey: 'rematch_req' },
  { id: 'laugh', labelKey: 'you_made_mistake' },
];

interface BattleChatProps {
  player1Id: number;
  player2Id?: number;
}

export const BattleChat: React.FC<BattleChatProps> = ({ player1Id }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { chatMessages, sendBattleChat } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const handleSendSticker = (stickerId: StickerType) => {
    haptics.selection();
    sendBattleChat(stickerId, undefined);
    setIsOpen(false);
  };

  const handleSendPhrase = (phraseKey: string) => {
    haptics.selection();
    const translatedPhrase = t(`battle_chat.${phraseKey}`);
    sendBattleChat(undefined, translatedPhrase);
    setIsOpen(false);
  };

  const now = Date.now();
  const recentMessages = chatMessages.filter((m) => now - m.timestamp < 4000);

  return (
    <>
      {/* Floating Bubbles over players */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        {recentMessages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const isPlayer1 = msg.senderId === player1Id;

          return (
            <div
              key={msg.id}
              className={`absolute transform transition-all duration-300 animate-float-bubble pointer-events-none ${
                isPlayer1 ? 'top-16 left-6' : 'top-16 right-6'
              }`}
            >
              <div
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl shadow-lg border backdrop-blur-md specular-rim ${
                  isMe
                    ? 'bg-sky-500/15 border-sky-400/50 text-sky-950 dark:text-sky-100 shadow-[0_4px_16px_rgba(2,132,199,0.2)]'
                    : 'bg-rose-500/15 border-rose-400/50 text-rose-950 dark:text-rose-100 shadow-[0_4px_16px_rgba(225,29,72,0.2)]'
                }`}
              >
                {msg.emoji && (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <ChatStickerIcon name={msg.emoji as any} size={24} />
                  </div>
                )}
                {msg.phrase && <span className="text-xs font-extrabold whitespace-nowrap">{msg.phrase}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full glass-surface border border-white/70 dark:border-white/20 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all specular-rim"
          title="Battle Chat"
        >
          {isOpen ? <X className="w-5 h-5 text-slate-700 dark:text-slate-200" /> : <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        </button>
      </div>

      {/* Reaction Drawer / Popup */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-40 w-72 glass-modal-card rounded-3xl p-3.5 shadow-2xl animate-scale-up border border-white/60 dark:border-white/15">
          <div className="specular-rim" />
          {/* Quick Vector Stickers */}
          <div className="grid grid-cols-4 gap-2 pb-2.5 border-b border-slate-200/50 dark:border-white/10">
            {STICKER_LIST.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSendSticker(sticker.id)}
                className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/15 flex items-center justify-center transition-transform active:scale-90 border border-slate-200/50 dark:border-white/10 hover:border-purple-400/40 shadow-sm"
                title={t(`battle_chat.${sticker.labelKey}`)}
              >
                <ChatStickerIcon name={sticker.id} size={26} />
              </button>
            ))}
          </div>

          {/* Quick Phrases */}
          <div className="grid grid-cols-1 gap-1.5 pt-2.5 max-h-48 overflow-y-auto pr-1">
            {STICKER_LIST.map((item) => (
              <button
                key={item.labelKey}
                onClick={() => handleSendPhrase(item.labelKey)}
                className="text-left px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-purple-500/15 text-xs text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center space-x-2 truncate border border-transparent hover:border-purple-400/30"
              >
                <ChatStickerIcon name={item.id} size={16} />
                <span className="truncate font-semibold">{t(`battle_chat.${item.labelKey}`)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
export default BattleChat;
