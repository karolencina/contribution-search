import type { Contribution } from "../../useContributions";
import { ContributionCard } from "../ContributionCard/ContributionCard";
import styles from "./ContributionList.module.css";

type ContributionListProps = { items: Contribution[]; isLoading: boolean };

export function ContributionList({ items, isLoading }: ContributionListProps) {
  return (
    <ul className={styles.list} aria-busy={isLoading}>
      {items.map((item) => (
        <ContributionCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
