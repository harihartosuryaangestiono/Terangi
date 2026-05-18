import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

const CRISIS_KEYWORDS = ["bunuh diri", "mau mati", "dipukul", "disiksa", "takut pulang", "darurat", "tolong sekarang", "ancaman", "dibunuh"];

const detectCrisis = (text) => {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

const getIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/(keluarga|orang tua|suami|istri|mertua|berantem)/)) {
    return 'family_issues';
  }
  if (lowerText.match(/(kasar|pukul|leceh|bully|jahat|ancam)/)) {
    return 'violence_abuse';
  }
  if (lowerText.match(/(stres|depresi|cemas|takut|capek|lelah|sedih|nangis|pusing|hancur)/)) {
    return 'mental_health';
  }
  if (lowerText.match(/(uang|miskin|hutang|kerja|phk|ekonomi|lapar|makan)/)) {
    return 'economy';
  }
  if (lowerText.match(/(halo|hai|hey|selamat|pagi|siang|sore|malam)/)) {
    return 'general_greeting';
  }
  return 'unknown';
};

const generateBotResponse = (text) => {
  // 1. Check for Crisis First
  if (detectCrisis(text)) {
    return "Aku khawatir dengan kondisi kamu 😔\nKeselamatan kamu itu yang paling penting sekarang. Kamu nggak harus hadapi ini sendirian.\nSegera gunakan fitur 'Kontak Darurat' di aplikasi Terangi supaya kamu bisa mendapatkan bantuan secepat mungkin.";
  }

  // 2. Classify Intent for non-crisis
  const intent = getIntent(text);

  switch (intent) {
    case 'family_issues':
      return "Aku ngerti, masalah keluarga memang bisa bikin stres dan capek secara emosional 😔. Kalau kamu nyaman, boleh cerita sedikit apa yang lagi terjadi? Sementara itu, kamu juga bisa pertimbangkan pakai fitur 'Penjadwalan Sesi' di Terangi untuk ngobrol langsung dengan konselor yang bisa bantu lebih dalam.";
    
    case 'violence_abuse':
      return "Pasti nggak mudah ya berada di situasi seperti ini 😔. Terima kasih sudah mau berbagi dan jujur. Ingat, kamu pantas mendapatkan lingkungan yang aman. Jangan ragu buat pakai fitur 'Penjadwalan Sesi' untuk cari solusi bareng profesional, atau cari tempat aman lewat 'Pencari Lokasi Layanan'.";
    
    case 'mental_health':
      return "Aku ngerti, ngerasain hal kayak gini pasti berat dan bikin capek secara emosional 😔. Wajar kok kalau kamu merasa kewalahan. Kalau kamu nyaman, kamu bisa pakai fitur 'Penjadwalan Sesi' di Terangi buat ngobrol langsung sama konselor yang siap bantu kamu lebih dalam menghadapi ini.";
    
    case 'economy':
      return "Situasi finansial yang sulit memang sangat membebani pikiran 😔. Kamu hebat sudah bisa bertahan sampai titik ini. Meski saat ini terasa buntu, selalu ada jalan keluar. Kamu bisa coba cek fitur 'Pencari Lokasi Layanan' untuk melihat bantuan sosial terdekat atau 'Penjadwalan Sesi' jika butuh pendampingan psikologis.";
    
    case 'general_greeting':
      return "Halo! 👋 Aku Asisten Virtual Terangi. Aku di sini untuk mendengarkan dan bantu arahin kamu ke bantuan yang tepat. Ada yang lagi kerasa berat atau mau diceritain hari ini? Jangan ragu ya, kamu aman cerita di sini 🙂.";
    
    default:
      return "Terima kasih sudah berbagi cerita sama aku 🙏. Apa yang kamu rasain itu valid, dan kadang kita emang butuh ruang buat didengar. Kalau butuh bantuan lebih jauh, kamu bisa cek fitur 'Penjadwalan Sesi' untuk ngobrol sama profesional, atau 'Kontak Darurat' kalau situasinya genting.";
  }
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isMock = !apiKey || apiKey === 'your_firebase_api_key_here';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isMock) {
      setMessages([
        { id: 'welcome', text: 'Halo! 👋 Aku Asisten Virtual Terangi. Aku di sini untuk mendengarkan dan bantu arahin kamu ke bantuan yang tepat. Ada yang mau diceritain hari ini?', sender: 'admin', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      return;
    }

    const q = query(collection(db, 'chats'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
      }));
      
      const userUid = currentUser?.uid || 'anonymous';
      const userMsgs = msgs.filter(m => m.userId === userUid);
      
      if (userMsgs.length === 0) {
        setMessages([
          { id: 'welcome', text: 'Halo! 👋 Aku Asisten Virtual Terangi. Aku di sini untuk mendengarkan dan bantu arahin kamu ke bantuan yang tepat. Ada yang mau diceritain hari ini?', sender: 'admin', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else {
        setMessages(userMsgs);
      }
    });

    return () => unsubscribe();
  }, [isMock, currentUser]);

  const WELCOME_MESSAGE = { id: 'welcome', text: 'Halo! 👋 Aku Asisten Virtual Terangi. Aku di sini untuk mendengarkan dan bantu arahin kamu ke bantuan yang tepat. Ada yang mau diceritain hari ini?', sender: 'admin', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

  const handleClearChat = async () => {
    if (isMock) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }
    try {
      const userUid = currentUser?.uid || 'anonymous';
      const q = query(collection(db, 'chats'), where('userId', '==', userUid));
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'chats', d.id))));
      setMessages([WELCOME_MESSAGE]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input;
    const userUid = currentUser?.uid || 'anonymous';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setInput('');

    if (isMock) {
      const newMessage = {
        id: Date.now(),
        text,
        sender: 'user',
        time: currentTime
      };
      setMessages(prev => [...prev, newMessage]);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: generateBotResponse(text),
          sender: 'admin',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        text,
        sender: 'user',
        userId: userUid,
        createdAt: serverTimestamp()
      });
      
      setIsTyping(true);
      
      setTimeout(async () => {
        try {
          await addDoc(collection(db, 'chats'), {
            text: generateBotResponse(text),
            sender: 'admin',
            userId: userUid,
            createdAt: serverTimestamp()
          });
        } catch (botError) {
          console.error("Error adding bot reply: ", botError);
        }
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error("Error adding document: ", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-gray-50 md:rounded-2xl overflow-hidden relative min-h-0">
      <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900">Asisten Terangi</h2>
          <p className="text-xs text-green-500 font-medium">Online • AI Pendamping</p>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Bersihkan chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCrisis = detectCrisis(msg.text) && msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 shadow-sm ${msg.sender === 'user' ? (isCrisis ? 'bg-red-500 text-white' : 'bg-primary-500 text-white') + ' rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 whitespace-pre-wrap'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl p-3 shadow-sm bg-white text-gray-800 rounded-tl-none border border-gray-100 flex items-center gap-1 h-10">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ceritakan apa yang kamu rasakan..."
            className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" className="rounded-full flex-shrink-0" disabled={!input.trim() || isTyping}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
