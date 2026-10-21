"""Advance widths from an .otf/.ttf (cmap + hmtx), so layouts can measure text exactly. No kerning."""
import struct


class Metrics:
    def __init__(self, path):
        d = open(path, "rb").read()
        tables = {}
        for i in range(struct.unpack(">H", d[4:6])[0]):
            tag, _, off, _ = struct.unpack(">4sIII", d[12 + 16 * i:28 + 16 * i])
            tables[tag.decode("latin1")] = off
        self.upem = struct.unpack(">H", d[tables["head"] + 18:tables["head"] + 20])[0]
        nh = struct.unpack(">H", d[tables["hhea"] + 34:tables["hhea"] + 36])[0]
        h = tables["hmtx"]
        self.adv = [struct.unpack(">H", d[h + 4 * k:h + 4 * k + 2])[0] for k in range(nh)]
        self.cmap = _cmap(d, tables["cmap"])
        a, dsc = struct.unpack(">hh", d[tables["hhea"] + 4:tables["hhea"] + 8])
        self.asc, self.desc = a / self.upem, -dsc / self.upem   # what browsers use for the text box

    def width(self, s, size):
        tot = 0
        for ch in s:
            g = self.cmap.get(ord(ch))
            tot += self.adv[min(g, len(self.adv) - 1)] if g is not None else self.upem * 0.55
        return tot / self.upem * size


def _cmap(d, off):
    H = lambda a: struct.unpack(">H", d[a:a + 2])[0]
    best = None
    for i in range(H(off + 2)):
        pid, eid, so = struct.unpack(">HHI", d[off + 4 + 8 * i:off + 12 + 8 * i])
        fmt = H(off + so)
        if (pid == 3 and eid in (1, 10)) or pid == 0:
            if fmt == 12 or (fmt == 4 and (best is None or best[1] != 12)):
                best = (off + so, fmt)
    if best is None: return {}
    a, fmt = best; out = {}
    if fmt == 4:
        seg2 = H(a + 6); ends = a + 14; starts = ends + seg2 + 2; deltas = starts + seg2; ros = deltas + seg2
        for k in range(seg2 // 2):
            end, start = H(ends + 2 * k), H(starts + 2 * k)
            delta = struct.unpack(">h", d[deltas + 2 * k:deltas + 2 * k + 2])[0]; ro = H(ros + 2 * k)
            for c in range(start, end + 1):
                if c == 0xFFFF: continue
                if ro == 0: g = (c + delta) & 0xFFFF
                else:
                    g = H(ros + 2 * k + ro + 2 * (c - start))
                    if g: g = (g + delta) & 0xFFFF
                if g: out[c] = g
    else:
        for k in range(struct.unpack(">I", d[a + 12:a + 16])[0]):
            s0, e0, g0 = struct.unpack(">III", d[a + 16 + 12 * k:a + 28 + 12 * k])
            for c in range(s0, e0 + 1): out[c] = g0 + c - s0
    return out
