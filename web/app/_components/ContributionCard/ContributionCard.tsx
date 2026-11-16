import type { Native } from "../native";
import styles from "./ContributionCard.module.css";

function ContributionCardRoot(props: Native<"li">) {
  return <li {...props} className={styles.card} />;
}

function ContributionCardTitle(props: Native<"h2">) {
  return <h2 {...props} className={styles.title} />;
}

function ContributionCardField({
  label,
  children,
  ...props
}: Native<"div"> & { label: string }) {
  return (
    <div {...props} className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  );
}

export const ContributionCard = {
  Root: ContributionCardRoot,
  Title: ContributionCardTitle,
  Field: ContributionCardField,
};
