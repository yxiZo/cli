import * as fs from "node:fs";
import * as path from "node:path";
/**
 * 
 * @param projectName 
 * @returns 
 */
export function isValidPackageName(projectName) {
    // 
    return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
}

/**
 * @param projectName 
 * @returns 
 */
export function toValidPackageName(projectName) {
    return projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/[^a-z0-9-~]+/g, '-')
}


export function formatTargetDir(targetDir: string | undefined) {
    return targetDir?.trim().replace(/\/+$/g, '')
}

export function isEmpty(path: string) {
    const files = fs.readdirSync(path)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * 
 */
export function emptyDir(dir: string){
    // 不存在文件夹 直接返回
    if (!fs.existsSync(dir)) {
        return
    }
    for(const file of fs.readdirSync(dir)){
        if(file === '.git'){
            continue
        }
        fs.rmSync(path.resolve(dir, file), {recursive: true, force: true})
    }
}

export function copyDir(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, {recursive: true})
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
    }
}

export function copy(src: string, dest: string) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
      copyDir(src, dest)
    } else {
      fs.copyFileSync(src, dest)
    }
}
  
