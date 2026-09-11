import { notFound } from 'next/navigation'

/**
 * Catch-all inside the locale segment: any unknown path renders the localised
 * 404 (with a real 404 status) instead of the framework's default page.
 */
export default function CatchAllPage() {
  notFound()
}
