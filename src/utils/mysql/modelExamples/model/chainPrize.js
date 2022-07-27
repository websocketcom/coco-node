var PrizeSQL = {
    insert:'INSERT INTO ea_chain_prize(code,period,prize,prizetime) VALUES(?,?,?,?)',
    queryAll:'SELECT * FROM ea_chain_prize',
    getPrizeById:'SELECT * FROM ea_chain_prize WHERE id = ? ',
    getPrizeBy:'SELECT * FROM ea_chain_prize WHERE code = ? AND period = ? AND prizetime = ?',
};
module.exports = PrizeSQL;