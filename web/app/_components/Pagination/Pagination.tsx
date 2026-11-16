import { ChevronIcon } from "../Icon/Icon";
import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <nav aria-label="Pages" className={styles.pagination}>
      <button
        type="button"
        aria-label="Previous page"
        className={styles.step}
        disabled={page === 1}
        onClick={onPrevious}
      >
        <ChevronIcon direction="left" />
      </button>
      <span aria-live="polite" className={styles.status}>
        {page} of {totalPages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        className={styles.step}
        disabled={page >= totalPages}
        onClick={onNext}
      >
        <ChevronIcon direction="right" />
      </button>
    </nav>
  );
}
