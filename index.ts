#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

import minimist from 'minimist';
import prompts from 'prompts';
import { red, green, bold } from 'kolorist';
import ejs from 'ejs';

import * as banners from './utils/banners'

async function init() {
    // show gradientBanner
    console.log()
    console.log(
      process.stdout.isTTY && process.stdout.getColorDepth() > 8
        ? banners.gradientBanner
        : banners.defaultBanner
    )
    console.log()
    // current work directory
    const cwd = process.cwd()
}

init().catch((e) => {
    console.error(e)
})
