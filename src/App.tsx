/**
 * @file App.tsx
 * @description 따뜻한 하루 일기 & AI 응원 웹앱 (Warm Daily Diary & AI Encouragement)
 * 
 * [이번 업데이트]
 * 1. 골든 리트리버 이미지 개선: 유치하지 않고 부드러운 동화책 수채화 감성의 사랑스러운 일러스트 적용
 *    - 감정(기쁨, 지침, 설렘, 불안)에 맞춘 4가지 섬세한 표정 및 무드
 * 2. 타이포그래피 전면 개편: 화면 내 모든 글씨, 버튼, 일기 작성 입력창(textarea, input)에
 *    간결하면서도 둥글둥글 따뜻한 감성 손글씨체(Gamja Flower & Gowun Dodum) 통일 적용
 * 3. 줄노트 페이퍼 패턴과 손글씨 폰트 줄 간격(Line-height) 완벽 조화
 */

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  BookHeart,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  HelpCircle,
  RefreshCw,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Cloud,
  ChevronRight,
  Coffee,
  Copy,
  Check,
} from 'lucide-react';

/* =========================================================================
   1. 제공된 Firebase 설정 정보 및 안전한 초기화
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyAFKmwSbHRSUKlWF6r11KRlUE9NvhclPXY",
  authDomain: "altn-2d4b8.firebaseapp.com",
  projectId: "altn-2d4b8",
  storageBucket: "altn-2d4b8.firebasestorage.app",
  messagingSenderId: "674299841479",
  appId: "1:674299841479:web:e898283b7f6404ddb467e2"
};

// 중복 초기화 방지를 위한 인스턴스 확인
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/* =========================================================================
   2. 타입 정의 (Types & Interfaces)
   ========================================================================= */

// 감정 4종 타입
export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

// 날씨 타입
export type WeatherType = '맑음' | '구름' | '비' | '바람' | '별밤';

// 일기 저장 구조
export interface DiaryEntry {
  id?: string;
  date: string;
  weather: WeatherType;
  emotion: EmotionType;
  title: string;
  content: string;
  comfortMessage: string;
  actionItem: string;
  retrieverReaction: string;
  retrieverGift: string;
  actionCompleted?: boolean;
  createdAt: number;
}

// AI 응답 데이터 구조
export interface AIComfortResponse {
  comfortMessage: string;
  actionItem: string;
  retrieverReaction: string;
  retrieverGift: string;
}

/* =========================================================================
   3. 사랑스러운 동화 수채화풍 골든 리트리버 일러스트 데이터
   ========================================================================= */

// 감정별 고품질 동화 수채화 일러스트 매핑
const RETRIEVER_ARTWORKS: Record<
  EmotionType,
  {
    src: string;
    alt: string;
    moodBadge: string;
    speechBubble: string;
  }
> = {
  기쁨: {
    src: '/src/assets/images/retriever_joy_1790842790121.jpg',
    alt: '햇살 아래 따뜻하고 다정하게 미소 짓는 사랑스러운 골든 리트리버 인절미',
    moodBadge: '햇살 같은 미소 🐾',
    speechBubble: '오늘 정말 기분 좋은 일이 가득했군요! 같이 기뻐할게요, 멍!',
  },
  지침: {
    src: '/src/assets/images/retriever_tired_1790842809927.jpg',
    alt: '앞발에 턱을 괴고 깊은 공감의 눈빛으로 바라보는 포근한 골든 리트리버 인절미',
    moodBadge: '포근한 쉼표 🌙',
    speechBubble: '오늘 하루 정말 수고 많으셨어요. 제 곁에서 푹 쉬어가요...',
  },
  설렘: {
    src: '/src/assets/images/retriever_flutter_1790842827164.jpg',
    alt: '네잎클로버를 물고 반짝이는 눈망울로 바라보는 골든 리트리버 인절미',
    moodBadge: '행운의 네잎클로버 🍀',
    speechBubble: '두근두근 설레는 마음! 내일도 멋진 일들이 찾아올 거예요!',
  },
  불안: {
    src: '/src/assets/images/retriever_anxious_1790842844739.jpg',
    alt: '포근한 숄을 두르고 다정한 온기의 앞발을 내미는 골든 리트리버 인절미',
    moodBadge: '다정한 온기의 손길 🧣',
    speechBubble: '불안해하지 마세요, 제가 꼭 붙어서 곁을 든든하게 지켜줄게요.',
  },
};

interface RetrieverMascotCardProps {
  emotion: EmotionType;
  isWriting: boolean;
  onPet: () => void;
  petCount: number;
}

const RetrieverMascotCard: React.FC<RetrieverMascotCardProps> = ({
  emotion,
  isWriting,
  onPet,
  petCount,
}) => {
  const currentArt = RETRIEVER_ARTWORKS[emotion];

  return (
    <div className="relative flex flex-col items-center">
      {/* 댕댕이 말풍선 (손글씨 느낌) */}
      <div className="mb-2 bg-white/95 border-2 border-amber-200/90 px-3.5 py-1.5 rounded-2xl shadow-sm text-xs md:text-sm text-amber-950 font-round-hand flex items-center gap-1.5 animate-puppy-float z-10 max-w-[240px] text-center">
        <span className="text-amber-500 flex-shrink-0">🐾</span>
        <span>{currentArt.speechBubble}</span>
      </div>

      {/* 리트리버 동화 일러스트 액자 */}
      <div
        onClick={onPet}
        className="relative group cursor-pointer select-none transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        title="인절미를 쓰다듬어 보세요!"
      >
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-amber-100 shadow-md ring-2 ring-amber-200/60 bg-[#FFFDF9] relative">
          <img
            src={currentArt.src}
            alt={currentArt.alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 은은한 웜톤 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/15 via-transparent to-transparent pointer-events-none" />

          {/* 글 쓰는 중 로딩 오버레이 */}
          {isWriting && (
            <div className="absolute inset-0 bg-amber-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-xs font-round-hand p-2 text-center animate-pulse">
              <span className="text-2xl mb-1">✍️</span>
              <span>편지 적는 중...</span>
            </div>
          )}
        </div>

        {/* 쓰다듬기 하트 플로팅 */}
        {petCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-round-hand font-bold shadow-sm animate-bounce flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span>+{petCount}</span>
          </div>
        )}

        {/* 하단 무드 뱃지 */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-50 text-amber-900 border border-amber-200/90 text-xs px-2.5 py-0.5 rounded-full font-round-hand shadow-2xs">
          {currentArt.moodBadge}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. 메인 App 컴포넌트
   ========================================================================= */

export default function App() {
  // --- 상태 관리 (States) ---
  const [emotion, setEmotion] = useState<EmotionType>('기쁨');
  const [weather, setWeather] = useState<WeatherType>('맑음');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState<number>(0);
  const [aiResponse, setAiResponse] = useState<AIComfortResponse | null>(null);

  // 저장된 일기 목록 & 모달 관리
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [petHeartCount, setPetHeartCount] = useState<number>(0);

  // 편안한 힐링 빗소리 앰비언스 오디오
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // 로딩 중 따뜻한 문구 순환
  const comfortingLoadingMessages = [
    '인절미가 꼬리를 흔들며 따뜻한 편지를 적고 있어요... 🐾',
    '마음을 담아 포근한 위로를 준비 중이에요...',
    '오늘 하루 지친 당신을 위해 네잎클로버를 찾고 있어요 🍀',
    '내일을 향한 작고 예쁜 행복 씨앗을 고르는 중이에요...',
  ];

  // 감정별 테마 및 설명
  const emotionMeta: Record<
    EmotionType,
    { emoji: string; label: string; bg: string; border: string; text: string }
  > = {
    기쁨: {
      emoji: '☀️',
      label: '기쁨',
      bg: 'bg-amber-50 hover:bg-amber-100/80',
      border: 'border-amber-400 text-amber-950',
      text: '미소와 행복이 가득 찬 날',
    },
    지침: {
      emoji: '🌙',
      label: '지침',
      bg: 'bg-slate-50 hover:bg-slate-100',
      border: 'border-slate-400 text-slate-900',
      text: '에너지가 다 소진되어 쉼이 필요한 날',
    },
    설렘: {
      emoji: '🌸',
      label: '설렘',
      bg: 'bg-rose-50 hover:bg-rose-100/80',
      border: 'border-rose-400 text-rose-950',
      text: '가슴이 콩닥콩닥 기대되는 날',
    },
    불안: {
      emoji: '🌧️',
      label: '불안',
      bg: 'bg-sky-50 hover:bg-sky-100/80',
      border: 'border-sky-400 text-sky-950',
      text: '걱정과 생각이 많아 흔들리는 날',
    },
  };

  // 날씨 옵션 리스트
  const weatherOptions: { type: WeatherType; icon: React.ReactNode; label: string }[] = [
    { type: '맑음', icon: <Sun className="w-4 h-4 text-amber-500" />, label: '맑음' },
    { type: '구름', icon: <Cloud className="w-4 h-4 text-gray-500" />, label: '구름' },
    { type: '비', icon: <CloudRain className="w-4 h-4 text-sky-500" />, label: '비' },
    { type: '바람', icon: <Wind className="w-4 h-4 text-teal-500" />, label: '바람' },
    { type: '별밤', icon: <Moon className="w-4 h-4 text-indigo-500" />, label: '별밤' },
  ];

  /* =========================================================================
     5. 데이터 로드 및 저장 (Firestore + localStorage 백업)
     ========================================================================= */

  useEffect(() => {
    loadDiaries();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % comfortingLoadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadDiaries = async () => {
    const localSaved = localStorage.getItem('warm_diary_entries');
    const localList: DiaryEntry[] = localSaved ? JSON.parse(localSaved) : [];

    try {
      const q = query(collection(db, 'diaries'), orderBy('createdAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const firestoreList: DiaryEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        firestoreList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      if (firestoreList.length > 0) {
        setDiaries(firestoreList);
        localStorage.setItem('warm_diary_entries', JSON.stringify(firestoreList));
      } else {
        setDiaries(localList);
      }
    } catch (error) {
      console.info('Firestore 연결 대기 중: 로컬 일기 데이터를 사용합니다.', error);
      setDiaries(localList);
    }
  };

  const saveDiaryToStorage = async (newEntry: DiaryEntry) => {
    const updated = [newEntry, ...diaries];
    setDiaries(updated);
    localStorage.setItem('warm_diary_entries', JSON.stringify(updated));

    try {
      const docRef = await addDoc(collection(db, 'diaries'), {
        date: newEntry.date,
        weather: newEntry.weather,
        emotion: newEntry.emotion,
        title: newEntry.title,
        content: newEntry.content,
        comfortMessage: newEntry.comfortMessage,
        actionItem: newEntry.actionItem,
        retrieverReaction: newEntry.retrieverReaction,
        retrieverGift: newEntry.retrieverGift,
        actionCompleted: false,
        createdAt: Date.now(),
      });
      newEntry.id = docRef.id;
    } catch (err) {
      console.warn('Firebase Firestore 저장 알림 (로컬 저장소에는 정상 보관됨):', err);
    }
  };

  const handleDeleteDiary = async (targetId?: string, targetCreatedAt?: number) => {
    if (!window.confirm('이 일기를 보관함에서 지우시겠어요?')) return;

    const filtered = diaries.filter(
      (d) => (targetId && d.id !== targetId) || (targetCreatedAt && d.createdAt !== targetCreatedAt)
    );
    setDiaries(filtered);
    localStorage.setItem('warm_diary_entries', JSON.stringify(filtered));

    if (targetId) {
      try {
        await deleteDoc(doc(db, 'diaries', targetId));
      } catch (e) {
        console.warn('Firestore 삭제 중 오류:', e);
      }
    }

    if (selectedDiary && (selectedDiary.id === targetId || selectedDiary.createdAt === targetCreatedAt)) {
      setSelectedDiary(null);
    }
  };

  const toggleActionCompleted = (entryCreatedAt: number) => {
    const updated = diaries.map((d) => {
      if (d.createdAt === entryCreatedAt) {
        return { ...d, actionCompleted: !d.actionCompleted };
      }
      return d;
    });
    setDiaries(updated);
    localStorage.setItem('warm_diary_entries', JSON.stringify(updated));
    if (selectedDiary && selectedDiary.createdAt === entryCreatedAt) {
      setSelectedDiary({ ...selectedDiary, actionCompleted: !selectedDiary.actionCompleted });
    }
  };

  /* =========================================================================
     6. Gemini AI 연동 핸들러 ([AI 비서에게 일기 보여주기])
     ========================================================================= */

  const handleSubmitDiary = async () => {
    if (!content.trim()) {
      alert('오늘 하루 동안 있었던 일이나 떠오른 생각을 조금이라도 적어주세요 🐾');
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    const todayDateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    try {
      const response = await fetch('/api/comfort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diaryContent: content,
          emotion: emotion,
          date: todayDateStr,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (상태 코드: ${response.status})`);
      }

      const data: AIComfortResponse = await response.json();
      setAiResponse(data);

      const newEntry: DiaryEntry = {
        date: todayDateStr,
        weather: weather,
        emotion: emotion,
        title: title.trim() || `${emotion} 가득했던 하루`,
        content: content,
        comfortMessage: data.comfortMessage,
        actionItem: data.actionItem,
        retrieverReaction: data.retrieverReaction,
        retrieverGift: data.retrieverGift,
        actionCompleted: false,
        createdAt: Date.now(),
      };

      await saveDiaryToStorage(newEntry);
    } catch (error: any) {
      console.error('Gemini 호출 중 오류:', error);

      const fallbackResponses: Record<EmotionType, AIComfortResponse> = {
        기쁨: {
          comfortMessage: `오늘 정말 행복한 순간들을 보내셨군요! 당신의 일기를 읽는 저까지 꼬리를 세차게 흔들며 미소 짓게 돼요. 오늘 느낀 이 따스한 기쁨이 마음에 오래도록 머무르길 바랄게요.`,
          actionItem: '내일 아침 눈뜰 때 오늘 가장 기분 좋았던 순간 한 장면 떠올리며 미소 짓기',
          retrieverReaction: '인절미가 혀를 뺴꼼 내밀며 당신 주위를 신나게 빙글빙글 돌아요!',
          retrieverGift: '바삭바삭 달콤한 네잎클로버 쿠키',
        },
        지침: {
          comfortMessage: `오늘 하루 정말, 정말 고생 많으셨어요. 무거운 몸과 마음으로 끝까지 하루를 버텨낸 당신은 대단한 사람이에요. 이제 모든 짐을 내려놓고 편안히 쉴 시간이에요. 토닥토닥...`,
          actionItem: '잠자리에 들기 전 따뜻한 물 한 모금 마시고, 나 자신에게 "오늘도 참 잘 해냈다" 속삭여주기',
          retrieverReaction: '인절미가 조용히 다가와 보드라운 머리를 당신의 무릎에 포근히 기대요.',
          retrieverGift: '포실포실한 극세사 구름 방석',
        },
        설렘: {
          comfortMessage: `두근거리는 마음이 글자 사이사이에서 반짝반짝 빛나고 있어요! 새로운 시작이나 기대는 우리 삶을 환하게 밝혀주죠. 당신의 그 설렘이 내일도 아름답게 이어질 거예요.`,
          actionItem: '내일 가장 기대되는 순간을 머릿속으로 1분간 기분 좋게 상상해보기',
          retrieverReaction: '인절미가 반짝이는 눈망울로 앞발을 들며 하이파이브를 청해요!',
          retrieverGift: '향긋한 봄바람을 담은 꽃가지',
        },
        불안: {
          comfortMessage: `마음이 소용돌이치고 불안할 때는 숨 쉬는 것조차 버겁게 느껴지죠. 하지만 기억해 주세요. 불안은 당신이 삶을 진심으로 대하고 있다는 증거예요. 당신은 생각보다 훨씬 단단하고 멋진 사람이에요.`,
          actionItem: '창문을 열고 시원한 공기를 마시며 4초 들이쉬고 6초 천천히 내쉬는 심호흡 3번 하기',
          retrieverReaction: '인절미가 따뜻한 온기로 당신의 손등을 톡톡 토닥이며 든든하게 곁을 지켜요.',
          retrieverGift: '마음을 편안하게 가라앉혀 주는 둥굴레 온차 한 잔',
        },
      };

      const fallback = fallbackResponses[emotion];
      setAiResponse(fallback);

      const fallbackEntry: DiaryEntry = {
        date: todayDateStr,
        weather: weather,
        emotion: emotion,
        title: title.trim() || `${emotion} 가득했던 하루`,
        content: content,
        comfortMessage: fallback.comfortMessage,
        actionItem: fallback.actionItem,
        retrieverReaction: fallback.retrieverReaction,
        retrieverGift: fallback.retrieverGift,
        actionCompleted: false,
        createdAt: Date.now(),
      };
      await saveDiaryToStorage(fallbackEntry);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setContent('');
    setAiResponse(null);
  };

  const handleCopyComfortMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeakComfortMessage = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('사용하시는 브라우저에서는 음성 읽기 기능을 지원하지 않아요.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePetRetriever = () => {
    setPetHeartCount((prev) => prev + 1);
  };

  const toggleAmbience = () => {
    if (isAmbiencePlaying) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsAmbiencePlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 0.12;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start();
        noiseNodeRef.current = noise;
        setIsAmbiencePlaying(true);
      } catch (err) {
        console.warn('오디오 생성 실패:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#483C32] font-round-hand flex flex-col items-center">
      {/* =====================================================================
          상단 네비게이션 & 헤더
          ===================================================================== */}
      <header className="w-full max-w-4xl px-4 py-4 md:py-5 flex items-center justify-between border-b border-[#EFE4D6] bg-[#FAF7F2]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-xl shadow-2xs">
            🐾
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-amber-950 flex items-center gap-2">
              따뜻한 하루 일기
              <span className="text-sm font-normal bg-amber-100/90 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                AI 응원 비서
              </span>
            </h1>
            <p className="text-xs md:text-sm text-[#877567]">
              골든 리트리버 '인절미'가 당신의 오늘을 다정하게 감싸안아 줄게요
            </p>
          </div>
        </div>

        {/* 상단 액션 버튼 */}
        <div className="flex items-center gap-2">
          {/* 편안한 백색소음 토글 */}
          <button
            onClick={toggleAmbience}
            className={`px-3 py-2 rounded-2xl border text-sm flex items-center gap-1.5 transition-all ${
              isAmbiencePlaying
                ? 'bg-amber-200/90 border-amber-400 text-amber-950 shadow-xs'
                : 'bg-white border-[#E5DACB] text-[#766355] hover:bg-[#F5ECE0]'
            }`}
            title={isAmbiencePlaying ? '빗소리 끄기' : '편안한 빗소리 켜기'}
          >
            {isAmbiencePlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-800 animate-pulse" />
                <span className="hidden sm:inline">빗소리 켜짐</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">빗소리</span>
              </>
            )}
          </button>

          {/* 일기 보관함 열기 */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 rounded-2xl bg-white border border-[#E5DACB] text-[#5C4C3E] hover:bg-[#F5ECE0] text-sm flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <BookHeart className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">일기 보관함</span>
            {diaries.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {diaries.length}
              </span>
            )}
          </button>

          {/* 설정 및 가이드 */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-2 rounded-2xl bg-white border border-[#E5DACB] text-[#766355] hover:bg-[#F5ECE0] transition-colors"
            title="환경 변수 및 배포 가이드"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          메인 컨텐츠 영역
          ===================================================================== */}
      <main className="w-full max-w-3xl px-4 py-6 md:py-8 flex flex-col gap-6">
        {/* 사랑스러운 골든 리트리버 마스코트 환영 카드 */}
        <section className="bg-gradient-to-br from-[#FFFDF9] via-[#FFF8EE] to-[#FFF4E4] border border-[#EEDFCD] rounded-3xl p-5 md:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex-1 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-900 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-2 border border-amber-200/60">
              <span>오늘의 비서</span>
              <span>•</span>
              <span>골든 리트리버 '인절미'</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#3B2A1D] mb-1.5 leading-snug">
              "오늘 하루도 참 애쓰셨어요, 멍!"
            </h2>
            <p className="text-sm md:text-base text-[#705E50] leading-relaxed">
              기뻤던 순간도, 지치고 불안했던 마음도 모두 괜찮아요.
              <br className="hidden sm:inline" />
              당신의 일기를 읽고 따뜻한 위로와 내일을 위한 활력을 전해드릴게요.
            </p>

            {/* 쓰다듬기 버튼 */}
            <div className="mt-3.5 flex items-center justify-center sm:justify-start gap-2.5">
              <button
                onClick={handlePetRetriever}
                className="text-sm bg-white/95 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-full hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>인절미 쓰다듬기</span>
              </button>
              {petHeartCount > 0 && (
                <span className="text-sm text-rose-600 animate-bounce">
                  + {petHeartCount} 꼬리 살랑!
                </span>
              )}
            </div>
          </div>

          {/* 고품질 동화 수채화 리트리버 일러스트 카드 */}
          <div className="flex-shrink-0 pt-2 sm:pt-0">
            <RetrieverMascotCard
              emotion={emotion}
              isWriting={isLoading}
              onPet={handlePetRetriever}
              petCount={petHeartCount}
            />
          </div>
        </section>

        {/* ===================================================================
            핵심 기능 1: 일기 작성 및 감정 선택 영역
            =================================================================== */}
        <section className="bg-white border border-[#EADBCE] rounded-3xl p-5 md:p-8 shadow-xs flex flex-col gap-6 relative">
          {/* 상단 날짜 및 날씨 선택 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F2EAE0]">
            <div className="flex items-center gap-2 text-base text-[#705E51]">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>

            {/* 날씨 스티커 */}
            <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-2xl border border-[#EDE1D1]">
              {weatherOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setWeather(opt.type)}
                  className={`p-1.5 md:px-2.5 md:py-1 rounded-xl text-sm flex items-center gap-1 transition-all ${
                    weather === opt.type
                      ? 'bg-white text-amber-950 shadow-2xs border border-amber-200 font-bold'
                      : 'text-[#8C7A6B] hover:text-[#524135]'
                  }`}
                  title={opt.label}
                >
                  {opt.icon}
                  <span className="hidden md:inline">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 감정 선택 버튼 4종 (기쁨, 지침, 설렘, 불안) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-base md:text-lg font-bold text-[#443529] flex items-center gap-2">
                <span>오늘 하루, 당신의 마음 날씨는 어땠나요?</span>
                <span className="text-sm font-normal text-amber-700">
                  (택 1)
                </span>
              </label>
              <span className="text-sm text-[#8C7A6B] hidden sm:inline">
                {emotionMeta[emotion].text}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['기쁨', '지침', '설렘', '불안'] as EmotionType[]).map((emo) => {
                const isSelected = emotion === emo;
                const meta = emotionMeta[emo];
                return (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setEmotion(emo)}
                    className={`py-3 px-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer ${
                      isSelected
                        ? `${meta.bg} ${meta.border} shadow-xs scale-[1.02] font-bold ring-2 ring-amber-300/40`
                        : 'bg-white border-[#EDE1D2] text-[#69584B] hover:bg-[#FCF9F5] hover:border-amber-200'
                    }`}
                  >
                    <span className="text-2xl transition-transform duration-200">
                      {meta.emoji}
                    </span>
                    <span className="text-lg md:text-xl font-bold">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 일기 제목 입력창 (둥근 손글씨체 적용) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘 하루를 한 줄로 요약한다면? (예: 바람이 유난히 시원했던 퇴근길)"
              className="w-full px-4 py-3 rounded-2xl bg-[#FCFAF7] border border-[#EADBCE] text-base md:text-lg text-[#483C32] placeholder:text-[#A8988B] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all"
              maxLength={60}
            />
          </div>

          {/* 일기 본문 줄노트 텍스트창 (둥근 손글씨체 & 줄간격 정렬) */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 어떤 일들이 있었나요?&#10;뿌듯했던 순간, 속상해서 한숨 쉬었던 일, 사소하지만 따뜻했던 기억까지 편하게 털어놓아 보세요.&#10;인절미가 귀를 쫑긋 세우고 다정하게 들어줄게요..."
              rows={7}
              className="w-full p-4 rounded-2xl paper-pattern border border-[#EADBCE] text-base md:text-lg text-[#45372C] placeholder:text-[#A8988B] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all resize-y"
              maxLength={1500}
            />
            <div className="absolute bottom-3 right-4 text-xs md:text-sm text-[#A8988B]">
              {content.length} / 1500자
            </div>
          </div>

          {/* 추천 감성 태그 */}
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#8C7A6B]">
            <span className="text-[#614E40] font-bold">추천 태그:</span>
            {[
              '#수고했어오늘도',
              '#맛있는저녁',
              '#소소한행복',
              '#마음토닥이기',
              '#내일도화이팅',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setContent((prev) => (prev ? `${prev} ${tag}` : tag))}
                className="px-2.5 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DDCD] hover:bg-amber-100 hover:text-amber-900 transition-colors text-xs md:text-sm"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* [AI 비서에게 일기 보여주기] 버튼 */}
          <div className="pt-1">
            <button
              onClick={handleSubmitDiary}
              disabled={isLoading || !content.trim()}
              className={`w-full py-4 px-6 rounded-2xl text-xl md:text-2xl font-bold flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] cursor-pointer ${
                isLoading || !content.trim()
                  ? 'bg-[#E5DACB] text-[#9A897B] cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-300/40 hover:shadow-md'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{comfortingLoadingMessages[loadingMessageIdx]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                  <span>AI 비서에게 일기 보여주기 🐾</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ===================================================================
            핵심 기능 2: Google Gemini AI의 다정한 위로 및 내일 행동 제안 카드
            =================================================================== */}
        {aiResponse && (
          <section className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border-2 border-amber-300/80 rounded-3xl p-5 md:p-8 shadow-sm flex flex-col gap-5 animate-gentle relative overflow-hidden">
            {/* 상단 타이틀 바 */}
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-300 flex-shrink-0">
                  <img
                    src={RETRIEVER_ARTWORKS[emotion].src}
                    alt="인절미 미니 아바타"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-950">
                    인절미가 전하는 따뜻한 응원 편지
                  </h3>
                  <p className="text-xs md:text-sm text-amber-800/90">
                    {aiResponse.retrieverReaction || '꼬리를 흔들며 당신을 꼭 안아줘요'}
                  </p>
                </div>
              </div>

              {/* 편지 소리 내어 듣기 / 복사하기 액션 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeakComfortMessage(aiResponse.comfortMessage)}
                  className={`px-3 py-2 rounded-2xl border text-sm flex items-center gap-1.5 transition-all ${
                    isSpeaking
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white border-amber-200 text-amber-950 hover:bg-amber-50'
                  }`}
                  title={isSpeaking ? '음성 멈추기' : '다정한 목소리로 듣기'}
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isSpeaking ? '멈춤' : '목소리로 듣기'}
                  </span>
                </button>

                <button
                  onClick={() => handleCopyComfortMessage(aiResponse.comfortMessage)}
                  className="px-3 py-2 rounded-2xl bg-white border border-amber-200 text-amber-950 hover:bg-amber-50 text-sm flex items-center gap-1.5 transition-all"
                  title="편지 복사하기"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 hidden sm:inline">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ① 감정 위로 편지글 본문 (둥근 손글씨 폰트) */}
            <div className="bg-white/90 p-5 rounded-2xl border border-amber-100 shadow-2xs">
              <p className="text-lg md:text-xl leading-relaxed text-[#4A3B2C] whitespace-pre-line">
                {aiResponse.comfortMessage}
              </p>
            </div>

            {/* ② 내일을 위해 실천할 수 있는 긍정적인 행동 1가지 제안 */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs text-sm">
                🌱
              </div>
              <div className="flex-1">
                <span className="inline-block text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full mb-1">
                  내일을 위한 긍정 행동 제안
                </span>
                <p className="text-base md:text-lg font-bold text-amber-950">
                  {aiResponse.actionItem}
                </p>
                <p className="text-xs md:text-sm text-amber-800/80 mt-1">
                  내일 하루, 가벼운 발걸음으로 이 작은 미션을 실천해 보세요 🐾
                </p>
              </div>
            </div>

            {/* ③ 리트리버가 건넨 작은 선물 아이템 */}
            {aiResponse.retrieverGift && (
              <div className="flex items-center gap-2 text-sm md:text-base text-amber-800 bg-white/80 border border-amber-200/70 px-4 py-2.5 rounded-2xl">
                <Coffee className="w-4 h-4 text-amber-600" />
                <span>인절미가 챙겨준 선물:</span>
                <span className="font-bold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-xl">
                  {aiResponse.retrieverGift}
                </span>
              </div>
            )}

            {/* 하단 버튼: 새 일기 작성 */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-2xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-50 text-base transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>새 일기 작성하기</span>
              </button>
            </div>
          </section>
        )}

        {/* 최근 작성한 일기 프리뷰 섹션 */}
        {diaries.length > 0 && !aiResponse && (
          <section className="bg-white/85 border border-[#EADBCE] rounded-3xl p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-[#45372C] flex items-center gap-2">
                <BookHeart className="w-5 h-5 text-amber-600" />
                <span>최근 기록한 따뜻한 하루들</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="text-sm text-amber-800 hover:text-amber-950 flex items-center gap-0.5"
              >
                <span>모두 보기 ({diaries.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {diaries.slice(0, 2).map((d) => (
                <div
                  key={d.id || d.createdAt}
                  onClick={() => {
                    setSelectedDiary(d);
                    setShowHistoryModal(true);
                  }}
                  className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EADBCE] hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-[#8C7A6B]">{d.date}</span>
                    <span className="text-xs md:text-sm px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                      {d.emotion}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[#483C32] line-clamp-1">
                    {d.title}
                  </h4>
                  <p className="text-sm text-[#7A6A5C] line-clamp-2">
                    {d.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* =====================================================================
          하단 푸터
          ===================================================================== */}
      <footer className="w-full max-w-4xl py-6 px-4 border-t border-[#F0E6D8] text-center text-xs md:text-sm text-[#9E8E81] flex flex-col items-center gap-1.5">
        <p className="flex items-center gap-1 text-sm md:text-base text-[#7D6B5D]">
          <span>따뜻한 하루 일기 & AI 응원</span>
          <span>•</span>
          <span>Made with warmth for your peaceful night</span>
          <span>🐾</span>
        </p>
        <p className="text-xs">
          Google Gemini 3.8 Flash & Firebase Firestore 안전 연동
        </p>
      </footer>

      {/* =====================================================================
          모달 1: 지난 일기 보관함 모달 (History Modal)
          ===================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-[#F0E6D8] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookHeart className="w-5 h-5 text-amber-600" />
                <h3 className="text-2xl font-bold text-amber-950">
                  나의 따뜻한 일기 보관함
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedDiary(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F4ECE0] text-[#69584B] hover:bg-[#E5DACB] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {selectedDiary ? (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setSelectedDiary(null)}
                    className="self-start text-sm text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    ← 목록으로 돌아가기
                  </button>

                  <div className="bg-white border border-[#EADBCE] rounded-2xl p-5 shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#F2EAE0] pb-3">
                      <div>
                        <span className="text-xs md:text-sm text-[#8C7A6B]">
                          {selectedDiary.date} • {selectedDiary.weather}
                        </span>
                        <h4 className="text-lg md:text-xl font-bold text-[#45372C] mt-0.5">
                          {selectedDiary.title}
                        </h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-sm">
                        {selectedDiary.emotion}
                      </span>
                    </div>

                    <div className="text-base text-[#4E4035] leading-relaxed whitespace-pre-line py-2">
                      {selectedDiary.content}
                    </div>

                    {/* AI 위로 메시지 카드 */}
                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-800 mb-1.5">
                        <span>🐾 인절미의 위로 편지</span>
                      </div>
                      <p className="text-base text-[#4A3B2C] leading-relaxed whitespace-pre-line">
                        {selectedDiary.comfortMessage}
                      </p>
                    </div>

                    {/* 내일 실천 행동 체크박스 */}
                    <div
                      onClick={() => toggleActionCompleted(selectedDiary.createdAt)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedDiary.actionCompleted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-[#FCFAF7] border-[#EDE1D1] text-[#69584B] hover:bg-amber-50/70'
                      }`}
                    >
                      {selectedDiary.actionCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 text-sm md:text-base">
                        <span className="font-bold">내일 실천 미션: </span>
                        <span>{selectedDiary.actionItem}</span>
                      </div>
                      {selectedDiary.actionCompleted && (
                        <span className="text-xs md:text-sm font-bold text-emerald-700">
                          실천 완료! 🐾
                        </span>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="flex justify-end pt-2 border-t border-[#F2EAE0]">
                      <button
                        onClick={() =>
                          handleDeleteDiary(selectedDiary.id, selectedDiary.createdAt)
                        }
                        className="text-xs md:text-sm text-rose-600 hover:text-rose-800 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>이 일기 삭제하기</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : diaries.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <span className="text-4xl">📖</span>
                  <p className="text-xl text-[#7A6A5C]">
                    아직 저장된 일기가 없어요.
                  </p>
                  <p className="text-sm text-[#A8988B]">
                    오늘 하루 있었던 일들을 기록하고 인절미의 따뜻한 응원을 받아보세요!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {diaries.map((entry) => (
                    <div
                      key={entry.id || entry.createdAt}
                      onClick={() => setSelectedDiary(entry)}
                      className="p-4 rounded-2xl bg-white border border-[#EADBCE] hover:border-amber-300 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs md:text-sm text-[#8C7A6B]">
                            {entry.date}
                          </span>
                          <span className="text-xs md:text-sm px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                            {entry.emotion}
                          </span>
                          {entry.actionCompleted && (
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              미션완료 ✓
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base md:text-lg text-[#45372C] truncate group-hover:text-amber-900 transition-colors">
                          {entry.title}
                        </h4>
                        <p className="text-sm text-[#7A6A5C] truncate mt-0.5">
                          {entry.content}
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-[#C4B5A5] group-hover:text-amber-600 transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          모달 2: 설정 및 Vercel 배포 가이드 모달 (Guide Modal)
          ===================================================================== */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-[#EADBCE] rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-round-hand">
            {/* 가이드 헤더 */}
            <div className="p-5 border-b border-[#F0E6D8] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-2xl font-bold text-amber-950">
                  환경 변수 & 배포 가이드
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE0] text-[#69584B] hover:bg-[#E5DACB] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 가이드 내용 */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 text-sm md:text-base text-[#4E4035] flex flex-col gap-5 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 className="font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
                  <span>🔥 Firebase 설정 정보</span>
                </h4>
                <p className="text-xs md:text-sm text-amber-900/90 mb-2">
                  요청하신 Firebase 프로젝트(<code>altn-2d4b8</code>)가 성공적으로 초기화되어
                  일기 저장 및 동기화에 사용됩니다. 오프라인이나 네트워크 상태를 고려하여 로컬 스토리지에 동시 백업되어 안전합니다.
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl text-xs font-mono text-amber-950 border border-amber-200/60 overflow-x-auto">
                  projectId: "altn-2d4b8" / authDomain: "altn-2d4b8.firebaseapp.com"
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#3B2C1E] flex items-center gap-1.5 mb-1.5">
                  <span>🔑 Google Gemini API 키 설정</span>
                </h4>
                <p className="text-xs md:text-sm text-[#735F50] mb-2">
                  API 키를 클라이언트 코드에 하드코딩하지 않고, Express 백엔드 서버(<code>server.ts</code>)를 통해
                  안전하게 보호하고 있습니다.
                </p>
                <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#EDE1D1] text-xs font-mono">
                  # .env 파일에 등록:<br />
                  GEMINI_API_KEY="AIzaSy..."
                </div>
              </div>

              <div className="border-t border-[#F0E6D8] pt-4">
                <h4 className="font-bold text-[#3B2C1E] flex items-center gap-1.5 mb-1.5">
                  <span>🚀 Vercel 배포 3단계 가이드</span>
                </h4>
                <ol className="text-xs md:text-sm text-[#735F50] space-y-1.5 list-decimal list-inside">
                  <li>GitHub에 본 프로젝트 코드를 업로드(push)합니다.</li>
                  <li>
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-700 underline font-bold"
                    >
                      Vercel 대시보드
                    </a>
                    에서 "Add New Project"로 저장소를 불러옵니다.
                  </li>
                  <li>
                    <strong>Settings &gt; Environment Variables</strong> 메뉴에서 아래 키를 추가합니다:
                    <ul className="list-disc list-inside ml-4 mt-1 font-mono text-amber-900">
                      <li>Name: GEMINI_API_KEY (또는 VITE_GEMINI_API_KEY)</li>
                      <li>Value: 구글 AI 스튜디오에서 발급받은 API 키</li>
                    </ul>
                  </li>
                  <li>Deploy 버튼을 누르면 나만의 따뜻한 일기 웹앱이 배포됩니다!</li>
                </ol>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold shadow-sm transition-all cursor-pointer"
                >
                  확인했어요, 일기 쓰러 가기 🐾
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
