/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles, User, Loader2 } from 'lucide-react';
import useChatStore from '../store/useChatStore';
import useUserStore from '../store/useUserStore';

const AIChatbot = () => {
  const { messages, loading, sending, fetchHistory, sendMessage, clearHistory } = useChatStore();
  const { profileDetails, fetchProfile } = useUserStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchProfile();
  }, []);

  // Scroll otomatis ke bawah jika ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    
    const textToSend = inputText;
    setInputText('');
    
    try {
      await sendMessage(textToSend);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestionClick = async (promptText) => {
    if (sending) return;
    try {
      await sendMessage(promptText);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    if (confirm('Hapus seluruh riwayat percakapan dengan AI?')) {
      clearHistory();
    }
  };

  // Parser Markdown sederhana untuk merender bold ** dan Bullet List *
  const formatMessageContent = (text) => {
    return text.split('\n').map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Check if it is a list item
      const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
      let content = trimmed;
      if (isBullet) {
        content = trimmed.replace(/^[*-\s]+/, '');
      }

      // Parse bold tags **text**
      const parts = content.split('**');
      const formatted = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-emerald-400">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm leading-relaxed text-neutral-300 mt-1">
            {formatted}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed text-neutral-300 mt-2">
          {formatted}
        </p>
      );
    });
  };

  const suggestions = [
    { label: 'Diet Bulking', text: 'Bagaimana menu diet kalori yang cocok untuk program Bulking saya?' },
    { label: 'Tips Bakar Lemak', text: 'Bagaimana kombinasi kardio dan latihan beban untuk program Cutting?' },
    { label: 'Analisis Tubuh', text: 'Tolong jelaskan analisis berat badan ideal dan status BMI saya harian.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header Chat */}
      <div className="h-16 border-b border-neutral-850 px-6 flex items-center justify-between bg-neutral-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              AI Fitness Assistant
              <Sparkles size={12} className="text-emerald-400 animate-spin-slow" />
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Online & Siap Membantu
            </span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-neutral-500 hover:text-red-500 p-2 hover:bg-neutral-850 rounded-xl transition-all cursor-pointer"
            title="Hapus Percakapan"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Area Obrolan Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-950/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <p className="text-xs">Memuat riwayat percakapan...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4 py-8">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
              <Bot size={28} />
            </div>
            <div>
              <h4 className="font-bold text-white">Konsultasi Fitness AI</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Tanyakan apa saja seputar gerakan latihan, anjuran kalori makro, resep makanan sehat, atau tips menjaga konsistensi latihan gym.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((chat) => (
              <div
                key={chat.id}
                className={`flex gap-3 max-w-[85%] ${chat.role === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 text-xs font-bold ${
                  chat.role === 'USER'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-neutral-900 border-neutral-850 text-neutral-400'
                }`}>
                  {chat.role === 'USER' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble Chat */}
                <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                  chat.role === 'USER'
                    ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none'
                    : 'bg-neutral-900 border-neutral-850 text-neutral-100 rounded-tl-none'
                }`}>
                  {chat.role === 'USER' ? (
                    <p className="text-sm">{chat.content}</p>
                  ) : (
                    <div className="space-y-1">{formatMessageContent(chat.content)}</div>
                  )}
                  <span className="text-[9px] text-neutral-500 block mt-2 text-right">
                    {chat.createdAt ? new Date(chat.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            ))}

            {/* Indikator Mengetik AI */}
            {sending && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400">
                  <Bot size={14} />
                </div>
                <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer Chat: Chip Pertanyaan & Form Input */}
      <div className="p-4 border-t border-neutral-850 bg-neutral-900 shrink-0 space-y-3">
        {/* Chip Rekomendasi Pertanyaan */}
        {messages.length === 0 && !sending && (
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(sug.text)}
                className="px-3.5 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs rounded-full transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={10} className="text-emerald-400" />
                <span>{sug.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            placeholder={
              !profileDetails
                ? 'Lengkapi profil fisik Anda terlebih dahulu...'
                : 'Ketik pesan Anda ke asisten fitness...'
            }
            className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim() || !profileDetails}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-emerald-500/10 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIChatbot;
