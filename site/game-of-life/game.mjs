import { html, render, useSignal, signal, effect, useRef, useEffect }
from "https://cdn.jsdelivr.net/npm/preact-htm-signals-standalone/dist/standalone.js"

const { wsx } = windstorm

const ThemeSelector = (props) => {
    const { theme } = props
    const set = (name) => () => theme.value = name

    const tabs = ["light", "dark", "tron"].map(
        name => {
            const info = wsx({
                "$tab-selected": theme.value === name
            })
            const label = `${name[0].toUpperCase()}${name.slice(1)}`

            return html`
                <ws-tab ws-x=${info} onClick=${set(name)}>
                    ${label}
                </ws-tab>
            `
        }
    )

    return html`
        <ws-tabs ws-x="$color[primary] @solid p[0px]">
            ${tabs}
        </ws-tabs>
    `
}

const theme = signal(localStorage.theme ?? "tron")
effect(
    () => localStorage.theme = theme.value
)

const count = 35
const side = 9
const space = side + 1
const fieldSize = space * count + 1
const size = count ** 2
const idx = (x, y) => y * count + x
const pos = (index) => [
    index % count,
    Math.floor(index / count)
]
const clearField = () => Array.from({ length: size }, (_, i) => [pos(i), 0])
const field = signal(
    clearField()
)
const Field = () => {
    const canvas = useRef()
    effect(
        () => {
            const on = field.value.filter(
                (info) => info[1] === 1
            )
            const off = field.value.filter(
                (info) => info[1] === 0
            )
            if (canvas.current === undefined) {
                return
            }
            const ctx = canvas.current.getContext("2d")

            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, 400, 400)

            ctx.fillStyle = "white"
            for (const [[x, y]] of off) {
                ctx.fillRect(x * space + 1, y * space + 1, side, side)
            }
            ctx.fillStyle = "teal"
            for (const [[x, y]] of on) {
                ctx.fillRect(x * space + 1, y * space + 1, side, side)
            }
        }
    )
    useEffect(
        () => field.value = clearField(),
        []
    )
    const drawPoint = (evt) => {
        if (evt.buttons !== 1) {
            return
        }
        const index = idx(
            (evt.offsetX / space)|0,
            (evt.offsetY / space)|0
        )
        mode.value.add(index)
    }

    return html`
        <canvas ref=${canvas}
        style="touch-action: none; width: ${fieldSize}px; height: ${fieldSize}px;"
        width=${fieldSize} height=${fieldSize}
        onPointerMove=${drawPoint}
        onPointerDown=${drawPoint}
        />
    `
}

const spawns = new Set()
const clears = new Set()
const updateCells = () => {
    requestAnimationFrame(updateCells)

    if (spawns.size === 0 && clears.size === 0) {
        return
    }
    const next = [...field.value]
    for (const i of spawns) {
        next[i][1] = 1
    }
    for (const i of clears) {
        next[i][1] = 0
    }
    field.value = next
    spawns.clear()
    clears.clear()
}
requestAnimationFrame(updateCells)

const spawn = [3]
const survive = [2, 3]
const running = signal(false)
const mode = signal(spawns)
setInterval(
    () => {
        if (running.value === false) {
            return
        }

        const space = field.value
        const next = space.map(
            (cell, index) => {
                const [pos, value] = cell
                const surrounding = (
                    (space[index - 1]?.[1] ?? 0)
                    + (space[index + 1]?.[1] ?? 0)
                    + (space[index - count]?.[1] ?? 0)
                    + (space[index - count - 1]?.[1] ?? 0)
                    + (space[index - count + 1]?.[1] ?? 0)
                    + (space[index + count]?.[1] ?? 0)
                    + (space[index + count - 1]?.[1] ?? 0)
                    + (space[index + count + 1]?.[1] ?? 0)
                )
                const newCell = value === 0 && spawn.includes(surrounding)
                const keepCell = value === 1 && survive.includes(surrounding)
                const next = (newCell || keepCell) ? 1 : 0

                return [pos, next]
            }
        )
        field.value = next
        // running.value = false
    },
    100
)

const App = () => {
    const randomize = () => field.value = Array.from(
        { length: size },
        (_, i) => [
            pos(i),
            Math.round(
                Math.random()
            )
        ]
    )
    const clear = () => field.value = clearField()

    const pause = () => running.value = false
    const play = () => running.value = true
    const tabColor = running.value ? "secondary" : "warning"
    const playState = (value) => wsx({
        "$tab-selected": running.value === value
    })

    const modeC = () => mode.value = clears
    const modeS = () => mode.value = spawns
    const modeState = (value) => wsx({
        "$tab-selected": mode.value === value
    })

    return html`
        <div ws-x="flex fl-center pos[fixed] inset[0px] theme[${theme}]">
            <ws-paper ws-x="w[360px] @outline">
                <ws-titlebar ws-x="@fill $color[primary] slot[header]">
                    <span ws-x="slot[title] $title">
                        Game of Life
                    <//>
                <//>

                <ws-flex ws-x="slot[content]">
                    <${ThemeSelector} theme=${theme} />
                    <${Field} />
                    <ws-grid ws-x="p[0px] gr-col[2fr_1fr]">
                        <ws-tabs ws-x="@solid p[0px] $color[primary]">
                            <ws-tab ws-x=${modeState(clears)} onClick=${modeC}>
                                <ws-icon class="ti-eraser" />
                            <//>
                            <ws-tab ws-x=${modeState(spawns)} onClick=${modeS}>
                                <ws-icon class="ti-pencil" />
                            <//>
                        <//>

                        <ws-tabs ws-x="@solid p[0px] row[span_2] fl-dir[column]
                        $color[${tabColor}]">
                            <ws-tab ws-x=${playState(false)} onClick=${pause}>
                                <ws-icon class="ti-player-pause-filled" />
                            <//>
                            <ws-tab ws-x=${playState(true)} onClick=${play}>
                                <ws-icon class="ti-player-play-filled" />
                            <//>
                        <//>

                        <ws-grid ws-x="gr-col[1fr_1fr] p[0px]">
                            <button ws-x="@fill $color[danger]" onClick=${clear}>
                                Clear
                            <//>
                            <button ws-x="@fill $color[accent]" onClick=${randomize}>
                                Randomize
                            <//>
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `
}

render(
    html`<${App} />`,
    document.body
)
