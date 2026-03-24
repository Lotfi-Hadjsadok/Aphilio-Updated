"use client";

import { useEffect, useState } from "react";

/** Stable reference for callers; avoids unnecessary effect runs when passed as `options`. */
export const FORMAT_DATE_SHORT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

type FormattedDateProps = {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  locale?: string | Intl.LocalesArgument;
  className?: string;
  /** Shown until the client formats (matches server + first client paint). */
  placeholder?: string;
};

/**
 * Locale-aware date string, formatted only after mount so server HTML matches the client
 * and hydration stays stable across timezones/locales.
 */
export function FormattedDate({
  date,
  options = FORMAT_DATE_SHORT,
  locale,
  className,
  placeholder = "-",
}: FormattedDateProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      setLabel(placeholder);
      return;
    }
    setLabel(parsed.toLocaleDateString(locale, options));
  }, [date, locale, options, placeholder]);

  return <span className={className}>{label ?? placeholder}</span>;
}
