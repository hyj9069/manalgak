import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    const systemPrompt = `
      사용자의 요청에 따라 카카오 맵 검색에 사용할 최적의 검색 키워드 하나를 추출해주는 전문가입니다.
      사용자의 요청: "${prompt}"
      
      규칙:
      1. 카카오맵 검색창에 입력했을 때 가장 검색 결과가 풍부하게 나올만한 단일 키워드 하나만 출력하세요.
      2. 부연 설명 없이 검색어만 출력하세요. (예: 분위기 좋은 레스토랑, 전망 좋은 카페)
      3. 가능하면 '맛집', '카페', '명소' 등 카테고리가 포함된 명확한 단어를 선택하세요.
    `;

    // Use the most stable model found in the user's list
    const modelName = "models/gemini-flash-latest"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{ text: systemPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      const errorMessage = errorData.error?.message || JSON.stringify(errorData);
      
      // Keep it simple but informative
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await apiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      throw new Error("AI로부터 응답을 받지 못했습니다.");
    }

    console.log(`AI Recommendation Success via Pure Fetch with model: ${modelName}`);
    return NextResponse.json({ keywords: text });
  } catch (error: any) {
    console.error("DEBUG - AI Recommendation Error:", error);
    return NextResponse.json({ error: error.message || "Unknown AI Error" }, { status: 500 });
  }
}
