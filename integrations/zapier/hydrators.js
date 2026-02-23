/**
 * Hydrators for File Handling
 *
 * Hydrators are used for lazy file loading in Zapier.
 * When an action returns z.dehydrateFile(), Zapier only downloads
 * the file when a downstream step actually needs it.
 *
 * Best Practices:
 * - Use hydrators for large files to improve performance
 * - Use z.stashFile() to store files in Zapier's S3 for downstream steps
 * - Handle errors gracefully
 *
 * Usage in action:
 *   const hydrators = require('../hydrators');
 *   return {
 *     ...result,
 *     file: z.dehydrateFile(hydrators.downloadFile, { url: result.url, filename: result.filename }),
 *   };
 */

const hydrators = {
  /**
   * Download a file from a URL and stash it for Zapier
   * This is called lazily when a downstream step needs the file
   *
   * @param {object} z - Zapier's core object
   * @param {object} bundle - Contains inputData with url and filename
   * @returns {Promise<string>} - Stashed file URL
   */
  downloadFile: (z, bundle) => {
    const { url, filename, contentType = 'application/octet-stream' } = bundle.inputData;

    // Request the file from the URL
    const filePromise = z.request({
      url: url,
      raw: true,
    });

    // Stash the file in Zapier's storage and return the stable URL
    return z.stashFile(filePromise, null, filename, contentType);
  },
};

module.exports = hydrators;
