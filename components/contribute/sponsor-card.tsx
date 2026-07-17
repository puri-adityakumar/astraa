export function SponsorCard() {
  return (
    <div className="text-center space-y-6">
      <p className="text-muted-foreground font-medium">Help support development and server costs</p>

      <div className="max-w-md mx-auto p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm flex items-center gap-4 text-left hover:bg-card/80 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            Sponsor <span className="font-logo">astraa</span>
          </p>
          <p className="text-xs text-muted-foreground truncate">Support open source work</p>
        </div>
        <div className="shrink-0">
          <iframe
            src="https://github.com/sponsors/puri-adityakumar/button"
            title="Sponsor astraa"
            height="32"
            width="114"
            style={{ border: 0, borderRadius: "6px" }}
          />
        </div>
      </div>
    </div>
  );
}
