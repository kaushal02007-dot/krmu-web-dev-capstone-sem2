export default function HeroSkeleton() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "92vh", minHeight: 520 }}>
      <div className="absolute inset-0 shimmer" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      <div className="absolute bottom-28 left-8 md:left-16 space-y-4">
        <div className="h-4 w-24 rounded shimmer opacity-50" />
        <div className="h-14 w-96 rounded-lg shimmer opacity-40" />
        <div className="h-14 w-72 rounded-lg shimmer opacity-30" />
        <div className="h-4 w-80 rounded shimmer opacity-30 mt-2" />
        <div className="h-4 w-64 rounded shimmer opacity-20" />
        <div className="flex gap-3 mt-4">
          <div className="h-12 w-36 rounded-xl shimmer opacity-40" />
          <div className="h-12 w-32 rounded-xl shimmer opacity-30" />
          <div className="h-12 w-12 rounded-full shimmer opacity-30" />
        </div>
      </div>
    </div>
  );
}
