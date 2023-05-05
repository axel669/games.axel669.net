import { html, render, useSignal, signal, effect, useRef }
from "https://cdn.jsdelivr.net/npm/preact-htm-signals-standalone/dist/standalone.js"

import game from "./internals.mjs"

import Timer, { start, stop } from "./comp/timer.mjs"

const { wsx } = windstorm

const ThemeSelector = (props) => {
    const { theme } = props
    const set = (name) => () => theme.value = name
    const active = (name) => theme.value === name ? true : null

    return html`
        <ws-tabs ws-x="$color[primary] @solid p[0px]">
            <ws-tab tab-selected=${active("light")} onClick=${set("light")}>Light<//>
            <ws-tab tab-selected=${active("dark")} onClick=${set("dark")}>Dark<//>
            <ws-tab tab-selected=${active("tron")} onClick=${set("tron")}>Tron<//>
        <//>
    `
}

const Piece = (props) => {
    const { pos, num, move } = props

    const x = pos.x * 100
    const y = pos.y * 100

    const piece = wsx({
        grid: true,
        "t-sz": "24px",
        p: "2px",
        tr: `translate(${x}%, ${y}%)`,
        pos: "absolute",
        w: "25%",
        h: "25%",
    })
    const content = wsx({
        flex: true,
        "fl-center": true,
        b: "1px solid var(--layer-border-color)",
        r: "4px",
        sel: "none"
    })

    return html`
        <game-piece ws-x="${piece}"
        style="transition: transform 100ms linear;"
        onPointerDown=${move}
        >
            <piece-content ws-x="${content}">
                ${num}
            <//>
        <//>
    `
}
const manhattanDist = (a, b) => (
    Math.abs(a.x - b.x)
    + Math.abs(a.y - b.y)
)
const Board = (props) => {
    const { pieces } = props

    const move = (key) =>
        () => {
            const pos = pieces.value[key]
            const pos0 = pieces.value["0"]
            const dist = manhattanDist(pos, pos0)
            if (dist !== 1) {
                return
            }
            pieces.value = {
                ...pieces.value,
                [key]: pos0,
                "0": pos,
            }
            if (game.isSolved(pieces.value) === false) {
                return
            }
            stop()
        }

    const gamePieces = Object.entries(pieces.value).map(
        ([key, pos]) =>
            (key === "0")
            ? null
            : html`<${Piece} pos=${pos} num=${key} move=${move(key)} />`
    )

    return html`
        <game-board ws-x="pos[relative] flex h[350px]">
            ${gamePieces}
        <//>
    `
}

const theme = signal(localStorage.theme ?? "tron")
effect(
    () => localStorage.theme = theme.value
)

const App = () => {
    const pieces = useSignal(game.solved)
    const newGame = () => {
        pieces.value = game.scramble()
        start()
    }

    return html`
        <div ws-x="flex fl-center pos[fixed] inset[0px] theme[${theme}]">
            <ws-paper ws-x="w[360px] @outline">
                <ws-titlebar ws-x="@fill $color[primary] slot[header]">
                    <span ws-x="slot[title] $title">
                        15 Puzzle
                    <//>

                    <button ws-x="@flat $compact slot[action] t-ws[pre]"
                    onClick=${newGame}>
                        New Game
                    <//>
                <//>

                <ws-flex ws-x="slot[content]">
                    <${ThemeSelector} theme=${theme} />
                    <${Board} pieces=${pieces} />
                    <//>
                <${Timer} />
            <//>
        <//>
    `
}

render(
    html`<${App} />`,
    document.body
)
