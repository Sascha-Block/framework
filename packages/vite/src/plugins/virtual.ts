import { dirname, join } from 'upath'

import { Plugin } from 'rollup'

const PREFIX = '\0virtual:'

export default function virtual (vfs: Record<string, string>): Plugin {
  const extensions = ['', '.ts', '.vue', '.mjs', '.cjs', '.js', '.json']
  const resolveWithExt = (id) => {
    for (const ext of extensions) {
      const rId = id + ext
      if (rId in vfs) {
        return rId
      }
    }
    return null
  }

  return {
    name: 'virtual',

    resolveId (id, importer) {
      const resolvedId = resolveWithExt(id)
      if (resolvedId) { return PREFIX + resolvedId }
      if (importer && id[0] !== '/') {
        const importerNoPrefix = importer.startsWith(PREFIX) ? importer.slice(PREFIX.length) : importer
        const importedDir = dirname(importerNoPrefix)
        const resolved = resolveWithExt(join(importedDir, id))
        if (resolved) { return PREFIX + resolved }
      }
      return null
    },

    load (id) {
      if (!id.startsWith(PREFIX)) { return null }
      const idNoPrefix = id.slice(PREFIX.length)
      return {
        code: vfs[idNoPrefix],
        map: null
      }
    }
  }
}