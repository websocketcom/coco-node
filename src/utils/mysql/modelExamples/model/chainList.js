var UserSQL = {
    insert:'INSERT INTO ea_chain_list(id,username) VALUES(?,?)',
    queryAll:'SELECT * FROM ea_chain_list where status = ?',
    getUserById:'SELECT * FROM ea_chain_list WHERE id = ? ',
};
module.exports = UserSQL;