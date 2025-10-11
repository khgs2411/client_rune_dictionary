import type { Plugin } from 'vite';

/**
 * Creates a Vite plugin that provides compatibility for topsyde-utils in browser environments
 * by disabling sourcemaps and providing mock implementations of Node.js modules.
 */
export function topsydeUtilsPlugin(): Plugin {
  return {
    name: 'topsyde-utils-compatibility',
    enforce: 'pre', // Run before Vite's default resolution

    // Disable sourcemaps for topsyde-utils
    transform(code, id) {
      if (id.includes('node_modules/topsyde-utils')) {
        return {
          code,
          map: { mappings: '' }, // Return empty sourcemap
        };
      }
    },

    // Handle virtual modules for Node.js built-ins
    resolveId(id, importer) {
      // Only intercept if imported from topsyde-utils
      if (importer && importer.includes('node_modules/topsyde-utils')) {
        if (id === 'path') {
          return '\0virtual:path';
        }
        if (id === 'fs') {
          return '\0virtual:fs';
        }
      }

      // Handle direct imports of virtual modules
      if (id === 'virtual:path' || id === 'virtual:fs') {
        return '\0' + id;
      }

      return null;
    },

    // Provide mock implementations for Node.js modules
    load(id) {
      if (id === '\0virtual:path') {
        return `
          export function join() { return ''; }
          export function resolve() { return ''; }
          export function dirname() { return ''; }
          export function basename() { return ''; }
          export function extname() { return ''; }
          export default { join, resolve, dirname, basename, extname };
        `;
      }
      if (id === '\0virtual:fs') {
        return `
          export function readFileSync() { return ''; }
          export function existsSync() { return false; }
          export function writeFileSync() { return null; }
          export function readdirSync() { return []; }
          export function statSync() {
            return {
              isDirectory: () => false,
              isFile: () => true
            };
          }
          export const promises = {
            readFile: async () => '',
            writeFile: async () => null,
            readdir: async () => [],
            stat: async () => ({ isDirectory: () => false, isFile: () => true }),
          };
          export const constants = {};
          export function createReadStream() { return null; }
          export default {
            readFileSync, existsSync, writeFileSync, readdirSync, statSync,
            promises, constants, createReadStream
          };
        `;
      }
      return null;
    },

    // Configure optimizeDeps
    config() {
      return {
        optimizeDeps: {
          // Don't exclude topsyde-utils - let Vite handle it normally
          // This allows validator to be pre-bundled and work in dev
          include: ['validator'],
        },
      };
    },
  };
}

export default topsydeUtilsPlugin;
