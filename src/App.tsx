import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Circle, Line, Text, Rect } from 'react-konva';
import { 
  Shield as Swords, 
  LocalFireDepartment as SwordRose,
  LocalHotel as Camping,
  MonetizationOn as MoneyBag,
  Diamond,
  HelpOutline as QuestionMark,
  LinearScale as LineIcon,
  Add as AddIcon,
  AddCircle as NodeIcon
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
  areaId: string;
}

interface Connection {
  from: string;
  to: string;
}

interface Area {
  id: string;
  name: string;
  startLayer: number;
  endLayer: number;
  color: string;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    // Start node
    { id: 'start', x: 400, y: 550, type: 'combat', layer: 0, areaId: 'area-1' }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'line' | 'node'>('select');
  const [selectedNodeType, setSelectedNodeType] = useState<keyof typeof nodeTypes>('combat');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([
    { id: 'area-1', name: 'Starting Area', startLayer: 0, endLayer: 2, color: '#4A5D23' },
    { id: 'area-2', name: 'Mid Game', startLayer: 3, endLayer: 4, color: '#5D2343' },
    { id: 'area-3', name: 'End Game', startLayer: 5, endLayer: 6, color: '#23435D' }
  ]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);

  const layers = Math.max(...areas.map(a => a.endLayer)) + 1;

  const layerHeight = 70;
  const startY = 500;

  const addNodeAtPosition = (x: number, y: number) => {
    if (selectedTool !== 'node') return;
    
    // Determine which layer this position belongs to
    const clickY = y;
    const layerIndex = Math.round((startY - clickY) / layerHeight);
    
    // Find which area this layer belongs to
    const area = areas.find(a => layerIndex >= a.startLayer && layerIndex <= a.endLayer);
    if (!area || layerIndex < 0 || layerIndex >= layers) return;
    
    const newNode: Node = {
      id: `node_${Date.now()}`,
      x: x,
      y: startY - (layerIndex * layerHeight),
      type: selectedNodeType,
      layer: layerIndex,
      areaId: area.id
    };
    
    setNodes([...nodes, newNode]);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    // Limit zoom levels
    if (newScale < 0.3 || newScale > 3) return;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStageScale(newScale);
    setStagePosition(newPos);
  };

  const addNewArea = () => {
    const lastLayer = Math.max(...areas.map(a => a.endLayer));
    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: `Area ${areas.length + 1}`,
      startLayer: lastLayer + 1,
      endLayer: lastLayer + 2,
      color: `hsl(${Math.random() * 360}, 50%, 30%)`
    };
    setAreas([...areas, newArea]);
  };

  const handleStageClick = (e: any) => {
    // Only handle clicks on the stage background, not on nodes or other elements
    if (e.target === e.target.getStage()) {
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      const stageAttrs = stage.attrs;
      
      // Convert screen coordinates to stage coordinates accounting for scale and position
      const x = (pointerPosition.x - stageAttrs.x) / stageAttrs.scaleX;
      const y = (pointerPosition.y - stageAttrs.y) / stageAttrs.scaleY;
      
      addNodeAtPosition(x, y);
    }
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

  const renderAreas = () => {
    const areaElements: React.ReactElement[] = [];
    
    areas.forEach(area => {
      const areaStartY = startY - (area.startLayer * layerHeight);
      const areaEndY = startY - ((area.endLayer + 1) * layerHeight);
      const height = areaStartY - areaEndY;
      
      // Area background
      areaElements.push(
        <Rect
          key={`area-bg-${area.id}`}
          x={50}
          y={areaEndY}
          width={700}
          height={height}
          fill={area.color}
          opacity={0.1}
          stroke={area.color}
          strokeWidth={1}
          dash={[5, 5]}
        />
      );
      
      // Area separator line (black dashed line at the top of each area)
      if (area.startLayer > 0) {
        areaElements.push(
          <Line
            key={`area-separator-${area.id}`}
            points={[50, startY - (area.startLayer * layerHeight) + layerHeight/2, 750, startY - (area.startLayer * layerHeight) + layerHeight/2]}
            stroke="#000000"
            strokeWidth={2}
            dash={[10, 5]}
          />
        );
      }
      
      // Area label
      areaElements.push(
        <Text
          key={`area-label-${area.id}`}
          x={60}
          y={areaEndY + 10}
          text={area.name}
          fontSize={14}
          fill={area.color}
          fontStyle="bold"
        />
      );
    });
    
    return areaElements;
  };

  const renderLayers = () => {
    const layerElements = [];
    
    for (let i = 0; i < layers; i++) {
      const y = startY - (i * layerHeight);
      
      layerElements.push(
        <Line
          key={`layer-${i}`}
          points={[50, y, 750, y]}
          stroke="#000000"
          strokeWidth={1}
          dash={[5, 3]}
          opacity={0.8}
        />
      );
    }
    
    return layerElements;
  };

  // Removed renderAddLayerButtons - replaced with Node Tool

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
              setSelectedTool('node');
              setConnectingFrom(null);
            }}
            className={`tool-button ${selectedTool === 'node' ? 'selected' : ''}`}
          >
            <NodeIcon style={{ color: '#F5F5DC', marginRight: '8px' }} />
            <span className="tool-label">Node Tool</span>
          </button>
          
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

        {/* Areas management */}
        <div className="areas-section">
          <h3 className="areas-title">Areas</h3>
          
          {areas.map(area => (
            <div key={area.id} className="area-item">
              <div 
                className="area-color" 
                style={{ backgroundColor: area.color }}
              />
              <span className="area-name">{area.name}</span>
            </div>
          ))}
          
          <button
            onClick={addNewArea}
            className="add-area-button"
          >
            <AddIcon style={{ color: '#F5F5DC', marginRight: '8px' }} />
            <span className="tool-label">Add Area</span>
          </button>
        </div>
      </div>

      {/* Main canvas area */}
      <div className="canvas-container">
        <Stage 
          width={window.innerWidth - 256} 
          height={window.innerHeight}
          ref={stageRef}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          draggable={selectedTool === 'select'}
        >
          <Layer>
            {renderAreas()}
            {renderLayers()}
            {renderConnections()}
            {renderNodes()}
          </Layer>
        </Stage>
        
        <div className="canvas-controls">
          <div className="zoom-info">
            Zoom: {Math.round(stageScale * 100)}%
          </div>
          <div className="canvas-help">
            Mouse wheel: Zoom | Drag: Pan (when Select tool active) | Node Tool: Click to add nodes
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
