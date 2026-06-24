import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminRoute.module.css';

export default function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className={styles.denied}>
        <div className={styles.icon}>🔒</div>
        <h2>权限不足</h2>
        <p>需要管理员权限才能访问此页面</p>
      </div>
    );
  }

  return <Outlet />;
}
