// Storyboard1 — an example of CANVAS-LOCAL, isolated UI.
//
// Code in a storyboard file like this is UI-only work that is NOT used by your
// real app. It lives ONLY on this canvas, as a sketch / playground. When you
// want a component to actually ship in your app, build it in your app's source
// (OUTSIDE the tempo/ folder, e.g. <projectRoot>/src/...) and import it onto a
// canvas instead — see the commented example in index.canvas.tsx.

export default function Storyboard1() {
  return (
    <div className="min-h-[200px] flex items-center justify-center rounded-xl border border-black/10 bg-white p-8">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-black/40 mb-2">
          Canvas-local example
        </div>
        <div className="text-lg font-semibold text-black/80">
          Edit Storyboard1.tsx to sketch isolated UI here
        </div>
      </div>
    </div>
  );
}
