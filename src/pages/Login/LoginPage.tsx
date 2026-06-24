import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import { login as apiLogin } from '../../api/auth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Already logged in → redirect
  if (isAuthenticated) {
    const redirect = searchParams.get('redirect') || '/profile';
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin({ name: name.trim(), password });
      if (res.code === 200 && res.data) {
        login(res.data.token, res.data.user);
        addToast(res.msg || '登录成功', 'success');
        const redirect = searchParams.get('redirect') || '/profile';
        navigate(redirect, { replace: true });
      } else {
        setError(res.msg || '登录失败，请重试');
      }
    } catch {
      setError('网络错误，请检查后端服务是否可用');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>👤</div>
          <h1 className={styles.title}>用户管理系统</h1>
          <p className={styles.subtitle}>请登录您的账号</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>用户名</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>密码</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  );
}
