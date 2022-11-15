import chunk from "lodash/chunk.js";
import intersection from "lodash/intersection.js";
import union from "lodash/union.js";
import hash from "string-hash-64";
import { getBasicTokens } from "./utils.js";
class Document {
    constructor(docId, docText) {
        this.inCluster = false;
        this.signature = [];
        this.similar = {};
        this.docId = docId;
        this.docText = docText;
        this.setSignature();
    }
    compare(other) {
        const { docId, similar, signature } = this;
        const { docId: oDocId, similar: oSim, signature: oSig } = other;
        if (!similar[oDocId] || !oSim[docId]) {
            const numDiff = intersection(signature, oSig).length;
            const numTotal = union(signature, oSig).length;
            const similarity = (numDiff * 1.0) / numTotal;
            this.similar[oDocId] = { docId: oDocId, similarity };
        }
        else if (oSim[docId]) {
            this.similar[oDocId] = {
                docId: oDocId,
                similarity: oSim[docId].similarity,
            };
        }
    }
    getNearDuplicates() {
        const similarities = Object.values(this.similar).filter((docSim) => docSim.similarity >= 0.25);
        return similarities.map(docSim => docSim.docId);
    }
    setSignature() {
        const tokens = getBasicTokens(this.docText);
        const shingles = chunk(tokens, 5);
        this.signature = shingles.map((s) => hash(s.join("")));
    }
}
export default Document;
//# sourceMappingURL=Document.js.map