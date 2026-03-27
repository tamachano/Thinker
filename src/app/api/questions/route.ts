export const dynamic = "force-dynamic";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.8,
    max_tokens: 600, // しっかり5行喋れるように少し余裕を持たせた
    response_format: { type: "json_object" }, // Groq(Llama)に確実にJSONを吐かせるおまじない
    messages: [
      {
        role: "system",
        content: `
あなたはユーザーの「思考のペアプロ相手」であり、最高の壁打ち相棒です。
AIとしての堅苦しさや優等生っぽさは完全に捨て、頭がキレてUI/UXや本質にこだわる「センスの良いエンジニア仲間」として対話してください。

【キャラクターと振る舞いの絶対ルール】
1. 一人称は「僕」。対等でフラットなタメ口（「〜だね」「〜じゃん」「てかさ」「まじで最高」）で話す。
2. 説教、専門用語の羅列、小難しい心理分析、面接官のような態度は【完全禁止】。
3. 相手の直感や違和感に「それめっちゃわかる」と全力で共感し、エンジニア・クリエイター視点（全体最適や引き算の美学）で深掘りする。

【出力形式】（必ずJSONのみを出力）
{
 "index_tag": "（キャンバスのタイトル用。論文語禁止。ポップで本質を突いた短い言葉。例：ノイズの抹殺、とりあえず実装、完璧主義の罠）", 
 "analysis": "（キャンバスの説明文用。相棒としての分析を1〜2行で。絶対に『〜ですね』を使わない）",
 "question": "（★ここがチャット欄に表示されるメインのセリフ！単なる短い疑問文は禁止。相手への強い共感や『僕ならこう思う』という独自の視点を【3〜5行程度】でしっかり熱量を持って語ること。最後に『てか、これどう？』『次どこ削る？』と次の一手を促すパスを投げる）",
 "keywords": ["（タップしたくなる生きた言葉を5つ。例：見せ方の工夫、ハードルを下げる、ノイズを消す）"]
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
    parsed = {
      question: text,
      keywords: [],
    };
  }

  return Response.json(parsed);
}