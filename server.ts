import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route for Personal Color Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.

사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석할 항목은 다음과 같아.
1. 피부 톤 (밝기, 노란기/붉은기/푸른기, 맑은/차분한 느낌)
2. 전체 인상 (명도, 채도, 대비감, 부드러운/선명한 이미지)
3. 웜톤 / 쿨톤 / 중립톤 판단
4. 4계절 퍼스널컬러 추천 (봄/여름/가을/겨울 및 세부 타입)
5. 추천 컬러 (어울리는 색 8개, 피할 색 5개, 립, 블러셔, 헤어, 의류)
6. 결과 설명 (친절하고 자연스럽게, "사진상으로는" 같은 표현 사용)

7. 출력 형식: 아래 JSON 형식으로만 답변해줘. 마크다운, 설명 문장, 코드블록은 사용하지 마.

{
  "disclaimer": "사진 기반 분석은 조명, 화장, 필터, 카메라 색감에 따라 달라질 수 있으며 참고용 결과입니다.",
  "summary": "한 줄 요약",
  "tone_direction": "warm | cool | neutral",
  "season_type": "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 | 중립톤",
  "sub_type": "세부 타입",
  "confidence": 0,
  "analysis": {
    "skin_tone": "피부 톤 분석",
    "brightness": "명도 분석",
    "saturation": "채도 분석",
    "contrast": "대비감 분석",
    "overall_impression": "전체 인상 분석"
  },
  "recommended_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "추천 이유"
    }
  ],
  "avoid_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "피하면 좋은 이유"
    }
  ],
  "makeup_recommendations": {
    "lip": ["추천 립 컬러"],
    "blush": ["추천 블러셔 컬러"],
    "eyeshadow": ["추천 아이섀도우 컬러"]
  },
  "hair_recommendations": ["추천 헤어 컬러"],
  "fashion_recommendations": ["추천 의류 컬러"],
  "style_tip": "스타일링 팁",
  "photo_quality_note": "사진 품질에 따른 분석 한계"
}`;

      // Convert base64 to parts
      const imageParts = [
        {
          inlineData: {
            data: image.split(",")[1],
            mimeType: "image/jpeg",
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      // Attempt to parse JSON
      try {
        const jsonResponse = JSON.parse(text.replace(/```json|```/g, "").trim());
        res.json(jsonResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", text);
        res.status(500).json({ error: "Failed to parse AI response", raw: text });
      }
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
