// page.tsx の全体像

"use client"

import { useState, useEffect } from "react"
import Canvas from "@/components/Canvas"
import Chat from "@/components/Chat"
import { MindNode } from "@/app/types/node"

export default function Home() {
  const [nodes, setNodes] = useState<MindNode[]>([])
  const [mounted, setMounted] = useState(false)
  const [manualWord, setManualWord] = useState("") // 手動追加用のState
  const [isFocused, setIsFocused] = useState(false)

  
  useEffect(() => setMounted(true), [])

  // page.tsx の addNode 部分
// 修正版 addNode（スマートな折り返し配置ロジック）
  function addNode(text: string, description?: string, forceX?: number, forceY?: number) {
    if (nodes.length >= 30) return

    setNodes(prev => {
      if (prev.length > 0 && prev[prev.length - 1].text === text) return prev

      const lastNode = prev[prev.length - 1]
      
      // 画面の高さから、チャットUIが占める下部エリア（約250px）を引いた安全領域
      const safeBottom = typeof window !== "undefined" ? window.innerHeight - 250 : 800;
      
      let defaultX = lastNode 
        ? lastNode.x + (Math.random() * 40 - 20) // 少しだけ左右に散らす
        : (typeof window !== "undefined" ? window.innerWidth / 2 - 100 : 400)
      
      let defaultY = lastNode ? lastNode.y + 130 : 100

      // ★ここが肝！ チャットエリアに被りそうになったら、右上に折り返す
      if (defaultY > safeBottom) {
        defaultY = 100; // 高さを一番上に戻す
        defaultX += 220; // カード1枚分（約220px）右にズラす
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          text,
          description,
          x: forceX ?? defaultX,
          y: forceY ?? defaultY
        }
      ]
    })
  }

// 左上の手動追加も、引数の数に合わせて修正（descriptionを空で渡す）
function handleManualAdd() {
  if (!manualWord.trim()) return
  addNode(manualWord, "", 100, 100)
  setManualWord("")
}

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#fafafa' }}>
      <Canvas nodes={nodes} setNodes={setNodes} />
      <Chat addNode={addNode} />

      {/* ここから：左上の「手動追加」吹き出しUI */}
      <div 
        style={{ 
          position: "fixed", 
          top: "24px", 
          left: "24px", 
          zIndex: 100 
        }}
      >
        <div style={{ position: "relative" }}>
          {/* 左上の緑の＋ボタン */}
          <button
            onClick={handleManualAdd}
            style={{
              position: "absolute",
              top: "-8px",
              left: "-8px",
              background: "#10a37f", // Chatの送信ボタンと同じ緑
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              zIndex: 2,
              fontWeight: "bold"
            }}
          >
            ＋
          </button>

          {/* 吹き出し型の入力フォーム */}
          <input
            value={manualWord}
            onChange={(e) => setManualWord(e.target.value)}
            onFocus={() => setIsFocused(true)}   // ✅ クリックされたらフォーカスON
            onBlur={() => setIsFocused(false)}   // ✅ 外れたらフォーカスOFF
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualAdd()
                e.currentTarget.blur() // Enter押したらフォーカスを外す（枠線を消す）
              }
            }}
            placeholder={isFocused ? "" : "言葉を追加"} // ✅ フォーカス中は文字を消す
            style={{
              background: "white",
              padding: "10px 16px 10px 24px", // 左側の余白を少し広げて＋ボタンとのバランス調整
              borderRadius: "12px",
              // ✅ キャンバスのノード編集時と同じ枠線のロジック
              border: isFocused ? "1px solid #333" : "1px solid transparent", 
              // ✅ フォーカス時は少し影を濃くして「浮き上がった感」を出す
              boxShadow: isFocused ? "0 4px 12px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
              outline: "none",
              textAlign:"center",
              width: "160px",
              fontSize: "14px",
              position: "relative",
              zIndex: 1,
              color: "#333",
              // ✅ 枠線と影の変化をフワッとさせる
              transition: "all 0.2s ease" 
            }}
          />
        </div>
      </div>
      {/* ここまで */}

    </div>
  )
}