/**
 * 따뜻한 하루 일기 & AI 응원 웹앱 - Express 백엔드 서버
 * 
 * Google Gemini API를 서버 사이드에서 안전하게 호출하여 API Key를 보호합니다.
 * 개발 환경에서는 Vite 미들웨어를 마운트하여 HMR 및 빠른 번들링을 제공합니다.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// 환경 변수 로드 (.env 파일이 있는 경우)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// JSON 요청 바디 파서 미들웨어
app.use(express.json({ limit: '10mb' }));

// Gemini API 클라이언트 초기화 (User-Agent: aistudio-build 필수 지정)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('[Gemini API] 경고: GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * POST /api/comfort
 * 일기 내용과 선택한 감정을 전달받아 Gemini 3.8 Flash 모델로 따뜻한 위로와 조언 생성
 */
app.post('/api/comfort', async (req: Request, res: Response): Promise<void> => {
  try {
    const { diaryContent, emotion, date } = req.body;

    if (!diaryContent || typeof diaryContent !== 'string') {
      res.status(400).json({ error: '일기 내용을 입력해 주세요.' });
      return;
    }

    const currentEmotion = emotion || '기쁨';
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // API Key가 없는 경우 친절한 안내 메시지와 함께 데모 응답을 제공하여 앱이 중단되지 않도록 보호
    if (!apiKey) {
      console.warn('[Gemini API] API 키가 없어 다정한 기본 위로 메시지를 반환합니다.');
      res.json({
        comfortMessage: `오늘 하루도 정말 고생 많으셨어요. ${currentEmotion}이라는 감정을 마주하며 하루를 기록한 당신은 참 따뜻하고 멋진 사람이에요. 마음 한켠에 작은 쉼표를 찍고 오늘 밤은 푹 쉬어가기를 진심으로 응원할게요.`,
        actionItem: '잠들기 전 따뜻한 물 한 잔 마시고 내가 좋아하는 음악 1곡 듣기',
        retrieverReaction: '골든 리트리버 인절미가 꼬리를 붕붕 흔들며 따뜻한 솜방망이 젤리로 손등을 톡톡 토닥여줘요!',
        retrieverGift: '바삭하고 고소한 클로버 비스킷',
        isDemo: true,
      });
      return;
    }

    const ai = getGeminiClient();

    // AI에게 부여할 역할(시스템 지침)과 프롬프트 구성
    const systemPrompt = `당신은 '따뜻한 하루 일기'의 다정하고 포근한 골든 리트리버 AI 비서 '인절미(보리)'입니다.
사용자가 오늘 겪은 일과 느낀 감정을 정성껏 읽고, 진심 어린 위로와 깊은 공감을 전해주세요.
말투는 부드럽고 다정한 한국어 경어체(~해요, ~답니다, ~를 보낼게요)를 사용하며,
마치 곁에서 따뜻한 온기를 전해주는 든든한 댕댕이 친구처럼 말해주세요.

반드시 다음 2가지 핵심 요소를 포함하여 JSON 구조로 답변해야 합니다:
1. 사용자의 감정을 다정하고 부드럽게 위로하는 감성 편지글 (사용자의 일기 내용 구체적인 언급 포함)
2. 내일을 위해 부담 없이 가볍게 실천할 수 있는 긍정적인 행동 1가지 제안 (작고 구체적인 행동)`;

    const userPrompt = `[오늘의 날짜]: ${date || new Date().toLocaleDateString('ko-KR')}
[사용자가 느낀 주된 감정]: ${currentEmotion}
[오늘의 일기 내용]:
"""
${diaryContent}
"""

위 일기를 읽고, 사용자의 마음에 온기를 가득 채워주는 위로 편지와 내일을 위한 1가지 긍정 행동 미션을 작성해 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comfortMessage: {
              type: Type.STRING,
              description: '사용자의 감정을 다정하고 부드럽게 위로하며 하루를 칭찬하고 품어주는 3~5문장의 따뜻한 답변',
            },
            actionItem: {
              type: Type.STRING,
              description: '내일을 위해 사용자가 즐겁고 가볍게 실천할 수 있는 긍정적인 행동 1가지 (예: 아침 햇살 보며 기지개 켜기, 나에게 고마운 점 1가지 말해주기)',
            },
            retrieverReaction: {
              type: Type.STRING,
              description: '골든 리트리버 비서 인절미의 귀여운 응원 행동 묘사 (예: 꼬리를 살랑살랑 흔들며 머리를 기대요)',
            },
            retrieverGift: {
              type: Type.STRING,
              description: '리트리버가 당신의 하루를 위해 물어온 소소하고 따뜻한 상상의 선물 (예: 햇살 머금은 네잎클로버, 퐁신퐁신한 털방석)',
            },
          },
          required: ['comfortMessage', 'actionItem', 'retrieverReaction', 'retrieverGift'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API 응답이 비어있습니다.');
    }

    const parsedData = JSON.parse(responseText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error('[/api/comfort Error]:', error);
    res.status(500).json({
      error: '위로 메시지를 작성하는 도중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
      details: error?.message || String(error),
    });
  }
});

// Vite 통합 설정 (개발 모드: Vite dev 미들웨어, 프로덕션: 정적 빌드 서빙)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 [따뜻한 하루 일기] 서버가 포트 ${PORT}에서 실행 중입니다: http://localhost:${PORT}`);
  });
}

startServer();
