import styles from "./Avatar.module.css";

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "";
  }
  const firstAndLast =
    words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return firstAndLast.map((word) => Array.from(word)[0].toUpperCase()).join("");
}

export function Avatar({ name }: { name: string }) {
  const letters = initials(name);
  if (letters === "") {
    return null;
  }
  return (
    <span className={styles.avatar} aria-hidden="true">
      {letters}
    </span>
  );
}
