"use client"

import { useState, useRef, useEffect } from "react"
import { MindNode } from "@/app/types/node"

type Props = {
  node: MindNode
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>
}

export default function NodeComponent({ node, setNodes }: Props) {
  const [dragging, setDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [editText, setEditText] = useState(node.text)
  const [editDescription, setEditDescription] = useState(node.description || "")
  
  const [isHovered, setIsHovered] = useState(false)
  
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      if (titleRef.current) {
        titleRef.current.focus()
        titleRef.current.style.height = "auto"
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`
        const len = titleRef.current.value.length
        titleRef.current.setSelectionRange(len, len)
      }
      if (descRef.current) {
        descRef.current.style.height = "auto"
        descRef.current.style.height = `${descRef.current.scrollHeight}px`
      }
    }
  }, [isEditing])

  function deleteNode() {
    setNodes(prev => prev.filter(n => n.id !== node.id))
  }

  function handleEditComplete() {
    setIsEditing(false)
    setNodes(prev => prev.map(n => 
      n.id === node.id 
        ? { 
            ...n, 
            text: editText.trim() !== "" ? editText : node.text,
            description: editDescription.trim() !== "" ? editDescription : undefined
          } 
        : n
    ))
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (isEditing) return
    setDragging(true)
  }

  function handleMouseUp() {
    setDragging(false)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || isEditing) return
    setNodes(prev =>
      prev.map(n =>
        n.id === node.id
          ? { ...n, x: e.clientX - 40, y: e.clientY - 20 }
          : n
      )
    )
  }

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onDoubleClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        background: "white",
        padding: "12px 16px",
        borderRadius: "12px",
        border: isEditing ? "1px solid #333" : "1px solid #e2e8f0",
        boxShadow: dragging ? "0 10px 25px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.05)",
        minWidth: "100px",
        cursor: isEditing ? "text" : dragging ? "grabbing" : "grab",
        transition: dragging || isEditing ? "none" : "all 0.2s ease",
        zIndex: dragging || isEditing ? 10 : isHovered ? 5 : 1,
        userSelect: "none"
      }}
    >
      {/* ゴミ箱ボタン */}
      {!isEditing && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={deleteNode}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            background: "white",
            color: "#333",
            border: "1px solid #e2e8f0",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? "auto" : "none",
            transition: "all 0.2s ease"
          }}
          className="delete-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <style jsx>{`
            .delete-btn:hover { background: #f1f5f9 !important; }
          `}</style>
        </button>
      )}

      {isEditing ? (
        // ★ ここが肝！全体を囲むdivにonBlurをつけて、内部移動なら閉じないようにした
        <div 
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              handleEditComplete()
            }
          }}
        >
          {/* タイトル用 */}
          <textarea
            ref={titleRef}
            value={editText}
            onChange={(e) => { setEditText(e.target.value); handleInputResize(e); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditComplete(); }
              e.stopPropagation()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              border: "none", outline: "none", width: "100%", background: "transparent",
              fontSize: "14px", fontWeight: "bold", fontFamily: "inherit", color: "#333",
              resize: "none", overflow: "hidden", padding: 0, margin: 0, display: "block", lineHeight: "1.5"
            }}
            rows={1}
            placeholder="タイトル"
          />
          
          {/* 長文（分析文）用 */}
          <textarea
            ref={descRef}
            value={editDescription}
            onChange={(e) => { setEditDescription(e.target.value); handleInputResize(e); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditComplete(); }
              e.stopPropagation()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              border: "none", outline: "none", width: "100%", background: "transparent",
              fontSize: "11px", fontFamily: "inherit", color: "#666",
              resize: "none", overflow: "hidden", padding: 0, margin: 0, display: "block", 
              lineHeight: "1.5", maxWidth: "180px"
            }}
            rows={1}
            placeholder="メモや文脈を追加..."
          />
        </div>
      ) : (
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
            {node.text}
          </div>
          {node.description && (
            <div style={{ 
              fontSize: "11px", lineHeight: "1.5", color: "#666", 
              marginTop: "6px", maxWidth: "180px", wordBreak: "break-word" 
            }}>
              {node.description}
            </div>
          )}
        </div>
      )}
    </div>
  )
}