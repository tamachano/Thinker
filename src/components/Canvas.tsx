"use client"

import NodeComponent from "./Node"
import { MindNode } from "@/app/types/node"

type Props = {
  nodes: MindNode[]
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>
}

export default function Canvas({ nodes, setNodes }: Props) {
  return (
    <div
      style={{
        position: "relative",
        height: "80vh",
        background: "#f5f5f5"
      }}
    >

      {nodes.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#888",
            textAlign: "center"
          }}
        >
          対話で生まれた要素は<br />
          クリックして動かせます。<br />（Wクリックで編集可）<br />
        </div>
        
      )}

      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          setNodes={setNodes}
        />
      ))}

    </div>
  )
}