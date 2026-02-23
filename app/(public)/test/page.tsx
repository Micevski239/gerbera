import { Caveat, Marck_Script, Bad_Script, Amatic_SC, Neucha, Pangolin, Andika } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'], display: 'swap' })
const marckScript = Marck_Script({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const badScript = Bad_Script({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const amaticSC = Amatic_SC({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'], display: 'swap' })
const neucha = Neucha({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const pangolin = Pangolin({ subsets: ['latin', 'cyrillic'], weight: '400', display: 'swap' })
const andika = Andika({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'], display: 'swap' })

const sampleMK = 'Персонализирани подароци за секоја прослава'
const sampleMK2 = 'Најубави цвеќиња и балони за вашиот празник'
const sampleEN = 'Personalized gifts for every celebration'

const fonts = [
  { name: 'Caveat', className: caveat.className, desc: 'Casual, fast handwriting with natural variation' },
  { name: 'Marck Script', className: marckScript.className, desc: 'Elegant flowing cursive' },
  { name: 'Bad Script', className: badScript.className, desc: 'Neat personal handwriting' },
  { name: 'Amatic SC', className: amaticSC.className, desc: 'Narrow, tall handwritten style' },
  { name: 'Neucha', className: neucha.className, desc: 'Relaxed, rounded handwriting' },
  { name: 'Pangolin', className: pangolin.className, desc: 'Friendly, informal handwriting' },
  { name: 'Andika', className: andika.className, desc: 'Clean, readable handwriting-inspired' },
]

export default function TestFontsPage() {
  return (
    <div className="min-h-screen bg-canvas-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-ds-title text-ink-strong">Кирилични ракописни фонтови</h1>
          <p className="text-ink-muted text-ds-body">Одбери го фонтот кој најмногу ти се допаѓа</p>
        </div>

        {fonts.map((font) => (
          <div key={font.name} className="rounded-2xl border border-border-soft bg-surface-base p-6 shadow-card space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-heading text-ds-body-lg text-ink-strong">{font.name}</h2>
              <span className="text-ds-body-sm text-ink-muted">{font.desc}</span>
            </div>
            <div className={`${font.className} space-y-3`}>
              <p className="text-3xl text-ink-strong">{sampleMK}</p>
              <p className="text-2xl text-ink-base">{sampleMK2}</p>
              <p className="text-xl text-ink-muted">{sampleEN}</p>
              <p className="text-4xl text-primary-600">Гербера — Подароци со љубов</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
