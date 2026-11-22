// A 1K apartment drawn the way a Japanese listing sheet (間取り図) draws it.
// Decorative: the labels are part of the picture, not content to read out.
// It is drawn in the current text colour, so it works on any background.
export function FloorPlan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 290"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
    >
      <rect
        x="20"
        y="20"
        width="360"
        height="190"
        stroke="none"
        fill="currentColor"
        fillOpacity="0.07"
      />

      {/* Tatami: six mats. */}
      <path
        d="M227 20v190M303 20v190M150 115h230"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      <g strokeWidth="1.5">
        <path d="M20 85h130M20 150h130M85 150v60" />
        <path d="M150 210v50h230v-50" strokeDasharray="5 5" />
      </g>

      <g strokeWidth="5">
        <path d="M20 20h360v190H20V70" />
        <path d="M150 20v40M150 105v105" />
      </g>

      {/* Front door, swinging into the entrance. */}
      <g strokeWidth="1.5">
        <path d="M20 70V26" />
        <path d="M20 26a44 44 0 0 1 44 44" strokeDasharray="3 4" />
      </g>

      <g
        lang="ja"
        stroke="none"
        fill="currentColor"
        fontSize="13"
        fontWeight="600"
        textAnchor="middle"
      >
        <text x="265" y="108">和室 6帖</text>
        <text x="100" y="58">玄関</text>
        <text x="85" y="123">K</text>
        <text x="52" y="185">浴室</text>
        <text x="118" y="185">WC</text>
        <text x="265" y="241">バルコニー</text>
      </g>

      <g strokeOpacity="0.6">
        <path d="M150 276h230M150 271v10M380 271v10" strokeWidth="1" />
      </g>
      <text
        x="265"
        y="270"
        textAnchor="middle"
        fontSize="11"
        stroke="none"
        fill="currentColor"
        fillOpacity="0.7"
      >
        3.6 m
      </text>
    </svg>
  );
}
