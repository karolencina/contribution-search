import { ChevronIcon } from "../Icon/Icon";
import type { Native } from "../native";
import styles from "./Pagination.module.css";

type StepProps = Omit<Native<"button">, "children" | "type" | "aria-label">;

function PaginationRoot(props: Native<"nav">) {
  return <nav {...props} className={styles.pagination} />;
}

function PaginationStep({
  direction,
  ...props
}: StepProps & { direction: "left" | "right" }) {
  return (
    <button
      {...props}
      type="button"
      aria-label={direction === "left" ? "Previous page" : "Next page"}
      className={styles.step}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function PaginationPrevious(props: StepProps) {
  return <PaginationStep {...props} direction="left" />;
}

function PaginationNext(props: StepProps) {
  return <PaginationStep {...props} direction="right" />;
}

function PaginationStatus(props: Native<"span">) {
  return <span {...props} className={styles.status} />;
}

export const Pagination = {
  Root: PaginationRoot,
  Previous: PaginationPrevious,
  Status: PaginationStatus,
  Next: PaginationNext,
};
