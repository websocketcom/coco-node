var KlineSQL = {
    insert:`INSERT INTO ea_system_klines(time,symbol,cycle,content) VALUES ?`,
    update:`UPDATE ea_system_klines SET test=?,content=?  WHERE time=? AND symbol=? AND cycle=?`,
    querySymbol:'SELECT * FROM ea_system_klines WHERE symbol = ? AND  cycle = ? ORDER BY time DESC LIMIT ?',
};


module.exports = KlineSQL;