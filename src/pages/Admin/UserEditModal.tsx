import { useState, useEffect, type FormEvent } from 'react';
import type { User, AdminUpdateUserRequest } from '../../types';
import { adminUpdateUser } from '../../api/admin';
import { useToast } from '../../components/Toast/Toast';
import Modal from '../../components/Modal/Modal';
import styles from './UserEditModal.module.css';

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserEditModal({ open, user, onClose, onSaved }: UserEditModalProps) {
  const { addToast } = useToast();
  const [form, setForm] = useState<AdminUpdateUserRequest>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        age: user.age,
        gender: user.gender,
        role: user.role,
        disabled: user.disabled,
        phone: user.phone,
        email: user.email,
      });
    }
    setError('');
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Build changed fields
    const changed: AdminUpdateUserRequest = {};
    if (form.name !== user.name) changed.name = form.name;
    if (form.age !== user.age) changed.age = form.age;
    if (form.gender !== user.gender) changed.gender = form.gender;
    if (form.role !== user.role) changed.role = form.role;
    if (form.disabled !== user.disabled) changed.disabled = form.disabled;
    if (form.phone !== user.phone) changed.phone = form.phone;
    if (form.email !== user.email) changed.email = form.email;
    if (form.password) changed.password = form.password;

    if (Object.keys(changed).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await adminUpdateUser(user.id, changed);
      if (res.code === 200 && res.data) {
        addToast(res.msg || '修改成功', 'success');
        onSaved();
        onClose();
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
    <Modal open={open} onClose={onClose} title={`编辑用户 - ${user?.name ?? ''}`} width="560px">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

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
            <label className={styles.label}>角色</label>
            <select
              className={styles.select}
              value={String(form.role ?? 0)}
              onChange={(e) =>
                setForm({ ...form, role: parseInt(e.target.value) as 0 | 1 })
              }
            >
              <option value={0}>普通用户</option>
              <option value={1}>管理员</option>
            </select>
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

        <div className={styles.row}>
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
          <div className={styles.field}>
            <label className={styles.label}>状态</label>
            <div className={styles.checkboxWrap}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={!form.disabled}
                  onChange={(e) => setForm({ ...form, disabled: !e.target.checked })}
                />
                <span>启用</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            取消
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
