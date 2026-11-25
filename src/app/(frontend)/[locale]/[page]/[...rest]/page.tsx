import { notFound } from 'next/navigation'

/** Any deeper unknown path renders the branded 404 inside the locale layout. */
export default function CatchAll() {
  notFound()
}
