// Refluke b-roll for a real cut: scenes from broll.json, timed to the transcript.
// B-roll only — Ajay places his face in Google Vids, in the zone each placement keeps clear.
// Placement must vary beat to beat (library.md §3); `pip` is the only mode where the face moves.
import React from "react";
import { Audio, staticFile } from "remotion";
import { R } from "./theme";
import { ThemeCtx, LintCtx, useNow } from "./kit";
import { Beat, FacePip, Frame } from "./frame";
import { Lint } from "./lint";
import { RSCENES, type RScene } from "./scenes";
import type { Props } from "../types";

// Omit rather than intersect: Props.scenes is Scene[], and an intersection would make this
// Scene[] & RScene[], which nothing can satisfy cleanly.
export type ReflukeProps = Omit<Props, "scenes"> & {
  audio?: string;
  withAudio?: boolean;
  faceGuide?: boolean;
  lint?: boolean;
  scenes: RScene[];
};

export const ReflukeMain: React.FC<ReflukeProps> = (p) => {
  const t = useNow();
  const scenes = [...p.scenes].sort((a, b) => a.start - b.start);
  const active = scenes.find((s) => t >= s.start - 0.01 && t <= s.end + 0.01);
  const placement = active?.placement ?? "tab-right";
  const corner = (active?.pip as string | undefined) ?? "br";

  const frame = (
    <Frame placement={placement} faceGuide={p.faceGuide}>
      {scenes.map((s, i) => {
        const View = RSCENES[s.type];
        return (
          <Beat key={i} from={s.start} to={s.end} placement={s.placement ?? "tab-right"}>
            {View ? <View s={s} /> : (
              <div style={{ color: "red", fontFamily: R.ui, fontSize: 40 }}>
                unknown scene type: {s.type}
              </div>
            )}
          </Beat>
        );
      })}
      {placement === "pip" && <FacePip corner={corner as "bl" | "br" | "tl" | "tr"} />}
    </Frame>
  );

  return (
    <ThemeCtx.Provider value={R}>
      <LintCtx.Provider value={!!p.lint}>
        {p.lint ? <Lint placement={placement} corner={corner}>{frame}</Lint> : frame}
      </LintCtx.Provider>
      {p.withAudio && p.audio && <Audio src={staticFile(p.audio)} />}
    </ThemeCtx.Provider>
  );
};
