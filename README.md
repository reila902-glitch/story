# 🐾 따뜻한 하루 일기 & AI 응원 (Warm Daily Diary)

> 오늘 하루를 돌아보고, 다정한 골든 리트리버 AI 비서 '인절미'에게 따뜻한 위로와 내일을 위한 활력 조언을 받는 감성 힐링 다이어리 웹앱입니다.

![따뜻한 하루 일기 미리보기](/public/images/retriever_joy.jpg)

---

## 🌟 주요 기능

1. **감성 일기 작성 & 4대 감정 선택**
   - 오늘 하루의 기분(기쁨 ☀️, 지침 🌙, 설렘 🌸, 불안 🌧️)과 날씨 스티커 선택
   - 아기자기한 줄노트 페이퍼 질감과 둥글둥글 따뜻한 감성 손글씨 폰트 (`Gamja Flower`)
2. **골든 리트리버 '인절미' 동화 수채화 일러스트**
   - 유치하지 않고 부드러운 인디 동화책 감성의 고품질 수채화 일러스트
   - 감정에 따라 변화하는 4가지 표정과 소품, 꼬리 흔들기 및 쓰다듬기 인터랙션
3. **Google Gemini 3.8 Flash AI 응원 & 긍정 행동 미션**
   - 사용자가 작성한 일기를 정성껏 읽고 공감해 주는 다정한 위로 편지
   - 내일을 위해 가볍게 실천할 수 있는 긍정 행동 1가지 제안 & 실천 체크 기능
   - 댕댕이가 물어온 소소한 선물 아이템 (네잎클로버 쿠키, 둥굴레 온차 등)
4. **Firebase Firestore & LocalStorage 이중 동기화**
   - 작성한 일기는 클라우드(Firestore)와 브라우저 로컬 저장소에 안전하게 자동 저장
   - 오프라인 환경에서도 일기가 유실되지 않고 안전하게 보관
5. **힐링 사운드 & 음성 읽기 (TTS)**
   - Web Audio API 기반의 편안한 빗소리 백색소음 On/Off 기능
   - 위로 편지를 다정한 목소리로 낭독해 주는 브라우저 음성 지원

---

## 🚀 GitHub 업로드 및 Vercel 배포 가이드

### 1단계: GitHub 저장소에 코드 올리기

터미널(또는 VS Code)에서 아래 명령어를 순서대로 실행합니다:

```bash
# 1. 깃 초기화 및 파일 추가
git init
git add .

# 2. 커밋 생성
git commit -m "feat: 따뜻한 하루 일기 & AI 응원 웹앱 초기 버전"

# 3. 본인의 GitHub 원격 저장소 연결 (username과 repo-name을 본인 것으로 변경)
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/warm-daily-diary.git

# 4. 푸시
git push -u origin main
```

---

### 2단계: Vercel에서 1분 만에 배포하기

1. **[Vercel 공식 홈페이지](https://vercel.com)**에 로그인합니다.
2. 대시보드 우측 상단의 **[Add New...]** > **[Project]** 버튼을 클릭합니다.
3. 방금 푸시한 **`warm-daily-diary`** GitHub 저장소를 찾아서 **[Import]**를 클릭합니다.
4. **Environment Variables (환경 변수)** 섹션을 열고 다음 값을 추가합니다:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Google AI Studio에서 무료로 발급받은 API 키 ([발급 링크](https://aistudio.google.com/app/apikey))
   > *(선택 사항: 클라이언트 직접 연동 시 `VITE_GEMINI_API_KEY`도 동일한 값으로 추가할 수 있습니다)*
5. **[Deploy]** 버튼을 누르면 1~2분 내에 전 세계 어디서든 접속 가능한 나만의 웹앱이 완성됩니다! 🎉

---

## 🛠️ 기술 스택 및 구조

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **AI Model**: Google Gemini (`gemini-3.8-flash`) via `@google/genai`
- **Backend / Serverless**:
  - 로컬 개발: Express (`server.ts`)
  - Vercel 배포: Vercel Serverless Function (`api/comfort.ts`)
- **Database**: Firebase Firestore (`altn-2d4b8`) + LocalStorage
- **Deployment**: Vercel (`vercel.json` 내장)

```
.
├── api/
│   └── comfort.ts          # Vercel Serverless API (Gemini 키 보안 보호)
├── public/
│   └── images/             # 골든 리트리버 동화 일러스트 에셋
├── src/
│   ├── App.tsx             # 메인 리액트 컴포넌트
│   ├── index.css           # 둥근 손글씨 폰트 및 줄노트 스타일
│   └── main.tsx
├── server.ts               # 로컬 / Full-stack 환경용 Express 서버
├── vercel.json             # Vercel 배포 및 API 라우팅 설정
└── package.json
```

---

## 🔑 환경 변수 (.env) 설정 안내

로컬에서 테스트하려면 프로젝트 루트에 `.env` 파일을 만들고 아래와 같이 입력하세요:

```env
# Google Gemini API 키 (필수)
GEMINI_API_KEY="AIzaSy..."

# 프론트엔드 직접 연동용 (선택)
VITE_GEMINI_API_KEY="AIzaSy..."
```

---

## 📄 라이선스
MIT License. 편안하고 따뜻한 밤 되세요 🐾
