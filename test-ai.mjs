/**
 * AI(Gemini) 연결 및 이미지 생성 테스트 스크립트
 * 실행: GEMINI_API_KEY=your_key node test-ai.mjs
 * 또는 .env 파일에 GEMINI_API_KEY 설정 후: node test-ai.mjs
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY가 없습니다. .env 파일에 넣거나 환경변수로 설정하세요.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testModelsList() {
  console.log('\n--- 1. API 키 검증 (models.list) ---');
  try {
    const models = await ai.models.list();
    console.log('✅ API 키 유효. 사용 가능한 모델 수:', models.length);
    const imageModels = models.filter(m => m.name && (m.name.includes('flash-image') || m.name.includes('imagen')));
    if (imageModels.length) {
      console.log('   이미지 관련 모델:', imageModels.map(m => m.name).join(', '));
    }
    return true;
  } catch (err) {
    console.error('❌ API 키 검증 실패:', err.message);
    return false;
  }
}

async function testTextGeneration() {
  console.log('\n--- 2. 텍스트 생성 (gemini-2.5-flash) ---');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'Say "Hello from Creon" in one short sentence.' }] },
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log('✅ 텍스트 생성 성공:', text.trim());
      return true;
    }
    console.log('⚠️ 응답에 텍스트 없음:', JSON.stringify(response).slice(0, 200));
    return false;
  } catch (err) {
    console.error('❌ 텍스트 생성 실패:', err.message);
    return false;
  }
}

async function testImageGeneration() {
  console.log('\n--- 3. 이미지 생성 (gemini-2.5-flash-image) ---');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: 'A simple red circle on a white background, minimalist style.' }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        temperature: 1,
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const inlineData = part?.inlineData;

    if (inlineData?.data && inlineData?.mimeType) {
      console.log('✅ 이미지 생성 성공 (mimeType:', inlineData.mimeType, ', 데이터 길이:', inlineData.data.length, ')');
      return true;
    }

    const blockReason = candidate?.finishReason || response.promptFeedback?.blockReason;
    if (blockReason) {
      console.log('⚠️ 이미지 생성이 차단됨. finishReason:', blockReason);
    } else {
      console.log('⚠️ 응답에 이미지 없음. 응답 구조:', JSON.stringify(response).slice(0, 300));
    }
    return false;
  } catch (err) {
    console.error('❌ 이미지 생성 실패:', err.message);
    if (err.message?.includes('404') || err.message?.includes('NOT_FOUND')) {
      console.log('   → gemini-2.5-flash-image 모델을 찾을 수 없습니다. API 버전/리전을 확인하세요.');
    }
    return false;
  }
}

async function main() {
  console.log('Creon AI 테스트 시작 (Gemini API)\n');

  const ok1 = await testModelsList();
  const ok2 = await testTextGeneration();
  const ok3 = await testImageGeneration();

  console.log('\n--- 결과 요약 ---');
  console.log('API 키 검증:', ok1 ? '✅' : '❌');
  console.log('텍스트 생성:', ok2 ? '✅' : '❌');
  console.log('이미지 생성:', ok3 ? '✅' : '❌');

  if (ok1 && ok2 && ok3) {
    console.log('\n✅ AI 테스트 모두 성공. 앱에서 로그인 후 API Key를 저장하면 이미지 생성이 동작해야 합니다.');
  } else if (ok1 && ok2 && !ok3) {
    console.log('\n⚠️ API/텍스트는 정상이나 이미지 생성만 실패. 모델명(gemini-2.5-flash-image) 또는 할당량을 확인하세요.');
  } else if (!ok1) {
    console.log('\n❌ API 키가 잘못되었거나 네트워크 문제일 수 있습니다. .env의 GEMINI_API_KEY를 확인하세요.');
  }

  process.exit(ok1 && ok2 && ok3 ? 0 : 1);
}

main();
