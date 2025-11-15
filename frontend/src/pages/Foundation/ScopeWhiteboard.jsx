import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useProjectStore } from "../../store/projectStore";

const HIERARCHY_COLORS = {
  0: { bg: "#c7d2fe", text: "#4338ca", border: "#4f46e5", label: "Epic" },      // indigo
  1: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", label: "Feature" },    // amber
  2: { bg: "#bbf7d0", text: "#065f46", border: "#10b981", label: "Sub-feature" }, // emerald
  3: { bg: "#ddd6fe", text: "#5b21b6", border: "#8b5cf6", label: "Task" },        // violet
};

export default function ScopeWhiteboard() {
  const navigate = useNavigate();
  const { scopeFeatures, setScopeFeatures } = useProjectStore();

  const [stickies, setStickies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [connectionLine, setConnectionLine] = useState(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState(null);

  // Load stickies from store on mount
  useEffect(() => {
    if (scopeFeatures.length > 0) {
      setStickies(
        scopeFeatures.map((f, idx) => ({
          id: f.id,
          title: f.title,
          x: (idx % 4) * 250 + 100,
          y: Math.floor(idx / 4) * 200 + 100,
          hierarchy: 0,
          parentId: null,
        }))
      );
    } else {
      const examples = [
        { id: "ex1", title: "Build out Frontend", x: 100, y: 100, hierarchy: 0, parentId: null },
        { id: "ex2", title: "Build out Backend", x: 350, y: 100, hierarchy: 0, parentId: null },
        { id: "ex3", title: "Go To Market", x: 600, y: 100, hierarchy: 0, parentId: null },
      ];
      setStickies(examples);
    }
  }, []);

  function handleCanvasDoubleClick(e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;
    
    const newId = `sticky-${Date.now()}`;
    const newSticky = {
      id: newId,
      title: "",
      x,
      y,
      hierarchy: 0,
      parentId: null,
    };
    setStickies([...stickies, newSticky]);
    setEditingId(newId);
    setEditText("");
  }

  function handleStickyClick(id, e) {
    e.stopPropagation();
    setSelectedId(id);
  }

  function handleStickyDoubleClick(id, e) {
    e.stopPropagation();
    const sticky = stickies.find((s) => s.id === id);
    if (sticky) {
      setEditingId(id);
      setEditText(sticky.title);
    }
  }

  function handleStickyDrag(id, dx, dy) {
    setStickies(
      stickies.map((s) => (s.id === id ? { ...s, x: s.x + dx, y: s.y + dy } : s))
    );
  }

  function handleEditSave(id) {
    setStickies(
      stickies.map((s) => (s.id === id ? { ...s, title: editText } : s))
    );
    setEditingId(null);
    setEditText("");
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditText("");
  }

  function handleDeleteSticky(id) {
    setStickies(stickies.filter((s) => s.id !== id));
    setStickies((prev) => prev.map((s) => (s.parentId === id ? { ...s, parentId: null } : s)));
    setSelectedId(null);
  }

  function handleConnectionStart(id, e) {
    e.stopPropagation();
    setConnectingFromId(id);
    setConnectionLine({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
  }

  function handleConnectionMouseMove(e) {
    if (connectingFromId && connectionLine) {
      setConnectionLine({ ...connectionLine, endX: e.clientX, endY: e.clientY });
    }
  }

  function handleConnectionEnd(targetId) {
    if (connectingFromId && targetId && connectingFromId !== targetId) {
      const sourceSticky = stickies.find((s) => s.id === connectingFromId);
      const targetSticky = stickies.find((s) => s.id === targetId);

      if (sourceSticky && targetSticky) {
        const newHierarchy = Math.min(sourceSticky.hierarchy + 1, 3);
        setStickies(
          stickies.map((s) =>
            s.id === targetId
              ? { ...s, parentId: connectingFromId, hierarchy: newHierarchy }
              : s
          )
        );
      }
    }
    setConnectingFromId(null);
    setConnectionLine(null);
  }

  function handleRemoveConnection(id) {
    setStickies(
      stickies.map((s) =>
        s.id === id ? { ...s, parentId: null, hierarchy: 0 } : s
      )
    );
    setHoveredConnectionId(null);
  }

  function findStickyAtPoint(clientX, clientY) {
    // Check if point is over any sticky by doing a reverse check
    for (let sticky of stickies) {
      const screenX = sticky.x + panX;
      const screenY = sticky.y + panY;
      const scaledWidth = 140 * scale;
      const scaledHeight = 100 * scale;
      
      if (
        clientX >= screenX &&
        clientX <= screenX + scaledWidth &&
        clientY >= screenY &&
        clientY <= screenY + scaledHeight
      ) {
        return sticky.id;
      }
    }
    return null;
  }

  function handleCanvasMouseDown(e) {
    if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }

  function handleCanvasMouseMove(e) {
    if (isDraggingCanvas && dragStart) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      setPanX(panX + e.clientX - dragStart.x);
      setPanY(panY + e.clientY - dragStart.y);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }

  function handleCanvasMouseUp(e) {
    if (connectingFromId && connectionLine) {
      // When connection drag ends, check if we're over a sticky
      const targetId = findStickyAtPoint(e.clientX, e.clientY);
      handleConnectionEnd(targetId);
    }
    setIsDraggingCanvas(false);
    setDragStart(null);
  }

  function handleCanvasDoubleClick(e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;
    
    const newId = `sticky-${Date.now()}`;
    const newSticky = {
      id: newId,
      title: "",
      x,
      y,
      hierarchy: 0,
      parentId: null,
    };
    setStickies([...stickies, newSticky]);
    setEditingId(newId);
    setEditText("");
  }

  function handleSaveToStore() {
    const features = stickies.map((s, idx) => ({
      id: s.id,
      title: s.title,
      description: "",
      acceptanceCriteria: "",
      isMVP: false,
      priority: idx,
      estimateDays: 1,
      dependencies: [],
      hierarchy: s.hierarchy,
      parentId: s.parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setScopeFeatures(features);
    navigate("/projects/foundation/mvp");
  }

  function handleCanvasWheel(e) {
    if (!canvasRef.current) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const zoom = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * zoom));
    setScale(newScale);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Nav />

      <div className="flex-1 ml-64 flex flex-col">
        <header className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-slate-500">Scope Wizard</p>
              <p className="font-semibold text-slate-900">Define Project Scope</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/projects")} className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200">Back to Hub</button>
            <button onClick={handleSaveToStore} className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Save & Continue</button>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-4">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 relative overflow-hidden select-none"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={(e) => {
              handleCanvasMouseMove(e);
              handleConnectionMouseMove(e);
            }}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onDoubleClick={handleCanvasDoubleClick}
            onWheel={handleCanvasWheel}
            style={{ cursor: isDraggingCanvas ? "grabbing" : connectingFromId ? "crosshair" : "grab" }}
          >
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              <g transform={`translate(${panX}, ${panY}) scale(${scale})`}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
                  </marker>
                  <marker id="arrowhead-hover" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Draw connection lines */}
                {stickies.map((sticky) =>
                  sticky.parentId
                    ? (() => {
                        const parent = stickies.find((s) => s.id === sticky.parentId);
                        if (!parent) return null;
                        
                        // Calculate center points of stickies
                        const parentCenterX = parent.x + 70; // 140px width / 2
                        const parentCenterY = parent.y + 50;  // 100px height / 2
                        const stickyCenterX = sticky.x + 70;
                        const stickyCenterY = sticky.y + 50;

                        const isHovered = hoveredConnectionId === sticky.id;

                        return (
                          <g key={`line-group-${sticky.id}`}>
                            <line
                              x1={parentCenterX}
                              y1={parentCenterY}
                              x2={stickyCenterX}
                              y2={stickyCenterY}
                              stroke={isHovered ? "#ef4444" : "#cbd5e1"}
                              strokeWidth="2"
                              strokeDasharray="5,5"
                              markerEnd={isHovered ? "url(#arrowhead-hover)" : "url(#arrowhead)"}
                              style={{ pointerEvents: "stroke" }}
                              onMouseEnter={() => setHoveredConnectionId(sticky.id)}
                              onMouseLeave={() => setHoveredConnectionId(null)}
                              onClick={() => handleRemoveConnection(sticky.id)}
                              className="cursor-pointer"
                              title="Click to remove connection"
                            />
                          </g>
                        );
                      })()
                    : null
                )}

                {/* Temporary connection line while dragging */}
                {connectionLine && connectingFromId && (() => {
                  const source = stickies.find((s) => s.id === connectingFromId);
                  if (!source) return null;
                  const sourceCenterX = source.x + 70;
                  const sourceCenterY = source.y + 50;
                  return (
                    <line
                      x1={sourceCenterX}
                      y1={sourceCenterY}
                      x2={(connectionLine.endX - panX) / scale}
                      y2={(connectionLine.endY - panY) / scale}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })()}
              </g>
            </svg>

            {/* Stickies rendered as HTML elements for easier interaction */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {stickies.map((sticky) => (
                <StickyNoteComponent
                  key={sticky.id}
                  sticky={sticky}
                  isSelected={sticky.id === selectedId}
                  isEditing={sticky.id === editingId}
                  hierarchy={sticky.hierarchy}
                  panX={panX}
                  panY={panY}
                  scale={scale}
                  onClick={(e) => handleStickyClick(sticky.id, e)}
                  onDoubleClick={(e) => handleStickyDoubleClick(sticky.id, e)}
                  onDrag={(dx, dy) => handleStickyDrag(sticky.id, dx, dy)}
                  onConnectionStart={(e) => handleConnectionStart(sticky.id, e)}
                  onConnectionEnd={() => handleConnectionEnd(sticky.id)}
                  isConnecting={connectingFromId === sticky.id}
                  editingId={editingId}
                  editText={editText}
                  onEditChange={setEditText}
                  onEditSave={() => handleEditSave(sticky.id)}
                  onEditCancel={handleEditCancel}
                  onDelete={() => handleDeleteSticky(sticky.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Panel: Instructions & Legend */}
          <div className="w-64 flex flex-col gap-4">
            {/* Help Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Guide</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <strong>Create:</strong> Double-click canvas
                </div>
                <div>
                  <strong>Edit:</strong> Double-click sticky text
                </div>
                <div>
                  <strong>Delete:</strong> Right-click sticky
                </div>
                <div>
                  <strong>Link:</strong> Click 🔗 and drag to another
                </div>
                <div>
                  <strong>Unlink:</strong> Click connection line
                </div>
                <div>
                  <strong>Pan:</strong> Ctrl+drag
                </div>
                <div>
                  <strong>Zoom:</strong> Scroll wheel
                </div>
              </div>
            </div>

            {/* Hierarchy Legend */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-sm mb-3">Hierarchy Levels</h4>
              <div className="space-y-2">
                {Object.entries(HIERARCHY_COLORS).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                    ></div>
                    <span className="text-xs text-slate-700">{color.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Counter */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-700">
                <strong>{stickies.length}</strong> item{stickies.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => navigate("/projects")}
                className="flex-1 px-3 py-2 text-sm rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToStore}
                className="flex-1 px-3 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyNoteComponent({ sticky, isSelected, hierarchy, panX, panY, scale, onClick, onDoubleClick, onDrag, onConnectionStart, onConnectionEnd, isConnecting, editingId, editText, onEditChange, onEditSave, onEditCancel, onDelete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const color = HIERARCHY_COLORS[hierarchy] || HIERARCHY_COLORS[0];
  const isEditing = editingId === sticky.id;

  // Connection points positions (top, right, bottom, left)
  const connectionPoints = [
    { name: "top", x: "50%", y: "0", top: "-6px", left: "50%" },
    { name: "right", x: "100%", y: "50%", top: "50%", right: "-6px" },
    { name: "bottom", x: "50%", y: "100%", bottom: "-6px", left: "50%" },
    { name: "left", x: "0", y: "50%", top: "50%", left: "-6px" },
  ];

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleMouseDown(e) {
    if (e.button !== 0) return; // only left click
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    onClick(e);
  }

  function handleMouseMove(e) {
    if (!isDragging || !dragStart) return;
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;
    onDrag(dx, dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseUp(e) {
    setIsDragging(false);
    setDragStart(null);
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: `${sticky.x + panX}px`,
        top: `${sticky.y + panY}px`,
        width: "140px",
        height: "100px",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="w-full h-full rounded-lg shadow-md border-2 overflow-visible relative"
        style={{
          backgroundColor: color.bg,
          borderColor: isSelected ? color.border : "#cbd5e1",
          borderWidth: isSelected ? "3px" : "1px",
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => {
          e.preventDefault();
          onDelete();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        {/* Simple Sticky with Inline Editing */}
        <div className="w-full h-full flex items-center justify-center p-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => {
                e.stopPropagation();
                onEditChange(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  onEditSave();
                } else if (e.key === "Escape") {
                  onEditCancel();
                }
              }}
              onBlur={onEditSave}
              className="w-full h-full text-center text-sm font-medium border-0 outline-none resize-none"
              style={{
                backgroundColor: "transparent",
                color: color.text,
              }}
              onClick={(e) => e.stopPropagation()}
              autoComplete="off"
            />
          ) : (
            <div
              className="text-center text-sm font-semibold break-words w-full"
              style={{ color: color.text }}
              title={sticky.title}
            >
              {sticky.title || "(empty)"}
            </div>
          )}
        </div>

        {/* Connection Points - appear on hover */}
        {(isHovered || isConnecting) &&
          connectionPoints.map((point) => (
            <button
              key={point.name}
              className="absolute w-3 h-3 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-100 transition-colors"
              style={{
                ...(point.top && { top: point.top }),
                ...(point.bottom && { bottom: point.bottom }),
                ...(point.left && { left: point.left }),
                ...(point.right && { right: point.right }),
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                cursor: "crosshair",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onConnectionStart(e);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                onConnectionEnd();
              }}
              onClick={(e) => e.stopPropagation()}
              title="Drag to connect"
            />
          ))}
      </div>
    </div>
  );
}
