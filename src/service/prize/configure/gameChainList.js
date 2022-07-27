const gameChainList = [
    "btcusdt"
]

const getGameChainList = () =>{
    return new Promise((resolve, reject) => {
        resolve(gameChainList)
    })
}

module.exports = getGameChainList