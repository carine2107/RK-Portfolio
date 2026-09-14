import * as migration_20260911_103826_initial from './20260911_103826_initial'
import * as migration_20260914_085910_experience_country_codes from './20260914_085910_experience_country_codes'
import * as migration_20260914_092102_speaking_media from './20260914_092102_speaking_media'

export const migrations = [
  {
    up: migration_20260911_103826_initial.up,
    down: migration_20260911_103826_initial.down,
    name: '20260911_103826_initial',
  },
  {
    up: migration_20260914_085910_experience_country_codes.up,
    down: migration_20260914_085910_experience_country_codes.down,
    name: '20260914_085910_experience_country_codes',
  },
  {
    up: migration_20260914_092102_speaking_media.up,
    down: migration_20260914_092102_speaking_media.down,
    name: '20260914_092102_speaking_media',
  },
]
