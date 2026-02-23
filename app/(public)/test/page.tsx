import {
  Caveat,
  Caveat_Brush,
  Marck_Script,
  Bad_Script,
  Amatic_SC,
  Neucha,
  Pangolin,
  Andika,
  Pacifico,
  Handlee,
  Mali,
  Comfortaa,
  Lobster,
  Lobster_Two,
  Indie_Flower,
  Press_Start_2P,
  Rubik_Wet_Paint,
  Permanent_Marker,
} from 'next/font/google'

const caveat = Caveat({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'], display: 'swap' })
const caveatBrush = Caveat_Brush({ subsets: ['latin'], weight: '400', display: 'swap' })
const marckScript = Marck_Script({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const badScript = Bad_Script({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const amaticSC = Amatic_SC({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'], display: 'swap' })
const neucha = Neucha({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const pangolin = Pangolin({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const andika = Andika({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'], display: 'swap' })
const pacifico = Pacifico({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const handlee = Handlee({ subsets: ['latin'], weight: '400', display: 'swap' })
const mali = Mali({ subsets: ['latin'], weight: ['400'], display: 'swap' })
const comfortaa = Comfortaa({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'], display: 'swap' })
const lobster = Lobster({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const lobsterTwo = Lobster_Two({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' })
const indieFlower = Indie_Flower({ subsets: ['latin'], weight: '400', display: 'swap' })
const pressStart = Press_Start_2P({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const rubikWetPaint = Rubik_Wet_Paint({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const permanentMarker = Permanent_Marker({ subsets: ['latin'], weight: '400', display: 'swap' })

const sampleMK = 'Персонализирани подароци за секоја прослава'
const sampleMK2 = 'Најубави цвеќиња и балони за вашиот празник'
const sampleEN = 'Personalized gifts for every celebration'

type FontEntry = { name: string; className: string; desc: string } | { separator: string }

const fonts: FontEntry[] = [
  { name: 'Caveat', className: caveat.className, desc: 'Casual, fast handwriting with natural variation' },
  { name: 'Caveat Brush', className: caveatBrush.className, desc: 'Bold brush version of Caveat' },
  { name: 'Marck Script', className: marckScript.className, desc: 'Elegant flowing cursive' },
  { name: 'Bad Script', className: badScript.className, desc: 'Neat personal handwriting' },
  { name: 'Amatic SC', className: amaticSC.className, desc: 'Narrow, tall handwritten style' },
  { name: 'Neucha', className: neucha.className, desc: 'Relaxed, rounded handwriting' },
  { name: 'Pangolin', className: pangolin.className, desc: 'Friendly, informal handwriting' },

  { separator: 'NOVI FONTOVI' },

  { name: 'Andika', className: andika.className, desc: 'Clean, readable handwriting-inspired' },
  { name: 'Pacifico', className: pacifico.className, desc: '1950s surf culture brush script' },
  { name: 'Handlee', className: handlee.className, desc: 'Loose, casual handwriting' },
  { name: 'Mali', className: mali.className, desc: 'Childlike, playful handwriting' },
  { name: 'Comfortaa', className: comfortaa.className, desc: 'Rounded geometric, friendly feel' },
  { name: 'Lobster', className: lobster.className, desc: 'Bold, flowing script with ligatures' },
  { name: 'Lobster Two', className: lobsterTwo.className, desc: 'Lighter, refined version of Lobster' },
  { name: 'Indie Flower', className: indieFlower.className, desc: 'Bubbly, fun handwriting' },
  { name: 'Permanent Marker', className: permanentMarker.className, desc: 'Thick marker handwriting' },
  { name: 'Rubik Wet Paint', className: rubikWetPaint.className, desc: 'Dripping wet paint display' },
  { name: 'Press Start 2P', className: pressStart.className, desc: 'Pixel/retro arcade style' },
]

export default function TestFontsPage() {
  return (
    <div className="min-h-screen bg-canvas-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-ds-title text-ink-strong">Кирилични ракописни фонтови</h1>
          <p className="text-ink-muted text-ds-body">Одбери го фонтот кој најмногу ти се допаѓа</p>
        </div>

        {fonts.map((entry, i) => {
          if ('separator' in entry) {
            return (
              <div key={entry.separator} className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-primary-300" />
                <span className="font-heading text-ds-section text-primary-600 tracking-wide">{entry.separator}</span>
                <div className="flex-1 h-px bg-primary-300" />
              </div>
            )
          }
          return (
            <div key={entry.name} className="rounded-2xl border border-border-soft bg-surface-base p-6 shadow-card space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-ds-body-lg text-ink-strong">{entry.name}</h2>
                <span className="text-ds-body-sm text-ink-muted">{entry.desc}</span>
              </div>
              <div className={`${entry.className} space-y-3`}>
                <p className="text-3xl text-ink-strong">{sampleMK}</p>
                <p className="text-2xl text-ink-base">{sampleMK2}</p>
                <p className="text-xl text-ink-muted">{sampleEN}</p>
                <p className="text-4xl text-primary-600">Гербера — Подароци со љубов</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
