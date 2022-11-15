import porterStemmer from "@stdlib/nlp-porter-stemmer";
import uniq from "lodash/uniq.js";
import { eng, removeStopwords } from "stopword";
/**
 * @see https://regex101.com/r/MrzCOd/1
 */
const SPEC_CHARS_RX = /\W[\W\s]+/gi;
/**
 * @description Removes special characters and stopwords and runs through
 * porter stemmer
 * @param text Words or sentences to process
 * @returns {string[]}
 */
export function getAdvTokens(text, n = 3) {
    const stripped = text.replace(SPEC_CHARS_RX, " ").trim();
    const normalized = stripped.toLowerCase();
    const words = normalized.split(" ");
    // high value words (exclude stopwords)
    const hvWords = removeStopwords(words, eng);
    const tokens = uniq(hvWords.map(porterStemmer));
    return tokens;
}
/**
 * @description Returns words without any extra processing
 * @param text
 * @returns {string[]}
 */
export function getBasicTokens(text) {
    return text.trim().toLowerCase().split(" ");
}
export function getPairs(array) {
    if (Array.isArray(array)) {
        return array.flatMap((a, aIdx) => array.flatMap((b, bIdx) => (bIdx > aIdx ? [[a, b]] : [])));
    }
    console.error("[ERROR] ", array, "array not provided");
    return [];
}
//# sourceMappingURL=utils.js.map