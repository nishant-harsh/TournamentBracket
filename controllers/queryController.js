const tournamentDB = require('../models/model');

function getAll(req, res, next) {
  tournamentDB.getAllCompetitors()
  .then((data) => {
    // console.log('queried the db and returned ' + data.length + ' results');
    res.locals.competitors = data;
    next()
  })
  .catch((err) => {
    next(err);
  })
}
function getOne(req, res, next) {
  tournamentDB.getOneCompetitor(req.params.id)
  .then((data) => {
    console.log("getOne",data)
    res.locals.competitor = data;
    next()
  })
  .catch((err) => {
    next(err)
  })
}

function addTournament(req, res, next) {
  console.log("adding tournament")
  tournamentDB.createTournament(req.body)
  .then((data)=> {
    res.locals.tournament = data;
    console.log("tournament added")
    next()
  })
  .catch((err) => {
    console.log(err)
    
    next(err)
  })
}
function addCompetitors(req, res, next){
  tournamentDB.createCompetitors(req.body)
  .then((data) => {
    res.locals.competitors = data;
    next()
  })
  .catch((err) => {
    next(err);
  })
}
function getOneTournament(req, res, next) {
  tournamentDB.getOneTournament(req.params.id)
  .then((data) => {
    res.locals.tournament = data;
    next();
  })
  .catch((err) => {
    next(err);
  })
}
function getAllTournamentInfo(req, res, next){
  tournamentDB.getTournamentInfo(req.params.id)
  .then((data) => {
    res.locals.tournament = data;
    next();
  })
  .catch((err) => {
    next(err);
  })
}
function bracketBuilder(req, res, next) {
  tournamentDB.buildBracket(req.params.id)
  .then(data => {
    res.locals.bracket = data['tournamentsAndCompetitors'];
    res.locals.matches = data['matches'];
    res.locals.winner = data['winner'];
    next();
  })
  .catch((err) => {
    next(err);
  })
}
function bringmatches(req, res, next) {
  tournamentDB.getMatches(req.params.id)
  .then(data => {
    res.locals.matches = data;
    next();
  })
  .catch((err) => {
    next(err);
  })
}
function bringMatch(req, res, next) {
  tournamentDB.getOneMatch(req.params.id)
  .then(data => {
    res.locals.match = data;
    next();
  })
  .catch((err) => {
    next(err);
  })
}
function updateFinal(req, res, next) {
  console.log("updating finals")
  req.body.tournament_id = req.params.id;
  tournamentDB.updateFinalRound(req.body)
  .then(data => {
    res.locals.match = data;
    next();
  })
}
function destroyTournament(req, res, next) {
  console.log('what>');
  tournamentDB.destroy(req.params.id)
  .then(() => {
    console.log('hey there');
    next()
  })
  .catch(err => {
    next(err)
  })
}

module.exports = {
  getAll: getAll,
  getOne: getOne,
  addTournament: addTournament,
  getOneTournament: getOneTournament,
  addCompetitors: addCompetitors,
  getAllTournamentInfo: getAllTournamentInfo,
  bracketBuilder: bracketBuilder,
  bringmatches: bringmatches,
  bringMatch: bringMatch,
  updateFinal: updateFinal,
  destroyTournament: destroyTournament
}
