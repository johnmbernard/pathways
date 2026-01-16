import { useState, useMemo, useEffect } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { Button } from '../components/ui';
import { UserPlus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';
import styles from './UsersPage.module.css';

export default function UsersPage() {
  const { units, fetchUnits } = useOrganizationStore();
  const getTierLevel = useOrganizationStore(state => state.getTierLevel);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationalUnit: '',
    role: 'Member',
  });

  // Fetch users and units on mount
  useEffect(() => {
    fetchUsers();
    fetchUnits();
  }, [fetchUnits]);

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group units by tier for better UX
  const unitsByTier = useMemo(() => {
    const grouped = {};
    units.forEach(unit => {
      const tier = getTierLevel(unit.id);
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(unit);
    });
    return grouped;
  }, [units, getTierLevel]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        organizationalUnit: user.organizationalUnit,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        organizationalUnit: '',
        role: 'Member',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', organizationalUnit: '', role: 'Member' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingUser) {
        // Update existing user
        const response = await apiFetch(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update user');
        }
        
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        // Create new user
        const response = await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create user');
        }
        
        const newUser = await response.json();
        setUsers([...users, newUser]);
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.message);
      console.error('Error saving user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await apiFetch(`/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const getUserUnit = (unitId) => {
    return units.find(u => u.id === unitId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage user accounts and organizational assignments</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <UserPlus size={16} />
          Add User
        </Button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.usersGrid}>
            {users.map(user => {
              const unit = getUserUnit(user.organizationalUnit);
              const tier = unit ? getTierLevel(unit.id) : null;
              
              return (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userAvatar}>
                    <UsersIcon size={24} />
                  </div>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.name}</h3>
                    <p className={styles.userEmail}>{user.email}</p>
                    <div className={styles.userMeta}>
                      <span className={styles.userRole}>{user.role}</span>
                      {unit && (
                        <>
                          <span className={styles.separator}>•</span>
                          <span className={styles.userUnit}>
                            Tier {tier}: {unit.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      onClick={() => handleOpenModal(user)}
                      className={styles.editButton}
                      title="Edit user"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={styles.deleteButton}
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.input}
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={styles.input}
                  required
                >
                  <option value="Member">Member</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Unit Leader">Unit Leader</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Organizational Unit</label>
                <select
                  value={formData.organizationalUnit}
                  onChange={(e) => setFormData({ ...formData, organizationalUnit: e.target.value })}
                  className={styles.input}
                  required
                >
                  <option value="">Select a unit...</option>
                  {Object.entries(unitsByTier).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, tierUnits]) => (
                    <optgroup key={tier} label={`Tier ${tier}`}>
                      {tierUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
