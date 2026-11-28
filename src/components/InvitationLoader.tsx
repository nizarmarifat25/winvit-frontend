interface InvitationLoaderProps {
  visible: boolean
  variant?: "light" | "dark"
  eyebrow?: string
  title?: string
  subtitle?: string
  monogram?: string
}

export function InvitationLoader({
  visible,
  variant = "dark",
  eyebrow = "Invitaa",
  title = "Menyiapkan Undangan",
  subtitle = "Mohon tunggu sejenak...",
  monogram,
}: InvitationLoaderProps) {
  const isLight = variant === "light"

  return (
    <div
      aria-hidden={!visible}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center select-none transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-[1.015] pointer-events-none"
      } ${
        isLight
          ? "bg-[radial-gradient(ellipse_at_center,_#FFFDF9_0%,_#FAF6F1_58%,_#EFE5D8_100%)] text-[#2C2018]"
          : "bg-[radial-gradient(ellipse_at_center,_#181A24_0%,_#0D0F16_62%,_#07080C_100%)] text-[#F6EFE6]"
      }`}
    >
      {/* Soft ambient champagne glow */}
      <div
        className={`pointer-events-none absolute w-72 h-72 rounded-full blur-3xl ${
          isLight ? "bg-[#C89B57]/16" : "bg-[#C89B57]/12"
        }`}
      />

      {/* Bespoke double-hairline monogram emblem */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-6">
        {/* Outer slow-orbiting hairline ring + gold pearl */}
        <div
          className={`absolute inset-0 rounded-full border animate-inv-orbit ${
            isLight ? "border-[#C89B57]/35" : "border-[#D8B472]/28"
          }`}
        >
          <span
            className={`absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
              isLight
                ? "bg-[#B8843B] shadow-[0_0_8px_rgba(184,132,59,0.65)]"
                : "bg-[#E6C785] shadow-[0_0_10px_rgba(230,199,133,0.75)]"
            }`}
          />
        </div>

        {/* Inner breathing diamond hairline */}
        <div
          className={`absolute inset-3 rounded-[4px] border animate-inv-breathe ${
            isLight ? "border-[#C89B57]/45" : "border-[#D8B472]/35"
          }`}
        />

        {/* Center monogram or 4-point star */}
        <div className="relative z-10 flex items-center justify-center">
          {monogram ? (
            <span
              className={`font-serif-display italic text-lg tracking-wider ${
                isLight ? "text-[#8B6229]" : "text-[#E6C785]"
              }`}
            >
              {monogram}
            </span>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className={isLight ? "text-[#A8763E]" : "text-[#E6C785]"}
              aria-hidden="true"
            >
              <path
                d="M12 2.5L13.9 10.1L21.5 12L13.9 13.9L12 21.5L10.1 13.9L2.5 12L10.1 10.1L12 2.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="currentColor"
                fillOpacity="0.16"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Editorial typography */}
      <div className="relative z-10 max-w-xs space-y-1.5">
        <p
          className={`font-cinzel text-[10px] uppercase tracking-[0.34em] ${
            isLight ? "text-[#A8763E]" : "text-[#D8B472]/85"
          }`}
        >
          {eyebrow}
        </p>

        <h2
          className={`font-serif-display italic text-2xl sm:text-[26px] leading-snug tracking-tight ${
            isLight ? "text-[#2C2018]" : "text-[#FAF5EE]"
          }`}
        >
          {title}
        </h2>

        <p
          className={`text-[11px] tracking-wide pt-0.5 ${
            isLight ? "text-[#7A6758]" : "text-white/55"
          }`}
        >
          {subtitle}
        </p>
      </div>

      {/* Silk gold shimmer hairline */}
      <div
        className={`relative z-10 mt-6 w-36 h-[1.5px] rounded-full overflow-hidden ${
          isLight ? "bg-[#C89B57]/20" : "bg-white/12"
        }`}
      >
        <div
          className={`h-full w-1/2 rounded-full animate-inv-shimmer ${
            isLight
              ? "bg-gradient-to-r from-transparent via-[#B8843B] to-transparent"
              : "bg-gradient-to-r from-transparent via-[#E6C785] to-transparent"
          }`}
        />
      </div>
    </div>
  )
}
