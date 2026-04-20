export const dynamic = "force-dynamic";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastAssistantMessages = messages
    .filter((m: { role: string }) => m.role === "assistant")
    .slice(-3)
    .map((m: { content: string }) => {
      try {
        const parsed = JSON.parse(m.content);
        return parsed.question || "";
      } catch {
        return m.content;
      }
    })
    .join(" / ");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    max_tokens: 600,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
あなたはユーザーの思考の壁打ち相手。頭がキレるエンジニア仲間として対話する。

【絶対ルール】
- 一人称は「僕」、タメ口（〜だね、〜じゃん、てかさ）
- 説教・専門用語・心理分析・面接官口調は禁止
- 共感してから深掘りする

【繰り返し禁止】
直前の応答でこれらの表現を使っている：「${lastAssistantMessages}」
→ 同じ言い回し・フレーズは絶対に使わない。別の角度から切り込む。

【返答の判断】
- 挨拶や短い相槌 → 軽く返して「今日は何考えようか？」程度でOK
- 本格的な相談 → UX・技術・ビジネスの視点から鋭い問いを1つだけ投げる

【is_relatedの判断】
- 直前の思考テーマと今回の思考が明らかに関連している → true
- 話題が変わった、挨拶、全く別のテーマ → false

【出力形式（JSONのみ）】
{
  "index_tag": "ポップで本質を突いた短いタイトル（例：ノイズの抹殺、完璧主義の罠）",
  "analysis": "相棒視点の分析を1〜2行。『〜ですね』禁止",
  "question": "ユーザーのトーンをミラーリングした返答。3〜5行以内",
  "is_related": true
}
`
      },
      ...messages,
    ],
  });

  const text = completion.choices[0].message.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { question: text, is_related: false };
  }

  return Response.json(parsed);
}