import { Card } from "@/components/ui/card"

export function HolographicCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border border-border h-[420px] bg-card animate-pulse">
      {/* Top badges area */}
      <div className="absolute top-4 left-4 z-10">
        <div className="w-12 h-6 bg-muted rounded-full"></div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="w-16 h-6 bg-muted rounded-full"></div>
      </div>

      <div className="relative p-6 h-full flex flex-col">
        {/* Pokemon image area */}
        <div className="relative mb-1 flex justify-center flex-shrink-0">
          <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-muted/20">
            <div className="w-32 h-32 bg-muted rounded-full"></div>
          </div>
        </div>

        {/* Name and description */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="h-8 bg-muted rounded-md mb-2 w-3/4 mx-auto"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mx-auto"></div>
        </div>

        {/* Type badges */}
        <div className="flex justify-center gap-2 mb-6 flex-shrink-0">
          <div className="h-6 w-16 bg-muted rounded-full"></div>
          <div className="h-6 w-20 bg-muted rounded-full"></div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 flex-shrink-0">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-muted/20">
              <div className="flex items-center justify-center mb-2">
                <div className="w-5 h-5 bg-muted rounded"></div>
              </div>
              <div className="h-6 bg-muted rounded mb-1 w-8 mx-auto"></div>
              <div className="h-3 bg-muted rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient area */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted/30 to-transparent"></div>
    </Card>
  )
}
