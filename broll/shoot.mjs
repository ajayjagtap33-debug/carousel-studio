// One bundle, many outputs: stills (sheet / lint) and clip ranges, driven by scripts/broll.py.
//   node shoot.mjs <job.json>
// job = {comp, props, publicDir, stills?: [{frame, out, scale}], clips?: [{from, to, out, muted?, props?}], lint?: bool}
// Prints one line per result: `STILL <frame> <out>`, `LINT <frame> <json>`, `CLIP <out>`.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const job = JSON.parse(readFileSync(process.argv[2], "utf-8"));
const serveUrl = await bundle({ entryPoint: path.join(here, "src", "index.ts"), publicDir: job.publicDir });
const inputProps = job.props;
// the scenes pull ~19 Google Fonts over the network; 30s (Remotion's default) times out on a slow line
const TIMEOUT = 120000;
const composition = await selectComposition({ serveUrl, id: job.comp, inputProps, logLevel: "error",
  timeoutInMilliseconds: TIMEOUT });

for (const st of job.stills ?? []) {
  const logs = [];
  // a still may carry its own props (scripts/collage.py: one scene card per still, each its own size)
  const sp = st.props ?? inputProps;
  const sc = st.props ? await selectComposition({ serveUrl, id: job.comp, inputProps: sp, logLevel: "error", timeoutInMilliseconds: TIMEOUT }) : composition;
  await renderStill({ serveUrl, composition: sc, inputProps: sp, frame: st.frame, output: st.out, scale: st.scale ?? 1,
    logLevel: "error", timeoutInMilliseconds: TIMEOUT, onBrowserLog: (l) => logs.push(l.text) });
  console.log(`STILL ${st.frame} ${st.out}`);
  for (const t of logs) if (t.startsWith("LINT ")) console.log(`LINT ${st.frame} ${t.slice(5)}`);
}

// a clip may carry its own props (e.g. the same edit in another theme): one bundle, several versions
for (const c of job.clips ?? []) {
  const props = c.props ?? inputProps;
  const comp = c.props ? await selectComposition({ serveUrl, id: job.comp, inputProps: props, logLevel: "error",
    timeoutInMilliseconds: TIMEOUT }) : composition;
  // Concurrency is overridable: every worker seeks the same multi-hundred-MB cut, and at cores-2 the compositor
  // intermittently throws "No frame found at position N" (2026-10-29, 8 cores, a 216MB 1080p cut). Drop it to 3-4
  // for a cut that fails, at roughly half the speed.
  const conc = c.concurrency ?? job.concurrency ?? Math.max(1, os.cpus().length - 2);
  // scale 2 = 4K out of the 1920x1080 composition: type and strokes redraw sharp, a 4K cut keeps its pixels.
  // Frames are captured as PNG: Remotion's default JPEG q80 softens faces and bands the backdrop before x264 even runs.
  const scale = c.scale ?? job.scale ?? 1;
  const imageFormat = c.imageFormat ?? job.imageFormat ?? "png";
  const crf = c.crf ?? job.crf ?? 16;
  await renderMedia({ serveUrl, composition: comp, inputProps: props, codec: "h264", crf, muted: c.muted ?? true, colorSpace: "bt709",
    scale, imageFormat, x264Preset: c.x264Preset ?? job.x264Preset ?? "slow",
    frameRange: [c.from, c.to], outputLocation: c.out, concurrency: conc, logLevel: "error",
    timeoutInMilliseconds: TIMEOUT });
  console.log(`CLIP ${c.out}  (scale ${scale}, ${imageFormat}, crf ${crf}, concurrency ${conc})`);
}
