#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";

import minimist from "minimist";
import prompts from "prompts";
import {
  blue,
  cyan,
  green,
  lightBlue,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from "kolorist";
import ejs from "ejs";
import { formatTargetDir, emptyDir,  copy } from "@utils/index";
import * as banners from "@utils/banners";

type ColorFunc = (str: string | number) => string;
type FrameworkVariant = {
  name: string;
  display: string;
  color: ColorFunc;
  // 自定义命令
  customCommand?: string;
};
type Framework = {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
};

// current work directory
const cwd = process.cwd();

// get command args
// const argv = minimist(process.argv.slice(2), {
//   alias: {
//     typescript: ["ts"],
//     "with-tests": ["tests"],
//     router: ["vue-router"],
//   },
//   string: ["_"],
//   // all arguments are treated as booleans
//   boolean: true,
// });

const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2), { string: ["_"] });

const FRAMEWORKS: Framework[] = [
  {
    name: "react",
    display: "React",
    color: cyan,
    variants: [
      {
        name: "react-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "react",
        display: "JavaScript",
        color: yellow,
      },
    ],
  },
];

const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultTargetDir = "temp-project";

/**
 *  init 函数
 *  获取命令行参数
 *
 */
async function init() {
  // show gradientBanner
  console.log();
  console.log(
    process.stdout.isTTY && process.stdout.getColorDepth() > 8
      ? banners.gradientBanner
      : banners.defaultBanner
  );
  console.log();
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;
  // #region 通过 prompts 获取自定义选项信息
  let result: prompts.Answers<
    "projectName" | "overwrite" | "packageName" | "framework" | "variant"
  >;

  try {
    result = await prompts([
      {
        type: argTargetDir ? null : "text",
        name: "projectName",
        message: reset("Project name:"),
        initial: defaultTargetDir,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir;
        },
      },
    ]);
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }
  // #endregion

  // user choice associated with prompts
  const { framework, overwrite, packageName, variant } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite === "yes") {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  // #region 决定使用的模版
  // TODO:
  let template: string = variant || framework?.name || argTemplate;
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template-${template}`
  );
  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
}
  const pkgInfo = { name: "", version: "" };
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");
  const { customCommand } =
    FRAMEWORKS.flatMap((f) => f.variants).find((v) => v.name === template) ??
    {};

  if (customCommand) {
    //
    const fullCustomCommand = "";
    const [command, ...args] = fullCustomCommand.split(" ");
    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) => arg.replace('TARGET_DIR', targetDir))
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }
  console.log(`\nScaffolding project in ${root}...`);
  // #endregion


  // 写入文件
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  // 写入 packages.json
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )
  pkg.name = packageName || getProjectName()
  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  
  // 执行 install 命令 和 dev 命令
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }

}

init().catch((e) => {
  console.error(e);
});
