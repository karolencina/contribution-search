import type { Contribution } from "../../useContributions";
import { Avatar } from "../Avatar/Avatar";
import { ContributionCard } from "../ContributionCard/ContributionCard";
import styles from "./ContributionList.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

type ContributionListProps = { items: Contribution[]; isLoading: boolean };

export function ContributionList({ items, isLoading }: ContributionListProps) {
  return (
    <ul className={styles.list} aria-busy={isLoading}>
      {items.map((item) => {
        const start = new Date(item.startTime);
        return (
          <ContributionCard.Root key={item.id}>
            <ContributionCard.Title>{item.title}</ContributionCard.Title>
            <ContributionCard.Field label="Owner">
              <span className={styles.owner}>
                <Avatar name={item.owner} />
                {item.owner}
              </span>
            </ContributionCard.Field>
            <ContributionCard.Field label="Starts">
              <time className={styles.time} dateTime={item.startTime}>
                <span className={styles.date}>{dateFormat.format(start)}</span>{" "}
                {timeFormat.format(start)}
              </time>
            </ContributionCard.Field>
          </ContributionCard.Root>
        );
      })}
    </ul>
  );
}
