import React, { useRef, useEffect } from 'react'
import { Stage, Layer, Circle, Line, Text, Rect } from 'react-konva'

const PathMakerCanvas = ({ 
  levels, 
  connections, 
  selectedNode, 
  onNodeClick, 
  onNodeDrag, 
  isConnecting 
}) => {
  const stageRef = useRef()
  const canvasWidth = 800
  const canvasHeight = 600
  const levelWidth = canvasWidth / levels.length
  
  // Get node color based on type
  const getNodeColor = (type) => {
    const colors = {
      start: '#10b981',    // emerald
      boss: '#dc2626',     // red
      combat: '#ef4444',   // red
      treasure: '#eab308', // yellow
      shop: '#3b82f6',     // blue
      elite: '#8b5cf6',    // purple
      event: '#22c55e'     // green
    }
    return colors[type] || '#6b7280'
  }

  // Calculate position within level
  const getNodeScreenPosition = (levelIndex, node) => {
    const levelX = levelIndex * levelWidth + levelWidth / 2
    const nodeX = levelX + (node.x - 100) * 2 // Scale from 0-200 to level width
    const nodeY = 100 + (node.y / 200) * (canvasHeight - 200) // Scale to canvas height
    return { x: nodeX, y: nodeY }
  }

  // Get all nodes with their positions for connection drawing
  const getAllNodes = () => {
    const allNodes = []
    levels.forEach((level, levelIndex) => {
      level.nodes.forEach(node => {
        const pos = getNodeScreenPosition(levelIndex, node)
        allNodes.push({ ...node, screenX: pos.x, screenY: pos.y })
      })
    })
    return allNodes
  }

  const allNodes = getAllNodes()

  // Draw connections
  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromNode = allNodes.find(n => n.id === connection.from)
      const toNode = allNodes.find(n => n.id === connection.to)
      
      if (!fromNode || !toNode) return null

      return (
        <Line
          key={index}
          points={[fromNode.screenX, fromNode.screenY, toNode.screenX, toNode.screenY]}
          stroke="#78716c"
          strokeWidth={3}
          opacity={0.7}
        />
      )
    })
  }

  // Render level backgrounds
  const renderLevelBackgrounds = () => {
    return levels.map((level, index) => (
      <Rect
        key={level.id}
        x={index * levelWidth}
        y={0}
        width={levelWidth}
        height={canvasHeight}
        fill={index % 2 === 0 ? '#1c1917' : '#292524'}
        opacity={0.3}
      />
    ))
  }

  // Render level labels
  const renderLevelLabels = () => {
    return levels.map((level, index) => (
      <Text
        key={`label-${level.id}`}
        x={index * levelWidth + 10}
        y={10}
        text={`Level ${index + 1}`}
        fontSize={16}
        fill="#f59e0b"
        fontStyle="bold"
      />
    ))
  }

  // Render nodes
  const renderNodes = () => {
    return levels.map((level, levelIndex) =>
      level.nodes.map(node => {
        const pos = getNodeScreenPosition(levelIndex, node)
        const isSelected = selectedNode && selectedNode.id === node.id
        
        return (
          <React.Fragment key={node.id}>
            <Circle
              x={pos.x}
              y={pos.y}
              radius={isSelected ? 25 : 20}
              fill={getNodeColor(node.type)}
              stroke={isSelected ? '#fbbf24' : '#44403c'}
              strokeWidth={isSelected ? 3 : 2}
              draggable
              onClick={() => onNodeClick(node)}
              onDragEnd={(e) => {
                const newX = ((e.target.x() - levelIndex * levelWidth - levelWidth / 2) / 2) + 100
                const newY = ((e.target.y() - 100) / (canvasHeight - 200)) * 200
                onNodeDrag(node.id, Math.max(0, Math.min(200, newX)), Math.max(0, Math.min(200, newY)))
              }}
              shadowColor="black"
              shadowBlur={5}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.3}
            />
            <Text
              x={pos.x}
              y={pos.y + 30}
              text={node.name}
              fontSize={12}
              fill="#f5f5f4"
              align="center"
              width={100}
              offsetX={50}
            />
          </React.Fragment>
        )
      })
    )
  }

  return (
    <div className="w-full h-full bg-stone-900 relative flex items-center justify-center">
      <div className="absolute top-4 right-4 text-stone-400 text-sm z-10">
        {isConnecting && 'Click two nodes to connect them'}
        <div className="text-xs">Canvas: {canvasWidth}x{canvasHeight}</div>
        <div className="text-xs">Nodes: {allNodes.length}</div>
      </div>
      
      <div className="border-2 border-stone-700 bg-stone-800">
        <Stage width={canvasWidth} height={canvasHeight} ref={stageRef}>
          <Layer>
            {renderLevelBackgrounds()}
            {renderLevelLabels()}
            {renderConnections()}
            {renderNodes()}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default PathMakerCanvas