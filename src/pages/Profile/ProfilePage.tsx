import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import { updateMe } from '../../api/user';
import { genderLabel, formatDateTime } from '../../utils/format';
import type { UpdateMeRequest } from '../../types';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateMeRequest>({});
  const [error, setError] = useState('');

  if (!user) return null;

  const startEdit = () => {
    setForm({
      name: user.name,
      age: user.age,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
    });
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Build changed fields only
    const changed: UpdateMeRequest = {};
    if (form.name !== user.name) changed.name = form.name;
    if (form.age !== user.age) changed.age = form.age;
    if (form.gender !== user.gender) changed.gender = form.gender;
    if (form.phone !== user.phone) changed.phone = form.phone;
    if (form.email !== user.email) changed.email = form.email;
    if (form.password) changed.password = form.password;

    if (Object.keys(changed).length === 0) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await updateMe(changed);
      if (res.code === 200 && res.data) {
        updateUser(res.data);
        addToast(res.msg || '修改成功', 'success');
        setEditing(false);
      } else {
        setError(res.msg || '修改失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>个人中心</h1>
          {!editing && (
            <button className={styles.editBtn} onClick={startEdit}>
              编辑资料
            </button>
          )}
        </div>

        <div className={styles.avatarSection}>
          <img
            src={user.avatar}
            alt={user.name}
            className={styles.avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👤</text></svg>';
            }}
          />
          <div className={styles.avatarName}>{user.name}</div>
          <span className={styles.roleBadge}>
            {user.role === 1 ? '管理员' : '普通用户'}
          </span>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.formError}>{error}</div>}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>用户名</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={10}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>年龄</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.age ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  min={0}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>性别</label>
                <select
                  className={styles.select}
                  value={String(form.gender)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({
                      ...form,
                      gender: val === 'null' ? null : val === 'true',
                    });
                  }}
                >
                  <option value="true">男</option>
                  <option value="false">女</option>
                  <option value="null">保密</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>新密码（留空则不修改）</label>
                <input
                  type="password"
                  className={styles.input}
                  value={form.password ?? ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value || undefined })}
                  placeholder="留空则不修改密码"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>电话</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.phone ?? ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={11}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>邮箱</label>
                <input
                  type="email"
                  className={styles.input}
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={cancelEdit} disabled={loading}>
                取消
              </button>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>用户 ID</span>
              <span className={styles.infoValue}>{user.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>年龄</span>
              <span className={styles.infoValue}>{user.age}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>性别</span>
              <span className={styles.infoValue}>{genderLabel(user.gender)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>电话</span>
              <span className={styles.infoValue}>{user.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>邮箱</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>注册时间</span>
              <span className={styles.infoValue}>{formatDateTime(user.insertTime)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>最后更新</span>
              <span className={styles.infoValue}>{formatDateTime(user.updateTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
