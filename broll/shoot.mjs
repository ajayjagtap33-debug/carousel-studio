// One bundle, many outputs: stills (sheet / lint) and clip ranges, driven by scripts/broll.py.
//   node shoot.mjs <job.json>
// job = {comp, props, publicDir, stills?: [{frame, out, scale}], clips?: [{from, to, out}], lint?: bool}
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
const composition = await selectComposition({ serveUrl, id: job.comp, inputProps, logLevel: "error" });

for (const st of job.stills ?? []) {
  const logs = [];
  await renderStill({ serveUrl, composition, inputProps, frame: st.frame, output: st.out, scale: st.scale ?? 1,
    logLevel: "error", onBrowserLog: (l) => logs.push(l.text) });
  console.log(`STILL ${st.frame} ${st.out}`);
  for (const t of logs) if (t.startsWith("LINT ")) console.log(`LINT ${st.frame} ${t.slice(5)}`);
}

for (const c of job.clips ?? []) {
  await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf: 18, muted: true, colorSpace: "bt709",
    frameRange: [c.from, c.to], outputLocation: c.out, concurrency: Math.max(1, os.cpus().length - 2), logLevel: "error" });
  console.log(`CLIP ${c.out}`);
}
