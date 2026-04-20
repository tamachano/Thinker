"use client"

import { useState } from "react"
import { MindNode } from "@/app/types/node"

type Props = {
  addNode: (text: string, description?: string, isRelated?: boolean) => void
}

type ThoughtLog = {
  index_tag: string
  analysis: string
  timestamp: string
}

const saveToLog = (data: { index_tag?: string; analysis?: string }) => {
  if (!data.index_tag) return;
  const existing: ThoughtLog[] = JSON.parse(localStorage.getItem("thought-log") || "[]");
  existing.push({
    index_tag: data.index_tag,
    analysis: data.analysis || "",
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem("thought-log", JSON.stringify(existing));
};

export default function Chat({ addNode }: Props) {
  const [text, setText] = useState("")
  const [question, setQuestion] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    const currentText = text
    setText("")

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `ユーザーの思考:\n${currentText}\nこの思考の背後にある心理や概念を抽象化してください。` }]
        })
      })

      const data = await res.json()
      saveToLog(data)
      setQuestion(data.question || "")
      setKeywords(data.keywords || [])

      const coreConcept = data.index_tag || (data.keywords && data.keywords[0]);
      if (coreConcept && coreConcept !== currentText) {
        setTimeout(() => {
          addNode(coreConcept, data.analysis, data.is_related)
        }, 500);
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function selectKeyword(k: string) {
    if (loading) return
    setLoading(true)
    addNode(k, undefined, false) // キーワードは関連なしで追加

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `選ばれた概念:\n${k}\nこの概念をさらに抽象化し、思考を広げる概念を5つ生成してください。` }]
        })
      })

      const data = await res.json()
      saveToLog(data)
      setQuestion(data.question || "")
      setKeywords(data.keywords || [])

      const coreConcept = data.index_tag || (data.keywords && data.keywords[0]);
      if (coreConcept && coreConcept !== k) {
        setTimeout(() => {
          addNode(coreConcept, data.analysis, data.is_related)
        }, 500);
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", width: "600px", maxWidth: "90%", zIndex: 100 }}>
      {question && (
        <div style={{ marginBottom: "10px", color: "#333", fontSize: "16px", background: "white", padding: "10px", borderRadius: "10px", border: "1px solid #ddd" }}>
          {question}
        </div>
      )}
      {keywords.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
            {keywords.map((k, i) => (
              <span key={i} onClick={() => selectKeyword(k)} style={{ background: "#f1f1f1", border: "1px solid #ddd", padding: "6px 10px", borderRadius: "16px", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", background: "white", border: "1px solid #ddd", borderRadius: "24px", padding: "8px 12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="いま何を感じていますか？" disabled={loading} style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", padding: "8px", background: "transparent" }} />
        <button type="submit" disabled={loading} style={{ background: loading ? "#ccc" : "#10a37f", border: "none", color: "white", borderRadius: "50%", width: "36px", height: "36px", cursor: loading ? "not-allowed" : "pointer", fontSize: "16px", transition: "background 0.2s" }}>↑</button>
      </form>
    </div>
  )
}