"use client"

import { useState } from "react"
import NodeComponent from "./Node"
import { MindNode } from "@/app/types/node"

type Props = {
  nodes: MindNode[]
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>
}

const CARD_WIDTH = 212

export default function Canvas({ nodes, setNodes }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null) // 接続元のid

  // 全接続ペアを収集（重複排除）
  const edges = new Set<string>()
  const edgePairs: { from: MindNode; to: MindNode }[] = []

  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      const key = [node.id, targetId].sort().join("-")
      if (!edges.has(key)) {
        edges.add(key)
        const target = nodes.find(n => n.id === targetId)
        if (target) edgePairs.push({ from: node, to: target })
      }
    })
  })

  function handleNodeConnectStart(id: string) {
    setConnecting(id)
  }

  function handleNodeConnectEnd(id: string) {
    if (!connecting || connecting === id) {
      setConnecting(null)
      return
    }
    // 接続を追加
    setNodes(prev => prev.map(n => {
      if (n.id === connecting) {
        if (n.connections.includes(id)) return n // すでに接続済み
        return { ...n, connections: [...n.connections, id] }
      }
      return n
    }))
    setConnecting(null)
  }

  return (
    <div
      style={{ position: "relative", height: "100vh", background: "#f5f5f5", cursor: connecting ? "crosshair" : "default" }}
      onClick={() => setConnecting(null)} // キャンバスクリックでキャンセル
    >
      {nodes.length === 0 && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#888", textAlign: "center", pointerEvents: "none" }}>
          対話で生まれた要素は<br />クリックして動かせます。<br />（Wクリックで編集可）
        </div>
      )}

      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        {edgePairs.map((edge, i) => {
          const x1 = edge.from.x + CARD_WIDTH / 2
          const y1 = edge.from.y + 40
          const x2 = edge.to.x + CARD_WIDTH / 2
          const y2 = edge.to.y + 40
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="#10a37f"
              strokeWidth="1"
              opacity="0.3"
            />
          )
        })}
      </svg>

      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          setNodes={setNodes}
          isConnecting={connecting !== null}
          isConnectingFrom={connecting === node.id}
          onConnectStart={handleNodeConnectStart}
          onConnectEnd={handleNodeConnectEnd}
        />
      ))}

      {/* 接続モード中の案内 */}
      {connecting && (
        <div style={{ position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)", background: "#111", color: "white", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", zIndex: 200, pointerEvents: "none" }}>
          接続先のカードをクリック　　ESCでキャンセル
        </div>
      )}
    </div>
  )
}