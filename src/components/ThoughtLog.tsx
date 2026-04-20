"use client"

import { useEffect, useState } from "react"

type ThoughtLog = {
  index_tag: string
  analysis: string
  timestamp: string
}

type Session = {
  date: string
  logs: ThoughtLog[]
}

export default function ThoughtLog({ onClose }: { onClose: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const raw: ThoughtLog[] = JSON.parse(localStorage.getItem("thought-log") || "[]")
    
    // 日付ごとにグループ化
    const grouped: Record<string, ThoughtLog[]> = {}
    raw.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString("ja-JP", {
        year: "numeric", month: "long", day: "numeric"
      })
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(log)
    })

    setSessions(
      Object.entries(grouped).map(([date, logs]) => ({ date, logs })).reverse()
    )
  }, [])

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "380px",
      height: "100vh",
      background: "white",
      boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      animation: "slideIn 0.25s ease"
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* ヘッダー */}
      <div style={{
        padding: "24px",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>思考の軌跡</div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>あなたの思考ストーリー</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#999",
            padding: "4px 8px"
          }}
        >×</button>
      </div>

      {/* ログリスト */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {sessions.length === 0 ? (
          <div style={{ color: "#bbb", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>
            まだ思考ログがありません。<br />対話を始めると記録されます。
          </div>
        ) : (
          sessions.map((session, si) => (
            <div key={si} style={{ marginBottom: "32px" }}>
              {/* 日付 */}
              <div style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#10a37f",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                textTransform: "uppercase"
              }}>
                {session.date}
              </div>

              {/* 思考の流れ */}
              <div style={{ position: "relative" }}>
                {/* 縦線 */}
                <div style={{
                  position: "absolute",
                  left: "7px",
                  top: "8px",
                  bottom: "8px",
                  width: "1px",
                  background: "#e8e8e8"
                }} />

                {session.logs.map((log, li) => (
                  <div key={li} style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "16px",
                    position: "relative"
                  }}>
                    {/* ドット */}
                    <div style={{
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      background: li === session.logs.length - 1 ? "#10a37f" : "white",
                      border: `2px solid ${li === session.logs.length - 1 ? "#10a37f" : "#ddd"}`,
                      flexShrink: 0,
                      marginTop: "3px",
                      zIndex: 1
                    }} />

                    {/* 内容 */}
                    <div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111",
                        marginBottom: "2px"
                      }}>
                        {log.index_tag}
                      </div>
                      {log.analysis && (
                        <div style={{
                          fontSize: "12px",
                          color: "#888",
                          lineHeight: "1.5"
                        }}>
                          {log.analysis}
                        </div>
                      )}
                      <div style={{ fontSize: "10px", color: "#bbb", marginTop: "4px" }}>
                        {new Date(log.timestamp).toLocaleTimeString("ja-JP", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}