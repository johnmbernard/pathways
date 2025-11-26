import React, { useState } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';

const WORK_ITEM_TYPES = ['Epic', 'Feature', 'User Story', 'Task', 'Bug'];
const STATES = ['New', 'Committed', 'In Progress', 'Done', 'Removed'];

const STATE_COLORS = {
  'New': 'bg-gray-100 text-gray-700',
  'Committed': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Done': 'bg-green-100 text-green-700',
  'Removed': 'bg-red-100 text-red-700',
};

const TYPE_ICONS = {
  'Epic': '📦',
  'Feature': '🔥',
  'User Story': '📋',
  'Task': '✓',
  'Bug': '🐛',
};

function WorkItemRow({ item, depth = 0 }) {
  const { updateItem, deleteItem, toggleExpanded, getChildren, expandedItems, addItem } = useWorkItemsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [showActions, setShowActions] = useState(false);

  const children = getChildren(item.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedItems.has(item.id);

  const handleSave = () => {
    if (editTitle.trim()) {
      updateItem(item.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleAddChild = () => {
    addItem({
      title: 'New Work Item',
      state: 'New',
      type: 'Task',
      parentId: item.id,
    });
    if (!isExpanded) {
      toggleExpanded(item.id);
    }
  };

  return (
    <>
      <div 
        className="group flex items-center hover:bg-gray-50 border-b border-gray-200"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && toggleExpanded(item.id)}
          className="p-1 hover:bg-gray-200 rounded"
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Work Item Type Icon */}
        <span className="mx-2 text-lg">{TYPE_ICONS[item.type]}</span>

        {/* ID */}
        <span className="text-xs text-gray-500 w-12">{item.id}</span>

        {/* Title */}
        <div className="flex-1 py-2 px-2">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setEditTitle(item.title);
                  setIsEditing(false);
                }
              }}
              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <span 
              onDoubleClick={() => setIsEditing(true)}
              className="cursor-text"
            >
              {item.title}
            </span>
          )}
        </div>

        {/* State Dropdown */}
        <select
          value={item.state}
          onChange={(e) => updateItem(item.id, { state: e.target.value })}
          className={`px-3 py-1 rounded text-xs font-medium mr-2 ${STATE_COLORS[item.state]}`}
        >
          {STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {/* Type Dropdown */}
        <select
          value={item.type}
          onChange={(e) => updateItem(item.id, { type: e.target.value })}
          className="px-3 py-1 rounded text-xs bg-white border border-gray-300 mr-2"
        >
          {WORK_ITEM_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={handleAddChild}
              className="p-1 hover:bg-gray-200 rounded text-blue-600"
              title="Add child item"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1 hover:bg-gray-200 rounded text-red-600"
              title="Delete"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Render Children */}
      {isExpanded && children.map(child => (
        <WorkItemRow key={child.id} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function WorkItemsPage() {
  const { getRootItems, addItem } = useWorkItemsStore();
  const rootItems = getRootItems();

  const handleNewWorkItem = () => {
    addItem({
      title: 'New Work Item',
      state: 'New',
      type: 'Feature',
      parentId: null,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Work Items</h1>
            <p className="text-sm text-gray-500 mt-1">Backlog</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewWorkItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={18} />
              New Work Item
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              View as Board
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Column Options
            </button>
          </div>
        </div>
      </header>

      {/* Work Items Table Header */}
      <div className="border-b border-gray-300 bg-gray-50 px-2 py-2 flex items-center text-sm font-medium text-gray-700">
        <div className="w-8"></div>
        <div className="w-8"></div>
        <div className="w-12 px-2">ID</div>
        <div className="flex-1 px-2">Title</div>
        <div className="w-32 px-2">State</div>
        <div className="w-32 px-2">Type</div>
        <div className="w-20"></div>
      </div>

      {/* Work Items List */}
      <div className="flex-1 overflow-auto">
        {rootItems.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No work items yet</p>
              <p className="text-sm">Click "New Work Item" to get started</p>
            </div>
          </div>
        ) : (
          rootItems.map(item => (
            <WorkItemRow key={item.id} item={item} depth={0} />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-2 text-xs text-gray-600">
        {rootItems.length} items
      </div>
    </div>
  );
}
