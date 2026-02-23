/**
 * NanoID utility with user-friendly alphabet
 * Excludes confusing characters: 0, O, I, l, 1
 */

import { customAlphabet } from 'nanoid';

// User-friendly alphabet (56 chars) - no 0, O, I, l, o, 1
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

// Generate 12-character IDs
export const generateShortId = customAlphabet(alphabet, 12);

/**
 * Example output: K9mPqR3j7nHw, b4f77b236k9x, aB5cDe8FgHjK
 */
