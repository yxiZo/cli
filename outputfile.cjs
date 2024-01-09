#!/usr/bin/env node

// utils/banners.ts
var defaultBanner = "Vue.js - The Progressive JavaScript Framework";

// index.ts
async function init() {
  console.log();
  console.log(
    defaultBanner
  );
  console.log();
  const cwd = process.cwd();
}
init().catch((e) => {
  console.error(e);
});
