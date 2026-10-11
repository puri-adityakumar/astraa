import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { AstraaHomeRefreshPreview as AstraaHomeRefreshPreview2 } from "@/components/design-preview/astraa-refresh-previews";
import { AstraaToolsRefreshPreview as AstraaToolsRefreshPreview2 } from "@/components/design-preview/astraa-refresh-previews";
import { AstraaToolWorkspaceRefreshPreview as AstraaToolWorkspaceRefreshPreview2 } from "@/components/design-preview/astraa-refresh-previews";

export default function AstraaRefreshDirectionsCanvas() {
  return (
    <Canvas name="Astraa Refresh Directions" backgroundColor="#232323">
      <Storyboard
        id="AstraaHomeRefreshPreview"
        name="01 · Home / task-first entry"
        component={AstraaHomeRefreshPreview2}
        layout={{ x: 0, y: 0, width: 1200, height: 900, intrinsicSizing: "root-element" }}
      />
      <Storyboard
        id="AstraaToolsRefreshPreview"
        name="02 · Tools / outcome-led catalogue"
        component={AstraaToolsRefreshPreview2}
        layout={{ x: 1250, y: 0, width: 1200, height: 900, intrinsicSizing: "root-element" }}
      />
      <Storyboard
        id="AstraaToolWorkspaceRefreshPreview"
        name="03 · Tool / trust-forward workspace"
        component={AstraaToolWorkspaceRefreshPreview2}
        layout={{ x: 0, y: 950, width: 1200, height: 900, intrinsicSizing: "root-element" }}
      />
    </Canvas>
  );
}
