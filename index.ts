#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

import minimist from "minimist";
import prompts from "prompts";
import { red, green, bold } from "kolorist";
import ejs from "ejs";

import * as banners from "./utils/banners";
import { renderTemplate } from './utils/renderTemplate'

async function init() {
  // show gradientBanner
  console.log();
  console.log(
    process.stdout.isTTY && process.stdout.getColorDepth() > 8
      ? banners.gradientBanner
      : banners.defaultBanner
  );
  console.log();
  // current work directory
  const cwd = process.cwd();

  
  // get command args
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ["ts"],
      "with-tests": ["tests"],
      router: ["vue-router"],
    },
    string: ["_"],
    // all arguments are treated as booleans
    boolean: true,
  });
  //    
  let targetDir = argv._[0]

  let result: {
    projectName?: string;
  } = {};

  try {
    // TODO: Add prompts
    result = await prompts([
      {
        name: "projectName",
        type: "text",
        message: "input projectName:",
        initial: "example",
      },
      {
        type: "number",
        name: "value",
        message: "How old are you?",
        validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
      },
    ]);
  } catch (cancelled) {
    console.log(cancelled.message);
    // exit program
    process.exit(1);
  }

  const { projectName } = result;

  // get absolute dir
  const root = path.join(cwd, targetDir)

  // check dir is empty
  if (fs.existsSync(root)) {
    // emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  const pkg = { name: projectName, version: '0.0.0' }
  // generate package.json version
  fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(pkg, null, 2))

  /**
   *  choose template
   */
  const templateRoot = path.resolve(__dirname, 'template')
  const callbacks = []
  //   
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName)
    // renderTemplate(templateDir, root, callbacks)
  }

  // call render methods
  render('base')
  let needsJsx = true
  if (needsJsx) {
    render('config/jsx')
  }
}

init().catch((e) => {
  console.error(e);
});
