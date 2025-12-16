/**
 * Data Loader Module
 * Handles fetching and parsing JSONL data files
 */

// Cache for loaded data
const dataCache = new Map();

/**
 * Load the manifest file containing list of available data files
 * @returns {Promise<Object>} Manifest object
 */
export async function loadManifest() {
    try {
        const response = await fetch('data/manifest.json');
        if (!response.ok) {
            console.warn('Manifest not found, using fallback');
            return createFallbackManifest();
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load manifest:', error);
        return createFallbackManifest();
    }
}

/**
 * Create a fallback manifest when manifest.json doesn't exist
 * @returns {Object} Fallback manifest with current week
 */
function createFallbackManifest() {
    const now = new Date();
    const currentWeek = getISOWeek(now);
    const filename = `${currentWeek}.jsonl`;

    return {
        generated: now.toISOString(),
        files: [filename]
    };
}

/**
 * Get ISO week number (YYYY-Www format)
 * @param {Date} date
 * @returns {string} Week in format like "2025-W50"
 */
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Parse JSONL (JSON Lines) format into array of objects
 * @param {string} text - Raw JSONL text
 * @returns {Array} Array of parsed JSON objects
 */
export function parseJSONL(text) {
    if (!text || !text.trim()) {
        return [];
    }

    return text
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => {
            try {
                return JSON.parse(line);
            } catch (error) {
                console.warn(`Invalid JSON on line ${index + 1}:`, line);
                return null;
            }
        })
        .filter(entry => entry && entry.artist && entry.song && entry.ts);
}

/**
 * Fetch a single JSONL file
 * @param {string} filename - Name of the file (e.g., "2025-W50.jsonl")
 * @returns {Promise<Array>} Parsed entries
 */
export async function fetchDataFile(filename) {
    // Check cache first
    if (dataCache.has(filename)) {
        return dataCache.get(filename);
    }

    try {
        const response = await fetch(`data/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
        }

        const text = await response.text();
        const entries = parseJSONL(text);

        // Cache the result
        dataCache.set(filename, entries);

        return entries;
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        return [];
    }
}

/**
 * Load multiple data files in parallel
 * @param {Array<string>} filenames - Array of filenames
 * @returns {Promise<Array>} Combined array of all entries
 */
export async function fetchMultipleFiles(filenames) {
    const promises = filenames.map(filename => fetchDataFile(filename));
    const results = await Promise.all(promises);

    // Flatten and sort by timestamp
    return results
        .flat()
        .sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

/**
 * Load recent data (current week + last N weeks)
 * @param {number} weeksBack - Number of weeks to load (default: 4)
 * @returns {Promise<Object>} Object with manifest and entries
 */
export async function loadRecentData(weeksBack = 4) {
    const manifest = await loadManifest();
    const files = manifest.files || [];

    if (files.length === 0) {
        return { manifest, entries: [] };
    }

    // Take the most recent files
    const recentFiles = files.slice(-weeksBack);
    const entries = await fetchMultipleFiles(recentFiles);

    return { manifest, entries };
}

/**
 * Load all available data
 * @returns {Promise<Object>} Object with manifest and all entries
 */
export async function loadAllData() {
    const manifest = await loadManifest();
    const files = manifest.files || [];

    if (files.length === 0) {
        return { manifest, entries: [] };
    }

    const entries = await fetchMultipleFiles(files);

    return { manifest, entries };
}

/**
 * Get the current week's filename
 * @returns {string} Filename like "2025-W50.jsonl"
 */
export function getCurrentWeekFilename() {
    return `${getISOWeek(new Date())}.jsonl`;
}

/**
 * Load only the current week's data
 * @returns {Promise<Array>} Current week's entries
 */
export async function loadCurrentWeekData() {
    const filename = getCurrentWeekFilename();
    return await fetchDataFile(filename);
}

/**
 * Clear the data cache
 */
export function clearCache() {
    dataCache.clear();
}
