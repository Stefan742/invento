import {
  Alumni_Sans,
  Bebas_Neue,
  Fira_Sans_Extra_Condensed,
  Manrope,
  Nunito,
  Onest,
  Oswald,
  Roboto_Condensed,
  Rubik,
  Unbounded,
} from 'next/font/google'
import { notFound } from 'next/navigation'

/* Dev-only Macedonian glyph test page (docs/04). Not available in production. */

const oswald = Oswald({ subsets: ['latin', 'cyrillic'], weight: ['700'] })
// Bebas Neue on Google Fonts ships Latin only: kept here to show the failure mode.
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'] })
const alumni = Alumni_Sans({ subsets: ['latin', 'cyrillic'], weight: ['800', '900'] })
const fira = Fira_Sans_Extra_Condensed({ subsets: ['latin', 'cyrillic'], weight: ['800', '900'] })
const roboto = Roboto_Condensed({ subsets: ['latin', 'cyrillic'], weight: ['800', '900'] })
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['800'] })

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] })
const onest = Onest({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] })
const nunito = Nunito({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] })
const rubik = Rubik({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] })

const ALPHABET_UPPER = 'А Б В Г Д Ѓ Е Ж З Ѕ И Ј К Л Љ М Н Њ О П Р С Т Ќ У Ф Х Ц Ч Џ Ш'
const ALPHABET_LOWER = 'а б в г д ѓ е ж з ѕ и ј к л љ м н њ о п р с т ќ у ф х ц ч џ ш'
const SPECIAL = 'Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ'
const SLOGAN = 'ГРАДИ. ОТКРИВАЈ. СОЗДАВАЈ.'
const PARAGRAPH =
  'Секоја INVENTO кутија е мала инженерска авантура: дрвени делови, јасни упатства и еден момент кога сè ќе „кликне“. Ѓерѓовден, ќерка, ѕвезда, љубопитност, њива, џеб.'

const display = [
  { name: 'Oswald 700', cls: oswald.className, weight: 700 },
  { name: 'Bebas Neue 400 (Latin only!)', cls: bebas.className, weight: 400 },
  { name: 'Alumni Sans 900', cls: alumni.className, weight: 900 },
  { name: 'Fira Sans Extra Condensed 800', cls: fira.className, weight: 800 },
  { name: 'Roboto Condensed 900', cls: roboto.className, weight: 900 },
  { name: 'Unbounded 800 (wide)', cls: unbounded.className, weight: 800 },
]

const body = [
  { name: 'Manrope', cls: manrope.className },
  { name: 'Onest', cls: onest.className },
  { name: 'Nunito', cls: nunito.className },
  { name: 'Rubik', cls: rubik.className },
]

export default function FontsTestPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main id="main" className="bg-paper text-navy min-h-screen py-10">
      <div className="container-x space-y-12">
        <h1 className="text-3xl font-bold">/dev/fonts: Macedonian Cyrillic test</h1>

        <section className="space-y-10">
          <h2 className="text-xl font-bold uppercase tracking-wide">Display candidates</h2>
          {display.map((f) => (
            <div key={f.name} className="border-navy border-t-4 pt-4">
              <p className="mb-2 font-mono text-sm">{f.name}</p>
              <div className={f.cls} style={{ fontWeight: f.weight }}>
                <p className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] uppercase">{SLOGAN}</p>
                <p className="mt-3 text-4xl">{SPECIAL}</p>
                <p className="mt-2 text-2xl">{ALPHABET_UPPER}</p>
                <p className="mt-1 text-2xl">{ALPHABET_LOWER}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-10">
          <h2 className="text-xl font-bold uppercase tracking-wide">Body candidates</h2>
          {body.map((f) => (
            <div key={f.name} className={`border-navy border-t-4 pt-4 ${f.cls}`}>
              <p className="mb-2 font-mono text-sm">{f.name}</p>
              <p className="max-w-[62ch] text-lg">{PARAGRAPH}</p>
              <p className="mt-2 text-lg font-bold">{SPECIAL}</p>
              <p className="mt-1">{ALPHABET_LOWER}</p>
              <div className="mt-3 flex gap-3">
                <span className="bg-orange text-navy outline-navy rounded-full px-5 py-2 font-bold">
                  Додај во кошничка
                </span>
                <span className="bg-navy text-paper rounded-full px-5 py-2 font-bold">
                  Испрати нарачка
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
