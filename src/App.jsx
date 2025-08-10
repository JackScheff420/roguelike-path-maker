import React, { useState } from 'react'
import PathMakerCanvas from './components/PathMakerCanvas'
import Sidebar from './components/Sidebar'

function App() {
  const [levels, setLevels] = useState([
    { id: 0, nodes: [{ id: 'start', x: 100, y: 200, type: 'start', name: 'Start' }] },
    { id: 1, nodes: [] },
    { id: 2, nodes: [] },
    { id: 3, nodes: [] },
    { id: 4, nodes: [{ id: 'end', x: 100, y: 200, type: 'boss', name: 'Boss' }] }
  ])
  
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const addNode = (levelId, nodeType = 'combat') => {
    const level = levels.find(l => l.id === levelId)
    const newNode = {
      id: `node_${Date.now()}`,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      type: nodeType,
      name: `${nodeType} ${level.nodes.length + 1}`
    }
    
    setLevels(levels.map(l => 
      l.id === levelId 
        ? { ...l, nodes: [...l.nodes, newNode] }
        : l
    ))
  }

  const updateNodePosition = (nodeId, x, y) => {
    setLevels(levels.map(level => ({
      ...level,
      nodes: level.nodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    })))
  }

  const handleNodeClick = (node) => {
    if (isConnecting && selectedNode && selectedNode.id !== node.id) {
      // Create connection
      const newConnection = { from: selectedNode.id, to: node.id }
      setConnections([...connections, newConnection])
      setSelectedNode(null)
      setIsConnecting(false)
    } else {
      setSelectedNode(node)
    }
  }

  const exportData = () => {
    const data = { levels, connections }
    console.log('Exported data:', JSON.stringify(data, null, 2))
    alert('Data exported to console!')
  }

  return (
    <div className="flex h-screen bg-stone-900 text-amber-100">
      <Sidebar 
        levels={levels}
        onAddNode={addNode}
        onStartConnection={() => setIsConnecting(true)}
        onExportData={exportData}
        isConnecting={isConnecting}
      />
      <div className="flex-1 relative">
        <PathMakerCanvas
          levels={levels}
          connections={connections}
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
          onNodeDrag={updateNodePosition}
          isConnecting={isConnecting}
        />
      </div>
    </div>
  )
}

export default App
