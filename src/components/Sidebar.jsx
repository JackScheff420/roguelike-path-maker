import React from 'react'

const Sidebar = ({ levels, onAddNode, onStartConnection, onExportData, isConnecting }) => {
  const nodeTypes = [
    { value: 'combat', label: 'Combat', color: 'bg-red-600' },
    { value: 'treasure', label: 'Treasure', color: 'bg-yellow-600' },
    { value: 'shop', label: 'Shop', color: 'bg-blue-600' },
    { value: 'elite', label: 'Elite', color: 'bg-purple-600' },
    { value: 'event', label: 'Event', color: 'bg-green-600' }
  ]

  return (
    <div className="w-80 bg-stone-800 p-6 border-r border-stone-700">
      <h1 className="text-2xl font-bold text-amber-400 mb-6">
        Roguelike Path Maker
      </h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Levels</h2>
          <div className="space-y-2">
            {levels.map((level, index) => (
              <div key={level.id} className="bg-stone-700 p-3 rounded-lg">
                <h3 className="font-medium mb-2">
                  Level {index + 1} ({level.nodes.length} nodes)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {nodeTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => onAddNode(level.id, type.value)}
                      className={`px-2 py-1 text-sm rounded ${type.color} hover:opacity-80 transition-opacity`}
                    >
                      + {type.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Tools</h2>
          <div className="space-y-2">
            <button
              onClick={onStartConnection}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                isConnecting 
                  ? 'bg-amber-600 text-stone-900' 
                  : 'bg-stone-600 hover:bg-stone-500'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Draw Connection'}
            </button>
            
            <button
              onClick={onExportData}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="text-sm text-stone-400">
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ul className="space-y-1">
            <li>• Add nodes to each level</li>
            <li>• Click "Draw Connection" then click two nodes</li>
            <li>• Drag nodes to reposition them</li>
            <li>• Export your map as JSON</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar