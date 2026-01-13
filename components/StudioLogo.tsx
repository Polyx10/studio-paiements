export default function StudioLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-white tracking-wider">STUDIO</span>
          <span className="text-6xl font-bold text-yellow-400 italic">e</span>
        </div>
        <div className="text-white text-sm tracking-[0.3em] mt-1 font-light">
          ÉCOLE DE DANSE
        </div>
      </div>
    </div>
  )
}
