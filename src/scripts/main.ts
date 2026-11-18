import { initSelectionTheme } from './selection'
import { initNav, initNavScrollState, initScrollSpy } from './nav'
import { initClock } from './clock'
import { initWeather } from './weather'
import { initFaq, initWorkRows } from './accordions'
import { initAscii } from './ascii'
import { initContactForm } from './contact-form'
import { initReveals } from './reveal'
import { initSelFrames } from './sel-frame'
import { initSpotlights } from './spotlight'
import { initSun } from './sun'
import { initViewportReadout } from './viewport'
import { initBuildInfo } from './build-info'

// Marks that JS is active so CSS can safely hide .reveal targets
document.documentElement.classList.add('js')

// Console easter egg
console.log(
  `%c
██████╗ ███████╗███████╗██╗███████╗██╗███╗   ██╗ ██████╗
██╔══██╗██╔════╝██╔════╝██║╚══███╔╝██║████╗  ██║██╔════╝
██████╔╝█████╗  ███████╗██║  ███╔╝ ██║██╔██╗ ██║██║  ███╗
██╔══██╗██╔══╝  ╚════██║██║ ███╔╝  ██║██║╚██╗██║██║   ██║
██║  ██║███████╗███████║██║███████╗██║██║ ╚████║╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝

Built with care :)
 /\\_/\\
( o.o )
 > ^ <
`,
  'font-family: monospace; line-height: 1.2;',
)

initSelectionTheme()
initNav()
initNavScrollState()
initScrollSpy()
initClock()
initSelFrames()
initFaq()
initWorkRows()
initContactForm()
initReveals()
initSpotlights()

// Footer telemetry
void initWeather()
initSun()
initViewportReadout()
initBuildInfo()
initAscii()

// Footer copyright year
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

// "Limited spots in Qx" badge follows the calendar
const quarterEl = document.getElementById('quarter')
if (quarterEl) {
  const quarter = Math.floor(new Date().getMonth() / 3) + 1
  quarterEl.textContent = `Q${quarter}`
}
