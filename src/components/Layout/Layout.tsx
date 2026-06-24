import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/profile" className={styles.logo}>
            <span className={styles.logoIcon}>👤</span>
            用户管理
          </NavLink>
          <nav className={styles.nav}>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              个人中心
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                用户管理
              </NavLink>
            )}
          </nav>
          <div className={styles.userArea}>
            <img
              src={user?.avatar}
              alt={user?.name}
              className={styles.avatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👤</text></svg>';
              }}
            />
            <span className={styles.userName}>{user?.name}</span>
            {isAdmin && <span className={styles.adminBadge}>管理员</span>}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              退出
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
