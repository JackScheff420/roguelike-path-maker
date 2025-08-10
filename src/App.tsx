import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Circle, Line, Text } from 'react-konva';
import { 
  Shield as Swords, 
  LocalFireDepartment as SwordRose,
  LocalHotel as Camping,
  MonetizationOn as MoneyBag,
  Diamond,
  HelpOutline as QuestionMark,
  LinearScale as LineIcon
} from '@mui/icons-material';
import './App.css';

// Node types and their configurations
const nodeTypes = {
  combat: { 
    color: '#8B0000', // Dark red
    icon: Swords, 
    label: 'Combat' 
  },
  boss: { 
    color: '#4A0E0E', // Darker red
    icon: SwordRose, 
    label: 'Boss Fight' 
  },
  camp: { 
    color: '#228B22', // Forest green
    icon: Camping, 
    label: 'Rest Site' 
  },
  merchant: { 
    color: '#4169E1', // Royal blue
    icon: MoneyBag, 
    label: 'Merchant' 
  },
  treasure: { 
    color: '#B8860B', // Dark gold
    icon: Diamond, 
    label: 'Treasure' 
  },
  random: { 
    color: '#6A0DAD', // Purple
    icon: QuestionMark, 
    label: 'Random Event' 
  }
};

interface Node {
  id: string;
  x: number;
  y: number;
  type: keyof typeof nodeTypes;
  layer: number;
}

interface Connection {
  from: string;
  to: string;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    // Start node
    { id: 'start', x: 400, y: 550, type: 'combat', layer: 0 }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'line'>('select');
  const [selectedNodeType, setSelectedNodeType] = useState<keyof typeof nodeTypes>('combat');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [layers] = useState(7); // Number of layers
  const stageRef = useRef<any>(null);

  const layerHeight = 70;
  const startY = 500;

  const addNode = (layerIndex: number) => {
    const layerY = startY - (layerIndex * layerHeight);
    const nodesInLayer = nodes.filter(n => n.layer === layerIndex);
    const baseX = 200 + (nodesInLayer.length * 150);
    
    const newNode: Node = {
      id: `node_${Date.now()}`,
      x: baseX,
      y: layerY,
      type: selectedNodeType,
      layer: layerIndex
    };
    
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    if (selectedTool === 'line') {
      if (!connectingFrom) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        // Create connection
        const newConnection: Connection = {
          from: connectingFrom,
          to: nodeId
        };
        setConnections([...connections, newConnection]);
        setConnectingFrom(null);
      }
    }
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = getNodeById(conn.from);
      const toNode = getNodeById(conn.to);
      
      if (!fromNode || !toNode) return null;
      
      return (
        <Line
          key={index}
          points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
          stroke="#8B7355"
          strokeWidth={3}
          tension={0.1}
        />
      );
    });
  };

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prevNodes => 
      prevNodes.map(n => 
        n.id === nodeId 
          ? { ...n, x, y }
          : n
      )
    );
  }, []);

  const renderNodes = () => {
    return nodes.map((node) => (
      <Circle
        key={node.id}
        x={node.x}
        y={node.y}
        radius={25}
        fill={nodeTypes[node.type].color}
        stroke="#F5F5DC"
        strokeWidth={2}
        onClick={() => handleNodeClick(node.id)}
        onTap={() => handleNodeClick(node.id)}
        draggable={selectedTool === 'select'}
        onDragMove={(e) => {
          // Update node position during drag for smooth line movement
          updateNodePosition(node.id, e.target.x(), e.target.y());
        }}
        onDragEnd={(e) => {
          // Final position update (redundant but kept for consistency)
          updateNodePosition(node.id, e.target.x(), e.target.y());
        }}
      />
    ));
  };

  const renderLayers = () => {
    const layerElements = [];
    
    for (let i = 0; i < layers; i++) {
      const y = startY - (i * layerHeight);
      
      layerElements.push(
        <Line
          key={`layer-${i}`}
          points={[50, y, 750, y]}
          stroke="#5D5A58"
          strokeWidth={1}
          dash={[10, 5]}
        />
      );
    }
    
    return layerElements;
  };

  const renderAddLayerButtons = () => {
    const buttons = [];
    
    for (let i = 1; i < layers; i++) {
      const y = startY - (i * layerHeight) + (layerHeight / 2);
      
      buttons.push(
        <Circle
          key={`add-layer-${i}`}
          x={400}
          y={y}
          radius={15}
          fill="#4A4A4A"
          stroke="#F5F5DC"
          strokeWidth={2}
          onClick={() => addNode(i)}
          onTap={() => addNode(i)}
        />
      );
      
      buttons.push(
        <Text
          key={`add-layer-text-${i}`}
          x={395}
          y={y - 5}
          text="+"
          fontSize={16}
          fill="#F5F5DC"
          onClick={() => addNode(i)}
          onTap={() => addNode(i)}
        />
      );
    }
    
    return buttons;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Node Types</h2>
        
        {/* Node type buttons */}
        <div className="node-type-container">
          {Object.entries(nodeTypes).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedNodeType(type as keyof typeof nodeTypes)}
                className={`node-type-button ${selectedNodeType === type ? 'selected' : ''}`}
              >
                <div 
                  className="node-icon"
                  style={{ backgroundColor: config.color }}
                >
                  <IconComponent style={{ color: '#F5F5DC', fontSize: '16px' }} />
                </div>
                <span className="node-label">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tools */}
        <div className="tools-section">
          <h3 className="tools-title">Tools</h3>
          
          <button
            onClick={() => {
              setSelectedTool(selectedTool === 'line' ? 'select' : 'line');
              setConnectingFrom(null);
            }}
            className={`tool-button ${selectedTool === 'line' ? 'selected' : ''}`}
          >
            <LineIcon style={{ color: '#F5F5DC', marginRight: '8px' }} />
            <span className="tool-label">
              {selectedTool === 'line' ? 'Exit Line Tool' : 'Line Tool'}
            </span>
          </button>
          
          {connectingFrom && (
            <div className="connection-status">
              Click another node to connect
            </div>
          )}
        </div>
      </div>

      {/* Main canvas area */}
      <div className="canvas-container">
        <Stage 
          width={window.innerWidth - 256} 
          height={window.innerHeight}
          ref={stageRef}
        >
          <Layer>
            {renderLayers()}
            {renderConnections()}
            {renderAddLayerButtons()}
            {renderNodes()}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;
