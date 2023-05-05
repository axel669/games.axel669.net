const solvedList = Array.from(
    { length: 16 },
    (_, i) => [
        (i + 1) % 16,
        {
            x: i % 4,
            y: Math.floor(i / 4),
        }
    ]
)
const solved = Object.fromEntries(solvedList)
const values = Object.keys(solved)

const countLess = (nums, target) =>
    nums.reduce(
        (t, n) => {
            if (n !== 0 && n < target) {
                return t + 1
            }
            return t
        },
        0
    )
const parity = (board) => {
    const inversionPositions = Object.entries(board)
        .reduce(
            (pos, info) => {
                const index = info[1].y * 4 + info[1].x
                pos[index] = parseInt(info[0])
                return pos
            },
            Array.from({ length: 16 }, () => 0)
        )
    return (
        (board["0"].y + 1)
        + inversionPositions.reduce(
            (parity, n, index) => (
                parity
                + countLess(
                    inversionPositions.slice(index),
                    n
                )
            ),
            0
        )
    ) % 2
}

const rand = (n) => Math.floor(
    Math.random() * n
)
const scramble = () => {
    const positions = Object.values(solved)
    const next = Object.fromEntries(
        values.map(
            value => [
                value,
                ...positions.splice(
                    rand(positions.length),
                    1
                )
            ]
        )
    )
    if (parity(next) === 1) {
        return {
            ...next,
            "14": next["15"],
            "15": next["14"],
        }
    }
    return next
}

const isSolved = (board) => {
    for (const value of values) {
        if (board[value] !== solved[value]) {
            return false
        }
    }
    return true
}

export default {
    solved,
    scramble,
    isSolved,
}
