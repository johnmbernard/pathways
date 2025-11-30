import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useHierarchyStore } from '../store/hierarchyStore';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import { PageHeader } from '../components/layout/Layout';
import { cn } from '../utils/helpers';
import { formatDate } from '../utils/dateUtils';

function parseYmd(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / ms);
}

function formatHeaderDate(dt) {
  // Use dateUtils formatDate with MM/dd pattern
  return formatDate(dt, 'MM/dd');
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { items, getRootItems, getChildren } = useWorkItemsStore();
  const { tiers, flatTypes } = useHierarchyStore();

  // Build flattened tree for rendering
  const buildTree = React.useCallback(() => {
    const result = [];
    const walk = (id, depth) => {
      const node = items.find(i => i.id === id);
      if (!node) return;
      result.push({ ...node, depth });
      const kids = getChildren(id);
      kids.forEach(k => walk(k.id, depth + 1));
    };
    const roots = getRootItems();
    roots.forEach(r => walk(r.id, 0));
    return result;
  }, [items, getChildren, getRootItems]);

  const rows = buildTree();

  // Determine timeline range
  const allDates = rows.flatMap(r => [parseYmd(r.startDate), parseYmd(r.targetDate)].filter(Boolean));
  let minDate, maxDate;
  if (allDates.length) {
    minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  } else {
    const today = new Date();
    minDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    maxDate = new Date(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  // Ensure at least 14 days to give some room
  if (daysBetween(minDate, maxDate) < 14) {
    maxDate = new Date(minDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  }

  // Build day buckets
  const dayWidth = 20; // px per day
  const totalDays = Math.max(1, daysBetween(minDate, maxDate) + 1);
  const timelineWidth = totalDays * dayWidth;
  const dayTicks = Array.from({ length: totalDays }, (_, i) => new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000));

  const getTypeIcon = (type) => {
    const tierIndex = tiers.findIndex(t => t.name === type);
    if (tierIndex === 0) return '📦';
    if (tierIndex === 1) return '🔥';
    if (tierIndex >= 2) return '📋';
    if (flatTypes.some(t => t.name.toLowerCase() === String(type).toLowerCase())) return /bug/i.test(type) ? '🐛' : '🏷️';
    return '🏷️';
  };

  const [expanded, setExpanded] = React.useState(() => new Set(rows.filter(r => r.depth === 0).map(r => r.id)));
  const isVisible = (row) => {
    // visible if all ancestors are expanded
    let current = row;
    while (current && current.parentId) {
      const parent = rows.find(r => r.id === current.parentId);
      if (!parent) break;
      if (!expanded.has(parent.id)) return false;
      current = parent;
    }
    return true;
  };
  const hasChildren = (id) => rows.some(r => r.parentId === id);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Roadmap"
        subtitle="Gantt view of your work items"
        actions={
          <Button onClick={() => navigate('/')} variant="secondary">
            <ArrowLeft size={18} />
            Back to Backlog
          </Button>
        }
      />

      {/* Grid */}
      <div className="px-6 py-6">
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {/* Timeline Header */}
          <div className={cn(
            "flex border-b border-gray-200 bg-gray-50"
          )}>
            <div className="w-8" />
            <div className="w-8" />
            <div className="w-12 px-2 text-sm font-medium text-gray-700">ID</div>
            <div className="flex-1 px-2 text-sm font-medium text-gray-700">Title</div>
            <div className="w-32 px-2 text-sm font-medium text-gray-700">Type</div>
            <div className="flex-1 overflow-auto">
              <div style={{ width: timelineWidth }} className="flex text-xs text-gray-600">
                {dayTicks.map((d, i) => (
                  <div key={i} style={{ width: dayWidth }} className="border-l border-gray-200 text-center">
                    {i % 7 === 0 ? formatHeaderDate(d) : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            {rows.filter(isVisible).map((row) => {
              const s = parseYmd(row.startDate);
              const e = parseYmd(row.targetDate);
              const startOffsetDays = s ? Math.max(0, daysBetween(minDate, s)) : null;
              const durationDays = s && e ? Math.max(1, daysBetween(s, e) + 1) : (s ? 1 : null);
              const barLeft = startOffsetDays != null ? startOffsetDays * dayWidth : 0;
              const barWidth = durationDays != null ? durationDays * dayWidth : dayWidth;

              return (
                <div key={row.id} className="flex items-stretch border-b border-gray-200">
                  {/* Tree controls */}
                  <div className="w-8 flex items-center justify-center">
                    {hasChildren(row.id) ? (
                      <button
                        className={cn(
                          "p-1 hover:bg-gray-200 rounded transition-colors"
                        )}
                        onClick={() => {
                          const next = new Set(expanded);
                          if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
                          setExpanded(next);
                        }}
                      >
                        {expanded.has(row.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    ) : null}
                  </div>
                  {/* Icon */}
                  <div className="w-8 flex items-center justify-center text-lg">{getTypeIcon(row.type)}</div>
                  {/* ID */}
                  <div className="w-12 px-2 text-xs text-gray-500 flex items-center">{row.id}</div>
                  {/* Title */}
                  <div className="flex-1 px-2 py-2" style={{ paddingLeft: `${row.depth * 16}px` }}>
                    <div className="text-sm text-gray-900">{row.title}</div>
                  </div>
                  {/* Type */}
                  <div className="w-32 px-2 text-xs text-gray-700 flex items-center">{row.type}</div>
                  {/* Timeline */}
                  <div className="flex-1 overflow-auto">
                    <div style={{ width: timelineWidth, position: 'relative', height: 28 }} className="border-l border-gray-200">
                      {s ? (
                        <div
                          title={`${row.startDate || ''} → ${row.targetDate || ''}`}
                          className={cn(
                            "absolute rounded"
                          )}
                          style={{ left: barLeft, width: barWidth, top: 6, height: 16, background: 'var(--color-primary-500)' }}
                        />
                      ) : (
                        <div className={cn(
                          "text-xs text-gray-400 absolute"
                        )} style={{ left: 8, top: 6 }}>no dates</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
