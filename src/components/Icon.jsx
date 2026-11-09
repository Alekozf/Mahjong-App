// Simple stroke icons drawn for this project. Decorative by default; pass `label` to expose one.
const paths = {
  // Navigation icons: chunky, filled shapes in the style of the Learn concept.
  // Session: a games table (thick top, apron, splayed legs).
  session: (
    <>
      <rect x="1" y="6.5" width="22" height="4.6" rx="1.8" fill="currentColor" stroke="none" />
      <path d="M4.6 11L3.8 19.5M19.4 11L20.2 19.5" strokeWidth="2.6" />
      <path d="M5 14.6h14" strokeWidth="2" />
    </>
  ),
  // Learn: a mortarboard with a tassel.
  learn: (
    <>
      <path d="M12 3.5L23 8.8L12 14.1L1 8.8Z" fill="currentColor" stroke="none" />
      <path d="M5.5 11.4v4.4c0 1.8 2.9 3.3 6.5 3.3s6.5-1.5 6.5-3.3v-4.4L12 14.6Z" fill="currentColor" stroke="none" />
      <path d="M20.6 9.8v5.4" strokeWidth="1.8" />
      <circle cx="20.6" cy="16.4" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  reference: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3 5v13.5c4-.5 6.8 0 9 1.5 2.2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5z" strokeWidth="2.3" />
      <path d="M12 6.5v13.3" strokeWidth="2.3" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  retry: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4 4.5v4h4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </>
  ),
  explain: (
    <>
      <path d="M4 5.5h16v10H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  watch: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  friend: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M3 19c.5-3.5 2.8-5.5 5.5-5.5S13.5 15.5 14 19M14.5 14c2.8-.4 5.7 1 6.5 4.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.4" />
    </>
  ),
};

export default function Icon({ name, size = 24, label, className = '' }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
    >
      {paths[name]}
    </svg>
  );
}
