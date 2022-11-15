
import { createReadStream } from "fs";
// import chunk from "lodash/chunk.js";
// import intersection from "lodash/intersection.js";
import random from "lodash/random.js";
// import times from "lodash/times.js";
// import Long from "long";
import * as rl from "readline";
// import hash from "string-hash-64";

import Document from "./Document.js";
// import { getBasicTokens, getPairs } from "./utils.js";

interface IDupeDetector {
  // hashCache: Map<string, number[]>;
  verbose: boolean;
  // buildDocSignatures(): void;
  processDocuments(filename: string): Promise<unknown>;
  readDocument(line: string): void;
}

const NUM_BUCKETS = 50;
const RAND1 = random(605);
const RAND2 = random(744);
// const RAND_MAX = Math.pow(2, 40);
// const RAND_MIN = Math.pow(2, 30);
const SHINGLE_SIZE = 5;
const SIGNATURE_SIZE = 20;

class DupeDetector implements IDupeDetector {
  // bucketsByDocId = {};
  docs: Record<string, Document> = {};
  // docsByBucketId = {};
  // hashCache = new Map<string, number[]>();
  // rands: number[];
  // similarityMatrix = {};
  verbose: boolean;

  constructor(verbose: boolean) {
    // array of random numbers defined once for signature building
    // this.rands = times(SIGNATURE_SIZE, () => random(RAND_MIN, RAND_MAX));
    this.verbose = verbose;

    this.readDocument = this.readDocument.bind(this);
  }

  // bucketSignatures() {
  //   const docIds = this.hashCache.keys();

  //   for (const docId of docIds) {
  //     const signature = this.hashCache.get(docId);
  //     const sigChunks = chunk(signature, 10);
  //     const buckets = [];

  //     for (let i = 0; i < sigChunks.length; i += 1) {
  //       const chunkSum = sigChunks[i].reduce((acc, num) => acc + num, 0);
  //       const bucketId = this.univHash(chunkSum);

  //       buckets.push(bucketId);

  //       if (!this.docsByBucketId[bucketId]) {
  //         this.docsByBucketId[bucketId] = [docId];
  //       } else {
  //         this.docsByBucketId[bucketId].push(docId);
  //       }
  //     }

  //     this.bucketsByDocId[docId] = buckets;
  //   }
  // }

  // buildDocSignatures() {
  //   const docIds = this.hashCache.keys();

  //   for (const docId of docIds) {
  //     const compShingles = this.hashCache.get(docId);
  //     const signature = new Array<number>(SIGNATURE_SIZE).fill(
  //       Number.MAX_SAFE_INTEGER
  //     );

  //     for (let i = 0; i < compShingles.length; i += 1) {
  //       const longVal = Long.fromNumber(compShingles[i], true);

  //       for (let j = 0; j < this.rands.length; j += 1) {
  //         const sigHash = longVal.xor(this.rands[j]).toNumber();

  //         if (sigHash < signature[j]) {
  //           signature[j] = sigHash;
  //         }
  //       }
  //     }

  //     this.hashCache.set(docId, signature);
  //   }
  // }

  buildEquivClusters() {
    const docIds = Object.keys(this.docs);

    for (let i = 0; i < docIds.length; i += 1) {
      const docId = docIds[i];
      const currDoc = this.docs[docId];

      if (!currDoc.inCluster) {
        const cluster = [docId];
        const nDupes = currDoc.getNearDuplicates();

        for (let j = 0; j < nDupes.length; j += 1) {
          const oDocId = nDupes[j];

          if (!this.docs[oDocId].inCluster) {
            cluster.push(oDocId);
            this.docs[oDocId].inCluster = true;
          }
        }

        currDoc.inCluster = true;

        console.log(cluster.join(" "));
      }
    }
  }

  // compareBuckets() {
  //   const buckets: string[][] = Object.values(this.docsByBucketId);

  //   for (let i = 0; i < buckets.length; i += 1) {
  //     const docIdPairs = getPairs(buckets[i]);

  //     for (const [doc1, doc2] of docIdPairs) {
  //       if (
  //         !this.similarityMatrix?.[doc1]?.[doc2] ||
  //         !this.similarityMatrix?.[doc2]?.[doc1]
  //       ) {
  //         const doc1Buckets = this.bucketsByDocId[doc1];
  //         const doc2Buckets = this.bucketsByDocId[doc2];
  //         const numShared = intersection(doc1Buckets, doc2Buckets);
  //         const similarity = (numShared.length * 1.0) / NUM_BUCKETS;

  //         if (!this.similarityMatrix[doc1]) {
  //           this.similarityMatrix[doc1] = {};
  //         }

  //         if (!this.similarityMatrix[doc2]) {
  //           this.similarityMatrix[doc2] = {};
  //         }

  //         this.similarityMatrix[doc1][doc2] = similarity;
  //       }
  //     }
  //   }
  // }

  compareDocs() {
    const allDocs = Object.values(this.docs);

    for (let i = 0; i < allDocs.length - 1; i += 1) {
      const docA = allDocs[i];

      for (let j = i + 1; j < allDocs.length; j += 1) {
        const docB = allDocs[j];
        
        docA.compare(docB);
      }
    }
  }

  univHash(number: number) {
    return ((RAND1 * number + RAND2) % 103) % NUM_BUCKETS;
  }

  processDocuments(filename: string) {
    return new Promise<rl.Interface>((resolve, reject) => {
      if (this.verbose) console.log(`Reading ${filename}`);

      try {
        const inStream = createReadStream(filename);
        const lineReader = rl.createInterface({
          input: inStream,
        });

        lineReader.on("line", this.readDocument);
        inStream.on("end", resolve);
      } catch (err) {
        console.error(`Error while reading ${filename}`);
        console.error(err);

        reject();
      }
    });
  }

  readDocument(doc: string) {
    if (doc.length) {
      const [docId, docText] = doc.split("\t");
      const document = new Document(docId, docText);

      this.docs[docId] = document;
    }
  }

  // readDocumentOld(doc: string) {
  //   if (doc.length) {
  //     const [docId, docText] = doc.split("\t");
  //     const tokens = getBasicTokens(docText);
  //     const shingles = chunk(tokens, SHINGLE_SIZE);
  //     const shingleHashes = shingles.map((shingle) => hash(shingle.join("")));

  //     this.hashCache.set(docId, shingleHashes);
  //   }
  // }
}

export default DupeDetector;
