// A 1K apartment drawn the way a Japanese listing sheet (間取り図) draws it.
// Decorative: the labels are part of the picture, not content to read out.
export function FloorPlan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 290"
      aria-hidden="true"
      className={className}
      fill="none"
      strokeLinecap="square"
    >
      <rect x="20" y="20" width="360" height="190" className="fill-white" />

      {/* Tatami: six mats laid in the usual pinwheel-free "futsujiki" rows. */}
      <g className="stroke-brand/35" strokeWidth="1.5">
        <path d="M227 20v190M303 20v190M150 115h230" />
      </g>

      <g className="stroke-brand" strokeWidth="1.5">
        <path d="M20 85h130M20 150h130M85 150v60" />
        <path d="M150 210v50h230v-50" strokeDasharray="5 5" />
      </g>

      <g className="stroke-brand" strokeWidth="5">
        <path d="M20 20h360v190H20V70" />
        <path d="M150 20v40M150 105v105" />
      </g>

      {/* Front door, swinging into the entrance. */}
      <g className="stroke-brand" strokeWidth="1.5">
        <path d="M20 70V26" />
        <path d="M20 26a44 44 0 0 1 44 44" strokeDasharray="3 4" />
      </g>

      <g
        lang="ja"
        className="fill-brand font-semibold"
        fontSize="13"
        textAnchor="middle"
      >
        <text x="265" y="108">和室 6帖</text>
        <text x="100" y="58">玄関</text>
        <text x="85" y="123">K</text>
        <text x="52" y="185">浴室</text>
        <text x="118" y="185">WC</text>
        <text x="265" y="241">バルコニー</text>
      </g>

      <g className="stroke-ink-muted" strokeWidth="1">
        <path d="M150 276h230M150 271v10M380 271v10" />
      </g>
      <text
        x="265"
        y="270"
        textAnchor="middle"
        fontSize="11"
        className="fill-ink-muted tabular-nums"
      >
        3.6 m
      </text>
    </svg>
  );
}
