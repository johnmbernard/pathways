import React, { useState, useMemo } from 'react';
import { useWorkItemsStore } from '../store/workItemsStore';
import { useOrganizationStore } from '../store/organizationStore';
import { PageHeader } from '../components/layout/Layout';
import { Badge } from '../components/ui';
import { Building2, GripVertical } from 'lucide-react';
import styles from './TeamPriorities.module.css';

export default function TeamPriorities() {
  const { items, updateItem } = useWorkItemsStore();
  const { units, flatUnits } = useOrganizationStore();
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Combine all org units for team selector
  const allTeams = useMemo(() => [
    ...units.map(u => ({ id: u.id, name: u.name, isFlat: false })),
    ...flatUnits.map(u => ({ id: u.id, name: u.name, isFlat: true }))
  ], [units, flatUnits]);

  // Filter items based on selected team
  const filteredItems = useMemo(() => {
    if (selectedTeam === 'all') {
      return items;
    }
    return items.filter(item => item.assignedOrgUnit === selectedTeam);
  }, [items, selectedTeam]);

  // Group items by priority
  const p1Items = useMemo(() => 
    filteredItems.filter(item => item.priority === 'P1').sort((a, b) => a.order - b.order),
    [filteredItems]
  );

  const p2Items = useMemo(() => 
    filteredItems.filter(item => item.priority === 'P2').sort((a, b) => a.order - b.order),
    [filteredItems]
  );

  const p3Items = useMemo(() => 
    filteredItems.filter(item => item.priority === 'P3').sort((a, b) => a.order - b.order),
    [filteredItems]
  );

  const handlePriorityChange = (itemId, newPriority) => {
    updateItem(itemId, { priority: newPriority });
  };

  const PriorityBucket = ({ priority, title, description, items, color }) => (
    <div className={styles.bucket}>
      <div className={styles.bucketHeader} style={{ borderLeftColor: color }}>
        <div>
          <h3 className={styles.bucketTitle}>{title}</h3>
          <p className={styles.bucketDescription}>{description}</p>
        </div>
        <Badge variant={priority === 'P1' ? 'danger' : priority === 'P2' ? 'warning' : 'secondary'}>
          {items.length} items
        </Badge>
      </div>
      <div className={styles.bucketBody}>
        {items.length === 0 ? (
          <div className={styles.emptyBucket}>
            No items in this priority bucket
          </div>
        ) : (
          items.map((item) => {
            const team = allTeams.find(t => t.id === item.assignedOrgUnit);
            return (
              <div key={item.id} className={styles.priorityItem}>
                <div className={styles.dragHandle}>
                  <GripVertical size={16} />
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemId}>#{item.id}</span>
                    <span className={styles.itemTitle}>{item.title}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <Badge variant="primary" className={styles.typeBadge}>
                      {item.type}
                    </Badge>
                    {team && (
                      <span className={styles.teamBadge}>
                        <Building2 size={12} />
                        {team.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.priorityControls}>
                  <select
                    value={item.priority}
                    onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                    className={styles.prioritySelect}
                  >
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Team Priorities"
        subtitle="Organize work into priority buckets"
      />

      <div className={styles.container}>
        {/* Team Selector */}
        <div className={styles.teamSelector}>
          <label className={styles.teamLabel}>
            <Building2 size={18} />
            Team View:
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={styles.teamSelect}
          >
            <option value="all">All Teams (Organization View)</option>
            <optgroup label="Hierarchical Units">
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </optgroup>
            {flatUnits.length > 0 && (
              <optgroup label="Flat Units">
                {flatUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Priority Buckets */}
        <div className={styles.bucketsGrid}>
          <PriorityBucket
            priority="P1"
            title="P1 - Must Do"
            description="Critical items that must be completed"
            items={p1Items}
            color="#dc2626"
          />
          <PriorityBucket
            priority="P2"
            title="P2 - Next Up"
            description="Important items to tackle next"
            items={p2Items}
            color="#f59e0b"
          />
          <PriorityBucket
            priority="P3"
            title="P3 - When Capacity Allows"
            description="Nice-to-have items for when time permits"
            items={p3Items}
            color="#6b7280"
          />
        </div>
      </div>
    </div>
  );
}
