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
      3. 가능하면 '맛집', '카페', '명소', '전시회', '공원' 등 카테고리가 명시된 구체적인 단어를 선택하세요.
      4. 지역명(예: 강남역, 홍대)은 포함하지 마세요. 중간 지점 좌표를 기준으로 검색할 것이기 때문입니다.
      5. 검색어는 최대 2~3단어로 구성하세요.
    `;

    const modelName = "models/gemini-1.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{ text: systemPrompt }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent keyword extraction
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 64, // We only need a short keyword
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
      
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await apiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up text (remove quotes, extra whitespace, newlines)
    text = text.replace(/["']/g, "").trim();

    if (!text) {
      throw new Error("AI로부터 응답을 받지 못했습니다.");
    }

    console.log(`AI Recommendation Success with model: ${modelName}, keyword: ${text}`);
    return NextResponse.json({ keywords: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown AI Error";
    console.error("DEBUG - AI Recommendation Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
