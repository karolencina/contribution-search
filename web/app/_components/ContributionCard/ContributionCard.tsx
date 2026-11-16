import type { Contribution } from "../../useContributions";
import { Avatar } from "../Avatar/Avatar";
import styles from "./ContributionCard.module.css";

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

export function ContributionCard({ item }: { item: Contribution }) {
  const start = new Date(item.startTime);
  return (
    <li className={styles.card}>
      <h2 className={styles.title} title={item.title}>
        {item.title}
      </h2>
      <div className={styles.field}>
        <span className={styles.label}>Owner</span>
        <span className={styles.owner}>
          <Avatar name={item.owner} />
          {item.owner}
        </span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Starts</span>
        <time className={styles.time} dateTime={item.startTime}>
          <span className={styles.date}>{dateFormat.format(start)}</span>{" "}
          {timeFormat.format(start)}
        </time>
      </div>
    </li>
  );
}
