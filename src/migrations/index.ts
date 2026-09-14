import * as migration_20260911_103826_initial from './20260911_103826_initial'

export const migrations = [
  {
    up: migration_20260911_103826_initial.up,
    down: migration_20260911_103826_initial.down,
    name: '20260911_103826_initial',
  },
]
