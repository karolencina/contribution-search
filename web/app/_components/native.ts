import type { ComponentProps, JSX } from "react";

export type Native<Tag extends keyof JSX.IntrinsicElements> = Omit<
  ComponentProps<Tag>,
  "className"
>;
