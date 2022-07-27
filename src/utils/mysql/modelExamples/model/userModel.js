var UserSQL = {
    insert:'INSERT INTO account(id,username) VALUES(?,?)',
    queryAll:'SELECT * FROM account',
    getUserById:'SELECT * FROM account WHERE id = ? ',
};
module.exports = UserSQL;