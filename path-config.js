const os = require('os');
const path = require('path');

/**
 * Detect the operating system and return the appropriate project root path.
 *
 * @returns {string} The absolute path to the project root directory
 */
function getProjectRoot() {
    const platform = os.platform();

    if (platform === 'win32') {
        // Windows path
        return 'C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT';
    } else if (platform === 'darwin') {
        // macOS path
        return '/Users/wanderer/Desktop/PQR/COBRA.UNIT';
    } else {
        // Linux or other Unix-like systems
        return '/Users/wanderer/Desktop/PQR/COBRA.UNIT';
    }
}

/**
 * Build a path relative to the project root.
 *
 * @param {...string} pathParts - Variable number of path components to join
 * @returns {string} The complete path joined with the project root
 *
 * @example
 * getPath('!README', 'pqr-backend-output-files')
 * // Windows: 'C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqr-backend-output-files'
 * // Mac: '/Users/wanderer/Desktop/PQR/COBRA.UNIT/!README/pqr-backend-output-files'
 */
function getPath(...pathParts) {
    return path.join(getProjectRoot(), ...pathParts);
}

// Commonly used paths
const PROJECT_ROOT = getProjectRoot();
const README_DIR = getPath('!README');
const PQR_BACKEND_OUTPUT_DIR = getPath('!README', 'pqr-backend-output-files');
const PQR_TICKERS_BATCH_DIR = getPath('!README', 'pqr-tickers-batch-files');
const MONO_SCRAPER_OUTPUT_DIR = getPath('!README', 'mono-scraper-output');
const BETA_FILTER_SCRIPT = getPath('app', 'betaFilter', 'betaFilter.py');

module.exports = {
    getProjectRoot,
    getPath,
    PROJECT_ROOT,
    README_DIR,
    PQR_BACKEND_OUTPUT_DIR,
    PQR_TICKERS_BATCH_DIR,
    MONO_SCRAPER_OUTPUT_DIR,
    BETA_FILTER_SCRIPT
};

// Print configuration when run directly (for debugging)
if (require.main === module) {
    console.log(`Detected OS: ${os.platform()}`);
    console.log(`Project Root: ${PROJECT_ROOT}`);
    console.log(`README Directory: ${README_DIR}`);
    console.log(`PQR Backend Output: ${PQR_BACKEND_OUTPUT_DIR}`);
    console.log(`PQR Tickers Batch: ${PQR_TICKERS_BATCH_DIR}`);
    console.log(`Mono Scraper Output: ${MONO_SCRAPER_OUTPUT_DIR}`);
    console.log(`Beta Filter Script: ${BETA_FILTER_SCRIPT}`);
}
