#!/usr/bin/node
import path from "path";
import { performance } from "perf_hooks";

import DupeDetector from "./DupeDetector.js";

async function main() {
  const { index, value} = getCmdFlag("--tsv");
  const verboseFlag = getCmdFlag("-v");
  const verbose = verboseFlag.index != null;
  const engine = new DupeDetector(verbose);

  if (index > 0) {
    const inputFile = path.join("./tests", `${value}.tsv`);

    performance.mark("start");
    await engine.processDocuments(inputFile);
    engine.compareDocs();
    engine.buildEquivClusters();
    // engine.buildDocSignatures();
    // engine.bucketSignatures();
    // engine.compareBuckets();
    performance.mark("end");

    console.log(performance.measure("duration", "start", "end").duration);
  }
}

function getCmdFlag(flag) {
  const { argv } = process;
  const idx = argv.indexOf(flag);
  const flagData = {};

  if (idx > -1) {
    flagData.index = idx;

    if (idx < argv.length - 1) {
      const nextArg = argv[idx + 1];

      if (!nextArg.startsWith("-")) {
        flagData.value = argv[idx + 1];
      }
    }
  }

  return flagData;
}

main();
