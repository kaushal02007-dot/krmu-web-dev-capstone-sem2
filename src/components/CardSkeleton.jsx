export default function CardSkeleton({ size = "md" }) {
  const widths = { sm: "w-32", md: "w-40", lg: "w-48" };
  const heights = { sm: "h-48", md: "h-60", lg: "h-72" };

  return (
    <div className={`flex-shrink-0 ${widths[size]}`}>
      <div className={`${heights[size]} rounded-xl shimmer`} />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 rounded shimmer w-full" />
        <div className="h-2.5 rounded shimmer w-2/3" />
      </div>
    </div>
  );
}
