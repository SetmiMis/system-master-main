// Builds content/customer-map.json: an aggregated, anonymous map of where customers are.
// Inputs (never committed):
//   1. a text file of customer pincodes (export the Pincode column of CUSTOMER_MASTER), any whitespace-separated
//   2. the pincode -> [lat,lng] table (GeoNames, CC-BY 4.0) from the appscript project: PincodeGeo.js
// Output: land dots (every pincode centroid, rounded to a 0.2° grid, which draws India's shape) and
// customer cells (rounded to 0.5°, ~50 km, with counts). No names, addresses or individual pincodes are stored.
// Run: node scripts/build-customer-map.ts <pincodes.txt> "<path to appscript>/PincodeGeo.js"
import { readFileSync, writeFileSync } from "node:fs";

const [pinFile, geoFile] = process.argv.slice(2);
if (!pinFile || !geoFile) throw new Error("usage: build-customer-map.ts <pincodes.txt> <PincodeGeo.js>");

const src = readFileSync(geoFile, "utf8");
const table: Record<string, [number, number]> = JSON.parse(src.slice(src.indexOf("{"), src.indexOf("};") + 1));

const cell = (v: number, step: number) => Math.round(v / step) * step;
const key = (a: number, b: number) => `${a.toFixed(1)},${b.toFixed(1)}`;

const land = new Set<string>();
for (const [lat, lng] of Object.values(table)) land.add(key(cell(lat, 0.2), cell(lng, 0.2)));

const pins = readFileSync(pinFile, "utf8").split(/\s+/).map((p) => p.replace(/\D/g, "")).filter((p) => p.length === 6);
const counts = new Map<string, number>();
let mapped = 0;
for (const p of pins) {
  const ll = table[p];
  if (!ll) continue;
  mapped++;
  const k = key(cell(ll[0], 0.5), cell(ll[1], 0.5));
  counts.set(k, (counts.get(k) ?? 0) + 1);
}

const parse = (k: string) => k.split(",").map(Number);
const out = {
  source: "CUSTOMER_MASTER pincodes, aggregated to ~50 km cells; pincode centroids © GeoNames (CC-BY 4.0)",
  builtAt: new Date().toISOString().slice(0, 10),
  customersMapped: mapped,
  cells: counts.size,
  land: [...land].map(parse),
  customers: [...counts].map(([k, n]) => [...parse(k), n]).sort((a, b) => b[2] - a[2]),
};
writeFileSync(new URL("../content/customer-map.json", import.meta.url), JSON.stringify(out));
console.log(`pincodes read ${pins.length}, mapped ${mapped}, cells ${counts.size}, land dots ${land.size}`);
