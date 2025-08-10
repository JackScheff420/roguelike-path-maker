# Smooth Line Movement Implementation Test

## What was implemented

The issue requested smooth movement of lines between nodes during dragging, instead of lines only updating after the drag is complete.

## Changes Made

1. **Added `onDragMove` handler** to the Circle components in `renderNodes()` function
2. **Optimized with useCallback** to prevent unnecessary re-renders
3. **Real-time position updates** during dragging instead of only on drag end

## Key Implementation Details

### Before (Original Code)
```jsx
<Circle
  // ... other props
  draggable={selectedTool === 'select'}
  onDragEnd={(e) => {
    // Only updated on drag end - lines would snap to new position
    const updatedNodes = nodes.map(n => 
      n.id === node.id 
        ? { ...n, x: e.target.x(), y: e.target.y() }
        : n
    );
    setNodes(updatedNodes);
  }}
/>
```

### After (Smooth Movement)
```jsx
<Circle
  // ... other props  
  draggable={selectedTool === 'select'}
  onDragMove={(e) => {
    // Update position during drag for smooth line movement
    updateNodePosition(node.id, e.target.x(), e.target.y());
  }}
  onDragEnd={(e) => {
    // Final position update 
    updateNodePosition(node.id, e.target.x(), e.target.y());
  }}
/>
```

### Optimized Update Function
```jsx
const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
  setNodes(prevNodes => 
    prevNodes.map(n => 
      n.id === nodeId 
        ? { ...n, x, y }
        : n
    )
  );
}, []);
```

## How to Test

1. Start the application: `npm start`
2. Add some nodes by clicking the "+" buttons in different layers
3. Enable the Line Tool and create connections between nodes  
4. Switch back to Select mode (default mode)
5. Drag any connected node - you should see the lines move smoothly with the node

## Expected Behavior

- **Before**: Lines would stay in original position during drag and snap to new position when drag ends
- **After**: Lines move fluidly in real-time as the node is being dragged

## Technical Details

- Uses React Konva's `onDragMove` event to capture intermediate drag positions
- Updates node state in real-time, causing connected lines to re-render smoothly
- Optimized with `useCallback` and functional state updates for performance
- Maintains backward compatibility with existing functionality