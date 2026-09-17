import * as migration_20260911_103826_initial from './20260911_103826_initial'
import * as migration_20260914_085910_experience_country_codes from './20260914_085910_experience_country_codes'
import * as migration_20260914_092102_speaking_media from './20260914_092102_speaking_media'
import * as migration_20260914_093610_booking_link from './20260914_093610_booking_link'
import * as migration_20260914_095249_newsletter from './20260914_095249_newsletter'
import * as migration_20260914_103837_direct_sales from './20260914_103837_direct_sales'
import * as migration_20260914_144309_digital_products from './20260914_144309_digital_products'
import * as migration_20260914_153337_campaigns from './20260914_153337_campaigns'
import * as migration_20260914_154535_engagement_topics from './20260914_154535_engagement_topics'
import * as migration_20260914_173556_contact_qualification from './20260914_173556_contact_qualification'
import * as migration_20260915_134311_book_order from './20260915_134311_book_order'
import * as migration_20260916_144007_home_hero_gallery from './20260916_144007_home_hero_gallery'
import * as migration_20260916_191523_business_contact_url from './20260916_191523_business_contact_url'
import * as migration_20260917_082709_contact_follow_up from './20260917_082709_contact_follow_up'
import * as migration_20260917_092536_contact_business from './20260917_092536_contact_business'
import * as migration_20260917_101858_audit_log from './20260917_101858_audit_log'

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
  {
    up: migration_20260914_093610_booking_link.up,
    down: migration_20260914_093610_booking_link.down,
    name: '20260914_093610_booking_link',
  },
  {
    up: migration_20260914_095249_newsletter.up,
    down: migration_20260914_095249_newsletter.down,
    name: '20260914_095249_newsletter',
  },
  {
    up: migration_20260914_103837_direct_sales.up,
    down: migration_20260914_103837_direct_sales.down,
    name: '20260914_103837_direct_sales',
  },
  {
    up: migration_20260914_144309_digital_products.up,
    down: migration_20260914_144309_digital_products.down,
    name: '20260914_144309_digital_products',
  },
  {
    up: migration_20260914_153337_campaigns.up,
    down: migration_20260914_153337_campaigns.down,
    name: '20260914_153337_campaigns',
  },
  {
    up: migration_20260914_154535_engagement_topics.up,
    down: migration_20260914_154535_engagement_topics.down,
    name: '20260914_154535_engagement_topics',
  },
  {
    up: migration_20260914_173556_contact_qualification.up,
    down: migration_20260914_173556_contact_qualification.down,
    name: '20260914_173556_contact_qualification',
  },
  {
    up: migration_20260915_134311_book_order.up,
    down: migration_20260915_134311_book_order.down,
    name: '20260915_134311_book_order',
  },
  {
    up: migration_20260916_144007_home_hero_gallery.up,
    down: migration_20260916_144007_home_hero_gallery.down,
    name: '20260916_144007_home_hero_gallery',
  },
  {
    up: migration_20260916_191523_business_contact_url.up,
    down: migration_20260916_191523_business_contact_url.down,
    name: '20260916_191523_business_contact_url',
  },
  {
    up: migration_20260917_082709_contact_follow_up.up,
    down: migration_20260917_082709_contact_follow_up.down,
    name: '20260917_082709_contact_follow_up',
  },
  {
    up: migration_20260917_092536_contact_business.up,
    down: migration_20260917_092536_contact_business.down,
    name: '20260917_092536_contact_business',
  },
  {
    up: migration_20260917_101858_audit_log.up,
    down: migration_20260917_101858_audit_log.down,
    name: '20260917_101858_audit_log',
  },
]
