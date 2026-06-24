import styles from './Pagination.module.css';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  // Build page numbers to display
  const pages: (number | '...')[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        上一页
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className={styles.dots}>...</span>
        ) : (
          <button
            key={p}
            className={`${styles.btn} ${styles.pageBtn} ${p === current ? styles.active : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.btn}
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
      >
        下一页
      </button>

      <span className={styles.info}>共 {total} 条</span>
    </div>
  );
}
