var contronlSQL = {
    queryAll:'SELECT cid,type,end_time FROM ea_game_event_list WHERE open > 0 AND begin_time < ? AND end_time > ?',
};
module.exports = contronlSQL;