#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import glob from "glob";
import { program } from "commander";
import { prompt } from "inquirer"
import clc from "cli-color";
import packageJSON from "./package.json";

const updateAndroidVersion = async () => {
  const buildGradle = await readFile('android/app/build.gradle', 'utf8');

  const currentVersionName = /versionName\s*"(.*)"/g.exec(buildGradle)?.[1];
  const currentVersionCode = /versionCode\s*(\d*)/g.exec(buildGradle)?.[1];

  if (!currentVersionName || !currentVersionCode) {
    console.error(clc.redBright(`Could not find versionName or versionCode in android/app/build.gradle`));
    process.exit(1);
  }

  const recommendedVersionName = (parseFloat(currentVersionName) + 0.1).toFixed(1);
  const recommendedVersionCode = parseInt(currentVersionCode) + 1;

  console.log(clc.blue("info"), "Current 🤖 Android version name:", clc.yellow(currentVersionName));
  const { versionName } = await prompt({
    type: "input",
    name: "versionName",
    message: "New Android version name:",
    default: recommendedVersionName,
    validate: (input) => {
      if (!input) {
        return "Please enter a version name";
      }
      return true;
    },
  })

  console.log(clc.blue("info"), "Current 🤖 Android version code:", clc.yellow(currentVersionCode));
  const { versionCode } = await prompt({
    type: "input",
    name: "versionCode",
    message: "New Android version code:",
    default: recommendedVersionCode,
    validate: (input) => {
      if (!input) {
        return "Please enter a version code";
      }
      return true;
    },
  })

  await writeFile(
    'android/app/build.gradle',
    buildGradle
      .replace(`versionName "${currentVersionName}"`, `versionName "${versionName}"`)
      .replace(`versionCode ${currentVersionCode}`, `versionCode ${versionCode}`),
  )

  console.log(
    clc.green("success"),
    "Updated 🤖 Android version name from",
    clc.yellow(currentVersionName),
    "to",
    clc.underline(clc.yellow(versionName)),
    "and version code from",
    clc.yellow(currentVersionCode),
    "to",
    clc.underline(clc.yellow(versionCode)),
  )
}

const updateIOSVersion = async () => {
  const pbxproj = glob.sync('ios/*.xcodeproj/project.pbxproj')[0];
  const project = await readFile(pbxproj, 'utf8');

  const currentVersionName = /MARKETING_VERSION\s*=\s(.*)/g.exec(project)?.[1].replace(';', '');
  const currentBuildNumber = /CURRENT_PROJECT_VERSION\s*=\s*(\d*)/g.exec(project)?.[1];

  if (!currentVersionName || !currentBuildNumber) {
    console.error(clc.redBright(`Could not find MARKETING_VERSION or CURRENT_PROJECT_VERSION in ${pbxproj}`));
    process.exit(1);
  }

  const recommendedVersionName = (parseFloat(currentVersionName) + 0.1).toFixed(1);
  const recommendedBuildNumber = parseInt(currentBuildNumber) + 1;

  console.log(clc.blue("info"), "Current 🍎 iOS version name:", clc.yellow(currentVersionName));
  const { versionName } = await prompt({
    type: "input",
    name: "versionName",
    message: "New iOS version name:",
    default: recommendedVersionName,
    validate: (input) => {
      if (!input) {
        return "Please enter a version name";
      }
      return true;
    },
  })

  console.log(clc.blue("info"), "Current 🍎 iOS build number:", clc.yellow(currentBuildNumber));
  const { buildNumber } = await prompt({
    type: "input",
    name: "buildNumber",
    message: "New iOS build number:",
    default: recommendedBuildNumber,
    validate: (input) => {
      if (!input) {
        return "Please enter a build number";
      }
      return true;
    },
  })

  await writeFile(
    pbxproj,
    project
      .replaceAll(`MARKETING_VERSION = ${currentVersionName}`, `MARKETING_VERSION = ${versionName}`)
      .replaceAll(`CURRENT_PROJECT_VERSION = ${currentBuildNumber}`, `CURRENT_PROJECT_VERSION = ${buildNumber}`),
  )

  console.log(
    clc.green("success"),
    "Updated 🍎 iOS version name from",
    clc.yellow(currentVersionName),
    "to",
    clc.underline(clc.yellow(versionName)),
    "and build number from",
    clc.yellow(currentBuildNumber),
    "to",
    clc.underline(clc.yellow(buildNumber)),
  )
}

program
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description(packageJSON.description)
  .option("-a, --android", "Update 🤖 Android app version")
  .option("-i, --ios", "Update 🍎 iOS app version")
  .option("-b, --both", "Update both 🤖 Android and 🍎 iOS apps versions")
  .action(async options => {
    if (!options.both && !options.android && !options.ios) {
      const { platform } = await prompt({
        type: "list",
        name: "platform",
        message: "Which platform version do you want to update?",
        choices: ["🤖 Android", "🍎 iOS", "Both"],
      });

      if (platform === "🤖 Android") options.android = true;
      else if (platform === "🍎 iOS") options.ios = true;
      else options.both = true;
    }

    if (options.both || options.android) await updateAndroidVersion();
    if (options.both || options.ios) {
      if (options.both || options.android) console.log();
      await updateIOSVersion();
    }
  })
  .parse(process.argv);

