"use client";

import { useRef } from "react";

import { CloseIcon, SearchIcon } from "../Icon/Icon";
import styles from "./SearchField.module.css";

type SearchFieldProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
};

export function SearchField({ label, value, onChange }: SearchFieldProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.search} role="search">
      <SearchIcon />
      <input
        ref={input}
        className={styles.input}
        type="search"
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value !== "" && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            input.current?.focus();
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
