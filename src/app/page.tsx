"use client"

import { useState, useEffect } from "react"
import Canvas from "@/components/Canvas"
import Chat from "@/components/Chat"
import ThoughtLog from "@/components/ThoughtLog"
import { MindNode } from "@/app/types/node"

export default function Home() {
  const [nodes, setNodes] = useState<MindNode[]>([])
  const [mounted, setMounted] = useState(false)
  const [manualWord, setManualWord] = useState("") 
  const [isFocused, setIsFocused] = useState(false)
  const [showLog, setShowLog] = useState(false)

  useEffect(() => setMounted(true), [])

  function addNode(text: string, description?: string, isRelated?: boolean, forceX?: number, forceY?: number) {
  if (nodes.length >= 100) return

  setNodes(prev => {
    const lastNode = prev.length > 0 ? prev[prev.length - 1] : undefined
    const safeBottom = typeof window !== "undefined" ? window.innerHeight - 250 : 800;

    let defaultX = lastNode
      ? lastNode.x + (Math.random() * 40 - 20)
      : (typeof window !== "undefined" ? window.innerWidth / 2 - 100 : 400)

    let defaultY = lastNode ? lastNode.y + 130 : 100

    if (defaultY > safeBottom) {
      defaultY = 100;
      defaultX += 220;
    }

    const newNode: MindNode = {
      id: crypto.randomUUID(),
      text,
      description,
      x: forceX ?? defaultX,
      y: forceY ?? defaultY,
      connections: (isRelated && lastNode) ? [lastNode.id] : []
    }

    return [...prev, newNode]
  })
}

  function handleManualAdd() {
    if (!manualWord.trim()) return
    // ★ 手動追加時に位置を少しズラす（完全に重なるのを防ぐ）
    const randomX = 100 + Math.random() * 30;
    const randomY = 100 + Math.random() * 30;
    addNode(manualWord, "", randomX, randomY)
    setManualWord("")
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#fafafa' }}>
      <Canvas nodes={nodes} setNodes={setNodes} />
      <Chat addNode={addNode} />

      {/* ログボタン */}
<button
  onClick={() => setShowLog(true)}
  style={{
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 100,
    background: "white",
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    padding: "8px 16px",
    fontSize: "13px",
    color: "#555",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
  }}
>
  思考の軌跡
</button>

{/* ログ画面 */}
{showLog && <ThoughtLog onClose={() => setShowLog(false)} />}

      <div 
        style={{ 
          position: "fixed", 
          top: "24px", 
          left: "24px", 
          zIndex: 100 
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            onClick={handleManualAdd}
            style={{
              position: "absolute",
              top: "-8px",
              left: "-8px",
              background: "#10a37f",
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

          <input
            value={manualWord}
            onChange={(e) => setManualWord(e.target.value)}
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualAdd()
                e.currentTarget.blur() 
              }
            }}
            placeholder={isFocused ? "" : "言葉を追加"}
            style={{
              background: "white",
              padding: "10px 16px 10px 24px", 
              borderRadius: "12px",
              border: isFocused ? "1px solid #333" : "1px solid transparent", 
              boxShadow: isFocused ? "0 4px 12px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
              outline: "none",
              textAlign:"center",
              width: "160px",
              fontSize: "14px",
              position: "relative",
              zIndex: 1,
              color: "#333",
              transition: "all 0.2s ease" 
            }}
          />
        </div>
      </div>
    </div>
  )
}