import { html, signal }
from "https://cdn.jsdelivr.net/npm/preact-htm-signals-standalone/dist/standalone.js"

const format = (time) => {
    const base = Math.floor(time)
    const seconds = Math.floor(base / 1000)
    const ms = (base % 1000).toString().padStart(3, "0")
    return `${seconds}.${ms}`
}

let epoch = 0
let now = 0
const time = signal(0)
const playing = signal(false)
const tick = () => {
    requestAnimationFrame(tick)
    now = performance.now()
    if (playing.value === false) {
        return
    }
    time.value = now - epoch
}
tick()
const start = () => {
    epoch = performance.now()
    time.value = 0
    playing.value = true
}
const stop = () => {
    playing.value = false
}

const Timer = () => {
    return html`
        <div
        ws-x="flex fl-center t-sz[16px] h[40px] slot[footer]
        b-t[1px_solid_var(--layer-border-color)] bg[&primary-ripple]">
            ${format(time.value)}
        </div>
    `
}

export default Timer
export { start, stop }
