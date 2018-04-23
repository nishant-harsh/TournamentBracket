const db = require('../config/connection');

function getAllCompetitors() {
  return db.manyOrNone(`
    SELECT * FROM competitors
  `)
}
function getOneCompetitor(id) {
  return db.one(`
    SELECT * FROM competitors
    WHERE id = $1
    `, id)
}

function getOneTournament(id){
  return db.one(`
    SELECT * FROM tournaments
    WHERE id = $1
    `, id);
}

function createTournament(tournament){
  return db.one(`
                  INSERT INTO tournaments (name, num_comp)
                  VALUES ($/name/, $/num_comp/) RETURNING *`,
  tournament)
  .then((data) => {
    let x = [data];
    function players(player, dat){
      return db.one(`
                      INSERT INTO competitors (comp_name, tournament_id)
                      VALUES ($1, $2) RETURNING *`,
      [player, dat.id])
    };

    for(let i = 0; i < tournament.comp_name.length; i++) {
      x.push(players(tournament.comp_name[i], data))
    }
    return Promise.all(x);
  })
  .then((data) => {
    let y =[data];
    function matches(player, player2, dat, num) {
      return db.one(`
        INSERT INTO matches (comp_a_id, comp_b_id, tournament_id, round_id)
        VALUES ($1, $2, $3, $4) RETURNING *
        `, [ player, player2, dat, num])
    }
    function dummyMatches(dat, num) {
      return db.one(`
        INSERT INTO matches (comp_a_id, comp_b_id, tournament_id, round_id)
        VALUES (1, 1, $1, $2) RETURNING *
        `, [dat, num])
    }

    function loopingMatches() {
      let z = 0;
       for(let i = 1; i < data.length; i += 2) {
      y.push(matches(data[i].id, data[i+1].id ,data[0].id, z))
      z += 1;
    }
        y.push(dummyMatches(data[0].id, 2));
    }
   loopingMatches();

    console.log('y', y);
    return Promise.all(y);
  })
}

function buildBracket(id) {
  return db.tx(t => {
    return t.batch([
                  t.manyOrNone(`
                      SELECT * FROM tournaments
                      JOIN competitors
                      ON competitors.tournament_id = tournaments.id
                      WHERE tournaments.id = $1
                      `, id),
                  t.manyOrNone(`
                        WITH selection1 AS
                        (select competitors.comp_name as name1, matches.tournament_id as tourney, matches.round_id as round, matches.id as matchey
                          FROM matches JOIN competitors ON matches.comp_a_id = competitors.id),
                        selection2 AS
                        (select competitors.comp_name as name2, matches.tournament_id as tourney, matches.round_id as round, matches.id as matchey
                          FROM matches JOIN competitors ON matches.comp_b_id = competitors.id)
                        SELECT * FROM selection1 JOIN selection2 ON selection2.matchey = selection1.matchey WHERE selection1.tourney = $1
                        ORDER BY selection1.round ASC
                        `, id)
                  ])
    .then(data => {
      return data;
    })
}
)}


function getOneMatch(id) {
  return db.one(`
    WITH selection1 AS
      (SELECT matches.comp_a_id as S1a_id, competitors.comp_name as name1, matches.tournament_id as tourney, matches.round_id as round, matches.id as matchey
        FROM matches JOIN competitors ON matches.comp_a_id = competitors.id),
      selection2 AS
      (SELECT matches.comp_b_id as S2b_id, competitors.comp_name as name2, matches.tournament_id as tourney, matches.round_id as round, matches.id as matchey
        FROM matches JOIN competitors ON matches.comp_b_id = competitors.id)
      SELECT * FROM selection1 JOIN selection2 ON selection2.matchey = selection1.matchey WHERE selection1.matchey = $1
    `, id);
}
function updateFinalRound(data) {
  // if( matches.round_id === 0) {
  //   return db.one(`
  //     UPDATE matches
  //     SET comp_a_id = $1
  //     WHERE tournament_id = $2 AND matches.round_id = 2
  //     RETURNING *
  //   `, [winner, id])
  // } else if (matches.round_id === 1) {
  //   return db.one(`
  //     UPDATE matches
  //     SET comp_b_id = $1
  //     WHERE tournament_id = $2 AND matches.round_id = 2
  //     RETURNING *
  //   `, [winner,id])
  // }
  return db.one(`
    UPDATE matches
    SET comp_a_id = $/winner/
    WHERE tournament_id = $/tournament_id/ and matches.round_id = 2
    RETURNING *
    `, data);

}

module.exports = {
  getAllCompetitors: getAllCompetitors,
  getOneCompetitor: getOneCompetitor,
  getOneTournament: getOneTournament,
  createTournament: createTournament,
  buildBracket: buildBracket,
  getOneMatch: getOneMatch,
  updateFinalRound: updateFinalRound

}
