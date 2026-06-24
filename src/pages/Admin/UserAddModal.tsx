import { useState, type FormEvent } from 'react';
import type { AdminAddUserRequest } from '../../types';
import { addUser } from '../../api/admin';
import { useToast } from '../../components/Toast/Toast';
import Modal from '../../components/Modal/Modal';
import styles from './UserEditModal.module.css';

interface UserAddModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const INITIAL_FORM: AdminAddUserRequest = {
  name: '',
  age: 0,
  gender: null,
  password: '',
  role: 0,
  disabled: false,
  phone: '',
  email: '',
};

export default function UserAddModal({ open, onClose, onSaved }: UserAddModalProps) {
  const { addToast } = useToast();
  const [form, setForm] = useState<AdminAddUserRequest>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 前端校验必填字段
    if (!form.name.trim()) {
      setError('用户名不能为空');
      return;
    }
    if (!form.password) {
      setError('密码不能为空');
      return;
    }
    if (!form.phone.trim()) {
      setError('电话号码不能为空');
      return;
    }
    if (!form.email.trim()) {
      setError('邮箱不能为空');
      return;
    }
    if (form.age < 0) {
      setError('年龄不能为负数');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await addUser(form);
      if (res.code === 200 && res.data) {
        addToast(res.msg || '用户新增成功', 'success');
        resetForm();
        onSaved();
        onClose();
      } else {
        setError(res.msg || '新增用户失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="新增用户" width="560px">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>用户名 *</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={10}
              placeholder="请输入用户名"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>年龄 *</label>
            <input
              type="number"
              className={styles.input}
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value ? parseInt(e.target.value) : 0 })
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
            <label className={styles.label}>电话 *</label>
            <input
              type="text"
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={11}
              placeholder="请输入电话号码"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>邮箱 *</label>
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              maxLength={100}
              placeholder="请输入邮箱"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>密码 *</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="请输入密码"
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
          <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
            取消
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? '创建中...' : '创建'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
