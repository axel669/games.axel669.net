import { html, render, useSignal, signal, effect }
from "https://cdn.jsdelivr.net/npm/preact-htm-signals-standalone/dist/standalone.js"

const { wsx } = windstorm

const rand = (n) => Math.floor(
    Math.random() * n
)
const offBoard = Array.from(
    { length: 25 },
    () => false
)
const toggle = (board, x, y) => {
    const next = [...board]
    const flips = [
        idx(x, y),
        idx(x + 1, y),
        idx(x - 1, y),
        idx(x, y + 1),
        idx(x, y - 1),
    ]
    for (const p of flips) {
        next[p] = flip(next[p])
    }
    return next
}
const pos = (index) => [
    index % 5,
    Math.floor(index / 5)
]
const idx = (x, y) =>
    (x > -1 && x < 5 && y > -1 && y < 5)
    ? y * 5 + x
    : -1
const flip = value => value === false
const Board = (props) => {
    const { board } = props
    const click = (x, y) => board.value = toggle(board.value, x, y)

    const tiles = board.value.map(
        (on, index) => {
            const [x, y] = pos(index)
            const ws = wsx({
                b: "1px solid var(--secondary)",
                r: "4px",
                cur: "pointer",
                bg: on && "&secondary"
            })
            return html`
                <lo-pane ws-x="${ws}" onClick=${() => click(x, y)} />
            `
        }
    )

    return html`
        <ws-grid ws-x="gr-col[1fr_1fr_1fr_1fr_1fr] gr-arow[70px] p[0px]">
            ${tiles}
        </ws-grid>
    `
}

const ThemeSelector = (props) => {
    const { theme } = props
    const set = (name) => () => theme.value = name
    const active = (name) => theme.value === name ? true : null

    return html`
        <ws-tabs ws-x="$color[primary] @solid p[0px]">
            <ws-tab tab-selected=${active("light")} onClick=${set("light")}>Light</ws-tab>
            <ws-tab tab-selected=${active("dark")} onClick=${set("dark")}>Dark</ws-tab>
            <ws-tab tab-selected=${active("tron")} onClick=${set("tron")}>Tron</ws-tab>
        </ws-tabs>
    `
}

const theme = signal(localStorage.theme ?? "tron")
effect(
    () => localStorage.theme = theme.value
)
const App = () => {
    const board = useSignal(offBoard)
    const newGame = () =>
        board.value = Array.from({ length: 25 }).reduce(
            ([board, prev]) => {
                let p = prev
                while (p === prev) {
                    p = rand(25)
                }
                return [
                    toggle(board, ...pos(p)),
                    p
                ]
            },
            [offBoard, -1]
        )[0]

    return html`
        <div ws-x="flex fl-center pos[fixed] inset[0px] theme[${theme}]">
            <ws-paper ws-x="w[360px] @outline">
                <ws-titlebar ws-x="@fill $color[primary] slot[header]">
                    <span ws-x="slot[title] $title">
                        Lights Out
                    </span>

                    <button ws-x="@flat $compact slot[action] t-ws[pre]"
                    onClick=${newGame}>
                        New Game
                    </button>
                </ws-titlebar>

                <ws-flex ws-x="slot[content]">
                    <${ThemeSelector} theme=${theme} />
                    <${Board} board=${board} />
                </ws-flex>
            </ws-paper>
        </div>
    `
}

render(
    html`<${App} />`,
    document.body
)
