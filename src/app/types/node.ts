export type MindNode = {
  id: string
  text: string
  description?: string
  x: number
  y: number
  connections: string[] // 接続先のidリスト
}