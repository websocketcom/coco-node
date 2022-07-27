var KlineSQL = {
    insert:`INSERT INTO ea_system_kline(time,symbol,cycle,content) VALUES ?`,
    update:`UPDATE ea_system_kline SET test=?,content=?  WHERE time=? AND symbol=? AND cycle=?`,
    querySymbol:'SELECT * FROM ea_system_kline WHERE symbol = ? AND  cycle = ? ORDER BY time DESC LIMIT ?',
};


module.exports = KlineSQL;