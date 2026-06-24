import { useState, useEffect, useCallback } from 'react';
import { getUserPage, searchUsers, deleteUser, disableUser } from '../../api/admin';
import { useToast } from '../../components/Toast/Toast';
import Pagination from '../../components/Pagination/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserEditModal from './UserEditModal';
import UserAddModal from './UserAddModal';
import { genderLabel, roleLabel } from '../../utils/format';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import type { User, UserSearchParams } from '../../types';
import styles from './UserListPage.module.css';

export default function UserListPage() {
  const { addToast } = useToast();

  // List state
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Search form state
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // Confirm dialogs
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [disableTarget, setDisableTarget] = useState<User | null>(null);

  const hasSearchParams = searchId || searchName || searchEmail || searchPhone;

  const buildSearchParams = useCallback((): UserSearchParams => {
    const params: UserSearchParams = { page, size: DEFAULT_PAGE_SIZE };
    if (searchId) params.id = parseInt(searchId);
    if (searchName) params.name = searchName;
    if (searchEmail) params.email = searchEmail;
    if (searchPhone) params.phone = searchPhone;
    return params;
  }, [page, searchId, searchName, searchEmail, searchPhone]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (hasSearchParams) {
        const res = await searchUsers(buildSearchParams());
        if (res.code === 200 && res.data) {
          setUsers(res.data.records);
          setTotal(res.data.total);
        } else {
          addToast(res.msg || '获取用户列表失败', 'error');
        }
      } else {
        const res = await getUserPage(page, DEFAULT_PAGE_SIZE);
        if (res.code === 200 && res.data) {
          setUsers(res.data.records);
          setTotal(res.data.total);
        } else {
          addToast(res.msg || '获取用户列表失败', 'error');
        }
      }
    } catch {
      addToast('网络错误，请重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [hasSearchParams, buildSearchParams, page, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    // Will trigger fetchUsers via the useEffect because page/search params changed
    // We need to manually trigger once since the callback refs changed
    if (hasSearchParams) {
      setLoading(true);
      searchUsers(buildSearchParams()).then((res) => {
        if (res.code === 200 && res.data) {
          setUsers(res.data.records);
          setTotal(res.data.total);
        } else {
          addToast(res.msg || '搜索失败', 'error');
        }
        setLoading(false);
      }).catch(() => {
        addToast('网络错误', 'error');
        setLoading(false);
      });
    } else {
      setLoading(true);
      getUserPage(1, DEFAULT_PAGE_SIZE).then((res) => {
        if (res.code === 200 && res.data) {
          setUsers(res.data.records);
          setTotal(res.data.total);
        } else {
          addToast(res.msg || '获取列表失败', 'error');
        }
        setLoading(false);
      }).catch(() => {
        addToast('网络错误', 'error');
        setLoading(false);
      });
    }
  };

  const handleReset = () => {
    setSearchId('');
    setSearchName('');
    setSearchEmail('');
    setSearchPhone('');
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteUser(deleteTarget.id);
      if (res.code === 200) {
        addToast('用户删除成功', 'success');
        setDeleteTarget(null);
        fetchUsers();
      } else {
        addToast(res.msg || '删除失败', 'error');
        setDeleteTarget(null);
      }
    } catch {
      addToast('网络错误', 'error');
      setDeleteTarget(null);
    }
  };

  // Disable/Enable
  const handleDisable = async () => {
    if (!disableTarget) return;
    try {
      const res = await disableUser(disableTarget.id, { disabled: !disableTarget.disabled });
      if (res.code === 200) {
        addToast(res.msg || (disableTarget.disabled ? '用户已启用' : '用户已禁用'), 'success');
        setDisableTarget(null);
        fetchUsers();
      } else {
        addToast(res.msg || '操作失败', 'error');
        setDisableTarget(null);
      }
    } catch {
      addToast('网络错误', 'error');
      setDisableTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>用户管理</h1>
        <button className={styles.addBtn} onClick={() => setAddOpen(true)}>
          + 新增用户
        </button>
      </div>

      {/* Search Section */}
      <div className={styles.searchCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchField}>
            <label>ID</label>
            <input
              type="number"
              placeholder="按ID精确搜索"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchField}>
            <label>用户名</label>
            <input
              type="text"
              placeholder="模糊搜索"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchField}>
            <label>邮箱</label>
            <input
              type="text"
              placeholder="模糊搜索"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchField}>
            <label>电话</label>
            <input
              type="text"
              placeholder="模糊搜索"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.searchActions}>
          <button className={styles.searchBtn} onClick={handleSearch}>
            搜索
          </button>
          <button className={styles.resetBtn} onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>暂无用户数据</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>头像</th>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>年龄</th>
                  <th>性别</th>
                  <th>角色</th>
                  <th>电话</th>
                  <th>邮箱</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.disabled ? styles.disabledRow : ''}>
                    <td>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className={styles.avatar}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👤</text></svg>';
                        }}
                      />
                    </td>
                    <td>{u.id}</td>
                    <td>
                      <span className={styles.nameCell}>
                        {u.name}
                        {u.isMe && <span className={styles.meBadge}>我</span>}
                      </span>
                    </td>
                    <td>{u.age}</td>
                    <td>{genderLabel(u.gender)}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 1 ? styles.adminRole : ''}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td>{u.phone}</td>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${u.disabled ? styles.statusDisabled : styles.statusActive}`}>
                        {u.disabled ? '已禁用' : '正常'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => { setEditUser(u); setEditOpen(true); }}
                        >
                          编辑
                        </button>
                        <button
                          className={`${styles.actionBtn} ${u.disabled ? styles.enableBtn : styles.disableBtn}`}
                          onClick={() => setDisableTarget(u)}
                          disabled={u.isMe}
                          title={u.isMe ? '不能操作自己' : ''}
                        >
                          {u.disabled ? '启用' : '禁用'}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.isMe}
                          title={u.isMe ? '不能删除自己' : ''}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          current={page}
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          onChange={handlePageChange}
        />
      </div>

      {/* Add Modal */}
      <UserAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchUsers}
      />

      {/* Edit Modal */}
      <UserEditModal
        open={editOpen}
        user={editUser}
        onClose={() => { setEditOpen(false); setEditUser(null); }}
        onSaved={fetchUsers}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除用户"
        message={`确定要删除用户「${deleteTarget?.name ?? ''}」吗？此操作不可恢复。`}
        confirmText="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Disable Confirm */}
      <ConfirmDialog
        open={!!disableTarget}
        title={disableTarget?.disabled ? '启用用户' : '禁用用户'}
        message={
          disableTarget?.disabled
            ? `确定要启用用户「${disableTarget?.name ?? ''}」吗？`
            : `确定要禁用用户「${disableTarget?.name ?? ''}」吗？禁用后该用户将无法登录。`
        }
        confirmText={disableTarget?.disabled ? '启用' : '禁用'}
        danger={!disableTarget?.disabled}
        onConfirm={handleDisable}
        onCancel={() => setDisableTarget(null)}
      />
    </div>
  );
}
