import { FadeIn } from "./FadeIn";

function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  light = false,
  className = "",
}) {
  const alignClass =
    align === "left" ? "text-left items-start" : "text-center items-center mx-auto";

  return (
    <FadeIn className={`flex max-w-3xl flex-col ${alignClass} ${className}`}>
      {eyebrow ? (
        <p className={`site-eyebrow ${light ? "site-eyebrow--light" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2 className={`site-section-title mt-3 ${light ? "text-white" : ""}`}>{title}</h2>
      {lead ? (
        <p className={`site-section-lead ${light ? "text-slate-300 !max-w-2xl" : ""}`}>{lead}</p>
      ) : null}
    </FadeIn>
  );
}

export default SectionHeader;
