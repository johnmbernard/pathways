import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Button } from '../components/ui';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useUserStore(state => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pathways</h1>
          <p className={styles.subtitle}>Organizational Planning & Refinement</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.input}
              placeholder="your.email@example.com"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Demo accounts available for testing
          </p>
        </div>
      </div>
    </div>
  );
}
