const repeat = (func, ms) => {
    setTimeout(() => {
        func()
        repeat(func, ms)
    }, ms)
}

module.exports = {
    repeat:repeat
}