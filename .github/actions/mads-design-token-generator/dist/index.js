import * as core from "@actions/core";
import axios from "axios";
import fs$1 from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
var findClosetFile = (start, fileName) => {
  let dir = start;
  while (true) {
    const targetPath = path.join(dir, fileName);
    if (fs.existsSync(targetPath)) {
      return path.dirname(targetPath);
    }
    const parentDir = path.resolve(dir, "..");
    if (parentDir === dir) {
      throw new Error(`'${fileName}' not found upward from ${start}`);
    }
    dir = parentDir;
  }
};
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var getMonorepoRootPath = () => {
  return findClosetFile(__dirname, "pnpm-workspace.yaml");
};
const to255 = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255);
const rgbaToCss = ({
  r,
  g,
  b,
  a = 1
}) => {
  if (a === 1) {
    return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
  }
  return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a})`;
};
const toKebab = (input) => {
  let s = input.trim();
  s = s.replace(/[\s_]+/g, "-");
  s = s.replace(/[A-Z]{2,}/g, (m) => m.split("").join("-"));
  s = s.replace(/([^-\n])([A-Z])/g, "$1-$2");
  s = s.toLowerCase();
  s = s.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return s;
};
const isObject = (v) => typeof v === "object" && v !== null;
const hasFills = (d) => isObject(d) && Array.isArray(d.fills);
const isTextDocument = (d) => isObject(d) && "type" in d && d.type === "TEXT" && "style" in d && isObject(d.style);
(async () => {
  const FIGMA_ACCESS_TOKEN = core.getInput("FIGMA_ACCESS_TOKEN", { required: true });
  console.log(`⌛️ figma styles data 조회`);
  const stylesRes = await axios.get(
    "https://api.figma.com/v1/files/lAbzqUQAovN15n5n6g6Zxl/styles",
    {
      headers: {
        "X-Figma-Token": `${FIGMA_ACCESS_TOKEN}`
      }
    }
  );
  const { styles } = stylesRes.data.meta;
  const allNodeIds = styles.map((s) => s.node_id);
  console.log(`⌛️ => 조회된 styles data node id 개수 : ${allNodeIds.length}`);
  console.log(`⌛️ figma node data 조회`);
  const nodesRes = await axios.get(
    "https://api.figma.com/v1/files/lAbzqUQAovN15n5n6g6Zxl/nodes",
    {
      headers: {
        "X-Figma-Token": `${FIGMA_ACCESS_TOKEN}`
      },
      params: {
        ids: allNodeIds.join(",")
      }
    }
  );
  const { nodes } = nodesRes.data;
  console.log(`⌛️ => 조회된 node 개수 : ${Object.entries(nodes).length}`);
  const cssVars = [];
  console.log(`⌛️ 토큰 생성`);
  styles.forEach((style) => {
    const { document } = nodes[style.node_id];
    if (!document) {
      return;
    }
    const path2 = style.name.replace(/\([^)]*\)/g, "").split("/").map(toKebab);
    if (style.style_type === "FILL") {
      if (hasFills(document)) {
        const fill = document.fills[0];
        if (fill.type === "SOLID") {
          const css = rgbaToCss({
            r: fill.color.r,
            g: fill.color.g,
            b: fill.color.b,
            a: fill.opacity ? fill.opacity : fill.color.a
          });
          cssVars.push({
            namespace: "color",
            key: `${path2.join("-")}`,
            value: css
          });
        }
      }
    }
    if (style.style_type === "TEXT") {
      if (isTextDocument(document)) {
        Object.entries(document.style).forEach(([key, value]) => {
          if (value === null) {
            return;
          }
          if (typeof value === "object") {
            return;
          }
          if (key.includes("fontFamily")) {
            cssVars.push({
              namespace: "font",
              key: `${path2.join("-")}`,
              value
            });
          } else if (key.includes("fontWeight")) {
            cssVars.push({
              namespace: "font-weight",
              key: `${path2.join("-")}`,
              value
            });
          } else if (key.includes("fontSize")) {
            cssVars.push({
              namespace: "text",
              key: `${path2.join("-")}`,
              value: `${value}px`
            });
          } else if (key.includes("lineHeightPx")) {
            cssVars.push({
              namespace: "leading",
              key: `${path2.join("-")}`,
              value: `${value}px`
            });
          } else if (key.includes("letterSpacing")) {
            cssVars.push({
              namespace: "tracking",
              key: `${path2.join("-")}`,
              value: `${value}px`
            });
          }
        });
      }
    }
    if (style.style_type === "EFFECT") ;
    if (style.style_type === "GRID") ;
  });
  console.log(`⌛️ => 생성된 토큰 개수 : ${cssVars.length}`);
  const lines = ["@theme {"];
  cssVars.forEach((cssVar) => {
    if (cssVar.namespace === "custom") {
      lines.push(`  --${cssVar.key}: ${cssVar.value};`);
    } else {
      lines.push(`  --${cssVar.namespace}-${cssVar.key}: ${cssVar.value};`);
    }
  });
  lines.push("}");
  const themeCss = lines.join("\n");
  const root = getMonorepoRootPath();
  const themeDir = `${root}/packages/mads/src/foundation/theme.css`;
  fs$1.writeFileSync(themeDir, themeCss);
  console.log(`🚀 토큰이 ${themeDir}에 생성되었습니다.`);
})();
