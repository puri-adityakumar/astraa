"use client";

export function SkipToContent() {
  const moveFocusToMain = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    const main = document.getElementById("main-content");
    if (!main) return;

    event.preventDefault();
    window.history.replaceState(null, "", "#main-content");
    main.focus();
    main.scrollIntoView({ block: "start" });
  };

  return (
    <a className="skip-to-main" href="#main-content" onClick={moveFocusToMain}>
      Skip to content
    </a>
  );
}
