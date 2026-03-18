export default function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`skeleton ${className}`} />;
}
