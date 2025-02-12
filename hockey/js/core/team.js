/**
 * @name core.team
 * @namespace Functions operating on team objects, parts of team objects, or arrays of team objects.
 */
define(["dao", "globals", "core/player", "lib/bluebird", "lib/underscore", "util/eventLog", "util/helpers", "util/random"], function (dao, g, player, Promise, _, eventLog, helpers, random) {


    "use strict";

    /**
     * Add a new row of season attributes to a team object.
     * 
     * There should be one season attributes row for each year, and a new row should be added for each team at the start of a season.
     *
     * @memberOf core.team
     * @param {Object} t Team object.
     * @return {Object} Updated team object.
     */
    function addSeasonRow(t) {
        var newSeason, s;
		var startingCash;
		
        s = t.seasons.length - 1; // Most recent season

        // Make sure this isn't a duplicate season
        if (s >= 0 && t.seasons[s].season === g.season) {
            console.log("Attempting to add duplicate team season record!");
            return t;
        }

		if (g.leagueType == 0) {
		  startingCash = 10000;
		} else {
		  startingCash = 2500;					
		}
        // Initial entry
        newSeason = {
            season: g.season,
            gp: 0,
            att: 0,
            cash: startingCash,
            overtime: 0,			
            points: 0,					
            won: 0,
            lost: 0,
            wonHome: 0,
            lostHome: 0,
            wonAway: 0,
            lostAway: 0,
            wonDiv: 0,
            lostDiv: 0,
            wonConf: 0,
            lostConf: 0,
            lastTen: [],
            lastTenOT: [],
            streak: 0,
            playoffRoundsWon: -1,  // -1: didn't make playoffs. 0: lost in first round. ... 4: won championship
            hype: Math.random(),
            pop: 0,  // Needs to be set somewhere!
            tvContract: {
                amount: 0,
                exp: 0
            },
            revenues: {
                merch: {
                    amount: 0,
                    rank: 15.5
                },
                sponsor: {
                    amount: 0,
                    rank: 15.5
                },
                ticket: {
                    amount: 0,
                    rank: 15.5
                },
                nationalTv: {
                    amount: 0,
                    rank: 15.5
                },
                localTv: {
                    amount: 0,
                    rank: 15.5
                }
            },
            expenses: {
                salary: {
                    amount: 0,
                    rank: 15.5
                },
                luxuryTax: {
                    amount: 0,
                    rank: 15.5
                },
                minTax: {
                    amount: 0,
                    rank: 15.5
                },
                buyOuts: {
                    amount: 0,
                    rank: 15.5
                },
                scouting: {
                    amount: 0,
                    rank: 15.5
                },
                coaching: {
                    amount: 0,
                    rank: 15.5
                },
                health: {
                    amount: 0,
                    rank: 15.5
                },
                facilities: {
                    amount: 0,
                    rank: 15.5
                }
            },
            payrollEndOfSeason: -1
        };

        if (s >= 0) {
            // New season, carrying over some values from the previous season
            newSeason.pop = t.seasons[s].pop * random.uniform(0.98, 1.02);  // Mean population should stay constant, otherwise the economics change too much
            newSeason.hype = t.seasons[s].hype;
            newSeason.cash = t.seasons[s].cash;
            newSeason.tvContract = t.seasons[s].tvContract;
        }

        t.seasons.push(newSeason);

        return t;
    }

    /**
     * Add a new row of stats to a team object.
     * 
     * A row contains stats for unique values of (season, playoffs). So new rows need to be added when a new season starts or when a team makes the playoffs.
     *
     * @memberOf core.team
     * @param {Object} t Team object.
     * @param {=boolean} playoffs Is this stats row for the playoffs or not? Default false.
     * @return {Object} Updated team object.
     */
    function addStatsRow(t, playoffs) {
        var i;		
        playoffs = playoffs !== undefined ? playoffs : false;

        // If there is already an entry for this season+playoffs, do nothing
        for (i = 0; i < t.stats.length; i++) {
            if (t.stats[i].season === g.season && t.stats[i].playoffs === playoffs) {
                return t;
            }
        }		
		
        t.stats.push({
            season: g.season,
            playoffs: playoffs,
            gp: 0,
            min: 0,
            sfg: 0,
            sfga: 0,
            sfgAtRim: 0,
            sfgaAtRim: 0,
            sfgLowPost: 0,
            sfgaLowPost: 0,
            sfgMidRange: 0,
            sfgaMidRange: 0,
            stp: 0,
            stpa: 0,
            sft: 0,
            sfta: 0,
            fg: 0,
            goals: 0,			
            fga: 0,
            fgAtRim: 0,
            fgaAtRim: 0,
            fgLowPost: 0,
            fgaLowPost: 0,
            fgMidRange: 0,
            fgaMidRange: 0,
            tp: 0,
            tpa: 0,
            ft: 0,
            fta: 0,
            orb: 0,
            drb: 0,
            trb: 0,
            ast: 0,
            tov: 0,
            stl: 0,
            blk: 0,
            pf: 0,
            pts: 0,
            oppPts: 0,
            oppGoals: 0,			
			plusminus:0,
			mfg:0,
			fgs:0,
			sfgs:0,
			pmin:0,
			hits:0,
			shifts:0,
			ppmin:0,
			shmin:0,
			emin:0,
			fow:0,
			fol:0,
			sfgsp:0,
			fop:0,
			ppg:0,
			shg:0,
			pp:0,
			sh:0,
			ppgp:0,
			shgp:0,
			shtoutg:0
        });

        return t;
    }

    /**
     * Create a new team object.
     * 
     * @memberOf core.team
     * @param {Object} tm Team metadata object, likely from core.league.create.
     * @return {Object} Team object to insert in the database.
     */
    function generate(tm) {
        var strategy, t;

        if (tm.hasOwnProperty("strategy")) {
            strategy = tm.strategy;
        } else {
            strategy = Math.random() > 0.5 ? "contending" : "rebuilding";
        }

		
        t = {
            tid: tm.tid,
            cid: tm.cid,
            did: tm.did,
            region: tm.region,
            name: tm.name,
            abbrev: tm.abbrev,
            imgURL: tm.imgURL !== undefined ? tm.imgURL : "",
            stats: tm.hasOwnProperty("stats") ? tm.stats : [],
            seasons: tm.hasOwnProperty("seasons") ? tm.seasons : [],
            budget: {
                ticketPrice: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.amount : helpers.round(25 + 25 * (g.numTeams - tm.popRank) / (g.numTeams - 1), 2),
                    rank: tm.hasOwnProperty("budget") ? tm.budget.ticketPrice.rank : tm.popRank
                },
                scouting: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.scouting.amount : helpers.round( 700 - g.leagueType*0 + 600 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.scouting.rank : tm.popRank
                },
                coaching: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.coaching.amount : helpers.round(700 - g.leagueType*0 + 600 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.coaching.rank : tm.popRank
                },
                health: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.health.amount : helpers.round(700 - g.leagueType*0 + 600 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.health.rank : tm.popRank
                },
                facilities: {
                    amount: tm.hasOwnProperty("budget") ? tm.budget.facilities.amount : helpers.round(700 - g.leagueType*0 + 600 * (g.numTeams - tm.popRank) / (g.numTeams - 1)) * 10,
                    rank: tm.hasOwnProperty("budget") ? tm.budget.facilities.rank : tm.popRank
                }
            },
            strategy: strategy
        };

        if (!tm.hasOwnProperty("seasons")) {
            t = addSeasonRow(t);
            t.seasons[0].pop = tm.pop;
        }
        if (!tm.hasOwnProperty("stats")) {
            t = addStatsRow(t);
        }

        return t;
    }

	 function switchPlayer(players,i,j) {
	 var tempPlayer;
	 				tempPlayer = players[i];
					players[i] = players[j]
					players[j] = tempPlayer;
		return players;
	 }		
	
	
     /**
     * Sort a team's roster based on player ratings and stats.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players readwrite; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise}
     */
    function rosterAutoSort(tx, tid) {
        if (tx === null) {
            tx = dao.tx("players", "readwrite");
        }

        // Get roster and sort by value (no potential included)
        return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i;

            players = player.filter(players, {
                attrs: ["pid", "valueNoPot","pos", "valueNoPotFuzz"],
                showNoStats: true,
                showRookies: true
            });
            // Fuzz only for user's team
            if (tid === g.userTid && g.autoPlaySeasons === 0) {
                players.sort(function (a, b) { return b.valueNoPotFuzz - a.valueNoPotFuzz; });
            } else {
                players.sort(function (a, b) { return b.valueNoPot - a.valueNoPot; });
            }
			/////////////////////////
			
			var goalies;
			var i,k,switched;
			
			goalies = 0;
			//weakestDefender = 21;		
	  //      console.log("got here");		
			
			// 1) find best goalie
			// 2) sort for next 5 best
			// 3) order rest of goalies
			// 4) sort for rest of team
			
			
	/*		for (i = 0; i < players.length; i++) {
				if (players[i].pos == "G") {
					if (goalies == 0) {
						if (i<6) {
							switchPlayer(players,goalies,i);					
							goalies += 1;
						} else {
							switchPlayer(players,goalies,i);					
							switchPlayer(players,1,i);					
							switchPlayer(players,2,i);					
							switchPlayer(players,3,i);					
							switchPlayer(players,4,i);					
							switchPlayer(players,5,i);					
							goalies += 1;						 	
						}
					} else {
						switchPlayer(players,goalies+5,i);					
						goalies += 1;						 	
						
					}
					switchPlayer(players,0,i);					
			//		console.log("got here switch");		
				}

			}
			
			//for (i = 0; i < 6; i++) {
				switchPlayer(players,0,5);					
				switchPlayer(players,0,1);					
				switchPlayer(players,1,2);					
				switchPlayer(players,2,3);					
				switchPlayer(players,3,4);								  
		//	}
			*/
				/*for (i = 6; i < players.length; i++) {
					if (players[i].pos == "G") {
						switchPlayer(players,goalies,i);					
						goalies += 1;
					}

				}*/	
	///////////////////			
				
			 /*   for (i = 0; i < players.length; i++) {
					players[i].rosterOrder = i;
				}			*/
				
				

			var tempPlayer;
			
			// order top 15 by offense/defense
			//console.log("got here");
		//console.log("players.length: "+players.length);			
            for (i = 0; i < players.length; i++) {
				//switched = i;
	//	console.log("players[i].valueNoPot: "+players[i].valueNoPot);							
				for (k = (i+1); k < players.length; k++) {
//				   if ( (players[k].rosterOrder> players[i].rosterOrder) && (i<3) && ( ((players[i].valueNoPot < players[k].valueNoPot) &&  (players[k].pos == "C" || players[k].pos == "RW" || players[k].pos == "LW") ) || ( players[i].pos == "RD" || players[i].pos == "LD")  ) )  {
				   if ( (i<3) && ( ((players[i].valueNoPot < players[k].valueNoPot) &&  (players[k].pos == "C" || players[k].pos == "RW" || players[k].pos == "LW") ) || ( players[i].pos == "G" ||  players[i].pos == "RD" || players[i].pos == "LD")  ) )  {
						//console.log("before"+players[i]+" "+players[k]);
					//	console.log("before switch old: "+players[k].pos+" offense: "+players[i].pos);
						players = switchPlayer(players,i,k);
						//console.log("after switch old: "+players[k].pos+" offense: "+players[i].pos);
						/*tempPlayer = players[i].rosterOrder;
						players[i].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
						
						//console.log("after"+players[i]+" "+players[k]);
					//	i = k;
				   } else if  (  ( (i>2) && (i<5) )  && ( ( (players[i].valueNoPot < players[k].valueNoPot)  && (players[k].pos == "LD" || players[k].pos == "RD" )) || ( players[i].pos == "G" || players[i].pos == "C" || players[i].pos == "RW" || players[i].pos == "LW")  ) ) {
						players = switchPlayer(players,i,k);
						/*tempPlayer = players[switched].rosterOrder;
						players[switched].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
					//	switched = k;						
				   } else if ( ( (i>4) && (i<8) ) && ( ((players[i].valueNoPot < players[k].valueNoPot) &&  (players[k].pos == "C" || players[k].pos == "RW" || players[k].pos == "LW") ) || ( players[i].pos == "G" ||  players[i].pos == "RD" || players[i].pos == "LD")  ) )  {
						//console.log("before"+players[i]+" "+players[k]);
					//	console.log("before switch old: "+players[k].pos+" offense: "+players[i].pos);
						players = switchPlayer(players,i,k);
						//console.log("after switch old: "+players[k].pos+" offense: "+players[i].pos);
						/*tempPlayer = players[i].rosterOrder;
						players[i].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
						
						//console.log("after"+players[i]+" "+players[k]);
					//	i = k;
				   } else if  (  ( (i>7) && (i<10) )  && ( ( (players[i].valueNoPot < players[k].valueNoPot)  && (players[k].pos == "LD" || players[k].pos == "RD" )) || ( players[i].pos == "G" || players[i].pos == "C" || players[i].pos == "RW" || players[i].pos == "LW")  ) ) {
						players = switchPlayer(players,i,k);
						/*tempPlayer = players[switched].rosterOrder;
						players[switched].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
					//	switched = k;						
				   } else if ( ( (i>9) && (i<13) ) && ( ((players[i].valueNoPot < players[k].valueNoPot) &&  (players[k].pos == "C" || players[k].pos == "RW" || players[k].pos == "LW") ) || ( players[i].pos == "G" ||  players[i].pos == "RD" || players[i].pos == "LD")  ) )  {
						//console.log("before"+players[i]+" "+players[k]);
					//	console.log("before switch old: "+players[k].pos+" offense: "+players[i].pos);
						players = switchPlayer(players,i,k);
						//console.log("after switch old: "+players[k].pos+" offense: "+players[i].pos);
						/*tempPlayer = players[i].rosterOrder;
						players[i].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
						
						//console.log("after"+players[i]+" "+players[k]);
					//	i = k;
				   } else if  (  ( (i>12) && (i<15) )  && ( ( (players[i].valueNoPot < players[k].valueNoPot)  && (players[k].pos == "LD" || players[k].pos == "RD" )) || ( players[i].pos == "G" || players[i].pos == "C" || players[i].pos == "RW" || players[i].pos == "LW")  ) ) {
						players = switchPlayer(players,i,k);
						/*tempPlayer = players[switched].rosterOrder;
						players[switched].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
					//	switched = k;						
				   } else if   ( ((i<18) )  && ( ( (players[i].valueNoPot < players[k].valueNoPot)  && (players[k].pos != "G" )) || ( players[i].pos == "G")  ) ) {
					//	switchPlayer(players,switched,k);
						players = switchPlayer(players,i,k);					
						/*tempPlayer = players[switched].rosterOrder;
						players[switched].rosterOrder = players[k].rosterOrder;
						players[k].rosterOrder = tempPlayer;						*/
					//	switched = k;						
					
				   } else if  (  ( (i>17) && (i<20) )  && ( ( (players[i].valueNoPot < players[k].valueNoPot)  && (players[k].pos == "G" )) || ( players[i].pos != "G")  ) ) {
					//	switchPlayer(players,switched,k);
//						console.log(k+" before switch old: "+players[k].pos+" offense: "+players[i].pos);	
						
						players = switchPlayer(players,i,k);					
				   } else if ((i>19) && (players[i].valueNoPot < players[k].valueNoPot) ) {
						players = switchPlayer(players,i,k);					
				   }
				}
            }
			
           for (i = 0; i < players.length; i++) {
                players[i].rosterOrder = i;
				//console.log(players[i].rosterOrder+" "+players[i].valueNoPot+" "+players[i].pos);
            }					
				//	console.log("roster order changed");

            // Update rosterOrder
             return dao.players.iterate({
                ot: tx,
                index: "tid",
                key: tid,
                callback: function (p) {
                    var i;
                    for (i = 0; i < players.length; i++) {
                        if (players[i].pid === p.pid) {
                            if (p.rosterOrder !== players[i].rosterOrder || p.active != players[i].active) {
                                // Only write to DB if this actually changes							
								if (i<23) {
									p.active = true;
								} else {
									p.active = false;
								}							
								p.rosterOrder = players[i].rosterOrder;
								return p;								
							}
                            break;
                        }
                    }
 

                }
            });
        });
    }
	
    /**
    * Gets all the contracts a team owes.
    *
    * This includes contracts for players who have been released but are still owed money.
    *
    * @memberOf core.team
    * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
    * @param {number} tid Team ID.
    * @returns {Promise.Array} Array of objects containing contract information.
    */
    function getContracts(tx, tid) {
        var contracts;

        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        // First, get players currently on the roster
        return dao.players.getAll({
            ot: tx,
            index: "tid",
            key: tid
        }).then(function (players) {
            var i;

            contracts = [];
            for (i = 0; i < players.length; i++) {
                contracts.push({
                    pid: players[i].pid,
                    name: players[i].name,
                    skills: players[i].ratings[players[i].ratings.length - 1].skills,
                    injury: players[i].injury,
                    watch: players[i].watch !== undefined ? players[i].watch : false, // undefined check is for old leagues, can delete eventually
                    amount: players[i].contract.amount,
                    exp: players[i].contract.exp,
                    released: false
                });
            }

            // Then, get any released players still owed money
            return dao.releasedPlayers.getAll({
                ot: tx,
                index: "tid",
                key: tid
            });
        }).then(function (releasedPlayers) {
            if (releasedPlayers.length === 0) {
                return contracts;
            }

            return Promise.map(releasedPlayers, function (releasedPlayer) {
                return dao.players.get({
                    ot: tx,
                    key: releasedPlayer.pid
                }).then(function (p) {
                    if (p !== undefined) { // If a player is deleted, such as if the user deletes retired players to improve performance, this will be undefined
                        contracts.push({
                            pid: releasedPlayer.pid,
                            name: p.name,
                            skills: p.ratings[p.ratings.length - 1].skills,
                            injury: p.injury,
                            amount: releasedPlayer.contract.amount,
                            exp: releasedPlayer.contract.exp,
                            released: true
                        });
                    } else {
                        contracts.push({
                            pid: releasedPlayer.pid,
                            name: "Deleted Player",
                            skills: [],
                            amount: releasedPlayer.contract.amount,
                            exp: releasedPlayer.contract.exp,
                            released: true
                        });
                    }
                });
            }).then(function () {
                return contracts;
            });
        });
    }

    /**
     * Get the total current payroll for a team.
     *
     * This includes players who have been released but are still owed money from their old contracts.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} tx An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @param {number} tid Team ID.
     * @return {Promise.<number, Array=>} Resolves to an array; first argument is the payroll in thousands of dollars, second argument is the array of contract objects from dao.contracts.getAll.
     */
    function getPayroll(tx, tid) {
        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        return getContracts(tx, tid).then(function (contracts) {
            var i, payroll;

			contracts.sort(function (a, b) { return b.amount - a.amount; });
            payroll = 0;
            for (i = 0; i < contracts.length; i++) {
				if (i<23) {
					payroll += contracts[i].amount;  // No need to check exp, since anyone without a contract for the current season will not have an entry
					
				}
            }

            return [payroll, contracts];
        });
    }

    /**
     * Get the total current payroll for every team team.
     *
     * @memberOf core.team
     * @param {IDBTransaction|null} ot An IndexedDB transaction on players and releasedPlayers; if null is passed, then a new transaction will be used.
     * @return {Promise} Resolves to an array of payrolls, ordered by team id.
     */
    function getPayrolls(tx) {
        var promises, tid;

        tx = dao.tx(["players", "releasedPlayers"], "readonly", tx);

        promises = [];
        for (tid = 0; tid < g.numTeams; tid++) {
            promises.push(getPayroll(tx, tid).get(0));
        }

        return Promise.all(promises);
    }	

    /**
     * Retrieve a filtered team object (or an array of player objects) from the database by removing/combining/processing some components.
     *
     * This can be used to retrieve information about a certain season, compute average statistics from the raw data, etc.
     *
     * This is similar to player.filter, but has some differences. If only one season is requested, the attrs, seasonAttrs, and stats properties will all be merged on the root filtered team object for each team. "stats" is broken out into its own property only when multiple seasons are requested (options.season is undefined). "seasonAttrs" should behave similarly, but it currently doesn't because it just hasn't been used that way anywhere yet.
     * 
     * @memberOf core.team
     * @param {Object} options Options, as described below.
     * @param {number=} options.season Season to retrieve stats/ratings for. If undefined, return stats for all seasons in a list called "stats".
     * @param {number=} options.tid Team ID. Set this if you want to return only one team object. If undefined, an array of all teams is returned, ordered by tid by default.
     * @param {Array.<string>=} options.attrs List of team attributes to include in output (e.g. region, abbrev, name, ...).
     * @param {Array.<string>=} options.seasonAttrs List of seasonal team attributes to include in output (e.g. won, lost, payroll, ...).
     * @param {Array.<string=>} options.stats List of team stats to include in output (e.g. fg, orb, ast, blk, ...).
     * @param {boolean=} options.totals Boolean representing whether to return total stats (true) or per-game averages (false); default is false.
     * @param {boolean=} options.playoffs Boolean representing whether to return playoff stats or not; default is false. Unlike player.filter, team.filter returns either playoff stats or regular season stats, never both.
     * @param {string=} options.sortby Sorting method. "winp" sorts by descending winning percentage. If undefined, then teams are returned in order of their team IDs (which is alphabetical, currently).
     * @param {IDBTransaction|null=} options.ot An IndexedDB transaction on players, releasedPlayers, and teams; if null/undefined, then a new transaction will be used.
     * @return {Promise.(Object|Array.<Object>)} Filtered team object or array of filtered team objects, depending on the inputs.
     */
    function filter(options) {
        var filterAttrs, filterSeasonAttrs, filterStats, filterStatsPartial;

if (arguments[1] !== undefined) { throw new Error("No cb should be here"); }

        options = options !== undefined ? options : {};
        options.season = options.season !== undefined ? options.season : null;
        options.tid = options.tid !== undefined ? options.tid : null;
        options.attrs = options.attrs !== undefined ? options.attrs : [];
        options.seasonAttrs = options.seasonAttrs !== undefined ? options.seasonAttrs : [];
        options.stats = options.stats !== undefined ? options.stats : [];
        options.totals = options.totals !== undefined ? options.totals : false;
        options.playoffs = options.playoffs !== undefined ? options.playoffs : false;
        options.sortBy = options.sortBy !== undefined ? options.sortBy : "";

        // Copys/filters the attributes listed in options.attrs from p to fp.
        filterAttrs = function (ft, t, options) {
            var j;

            for (j = 0; j < options.attrs.length; j++) {
                if (options.attrs[j] === "budget") {
                    ft.budget = helpers.deepCopy(t.budget);
                    _.each(ft.budget, function (value, key) {
                        if (key !== "ticketPrice") {  // ticketPrice is the only thing in dollars always
                            value.amount /= 1000;
                        }
                    });
                } else {
                    ft[options.attrs[j]] = t[options.attrs[j]];
                }
            }
        };

        // Copys/filters the seasonal attributes listed in options.seasonAttrs from p to fp.
        filterSeasonAttrs = function (ft, t, options) {
            var j, lastTenLost, lastTenWon, lastTenOT, tsa;

            if (options.seasonAttrs.length > 0) {
                for (j = 0; j < t.seasons.length; j++) {
                    if (t.seasons[j].season === options.season) {
                        tsa = t.seasons[j];
                        break;
                    }
                }
// Sometimes get an error when switching to team finances page
//if (tsa.revenues === undefined) { debugger; }
                // Revenue and expenses calculation
                tsa.revenue = _.reduce(tsa.revenues, function (memo, revenue) { return memo + revenue.amount; }, 0);
                tsa.expense = _.reduce(tsa.expenses, function (memo, expense) { return memo + expense.amount; }, 0);

                for (j = 0; j < options.seasonAttrs.length; j++) {
                    if (options.seasonAttrs[j] === "winp") {
                        ft.winp = 0;
                        if (tsa.won + tsa.lost > 0) {
                            ft.winp = tsa.won / (tsa.won + tsa.lost);
                        }
                    } else if (options.seasonAttrs[j] === "att") {
                        ft.att = 0;
                        if (!tsa.hasOwnProperty("gpHome")) { tsa.gpHome = Math.round(tsa.gp / 2); } // See also game.js and teamFinances.js
                        if (tsa.gpHome > 0) {
                            ft.att = tsa.att / tsa.gpHome;

                        }
                    } else if (options.seasonAttrs[j] === "cash") {
                        ft.cash = tsa.cash / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "revenue") {
                        ft.revenue = tsa.revenue / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "profit") {
                        ft.profit = (tsa.revenue - tsa.expense) / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "salaryPaid") {
                        ft.salaryPaid = tsa.expenses.salary.amount / 1000;  // [millions of dollars]
                    } else if (options.seasonAttrs[j] === "payroll") {
                        // Handled later
                        ft.payroll = null;
                    } else if (options.seasonAttrs[j] === "lastTen") {
                        lastTenWon = _.reduce(tsa.lastTen, function (memo, num) { return memo + num; }, 0);
                        lastTenOT = _.reduce(tsa.lastTenOT, function (memo, num) { return memo + num; }, 0);
                        lastTenLost = tsa.lastTen.length - lastTenWon - lastTenOT;
                        ft.lastTen = lastTenWon + "-" + lastTenLost+ "-" + lastTenOT;
                    } else if (options.seasonAttrs[j] === "streak") {  // For standings
                        if (tsa.streak === 0) {
                            ft.streak = "None";
                        } else if (tsa.streak > 0) {
                            ft.streak = "Won " + tsa.streak;
                        } else if (tsa.streak < 0) {
                            ft.streak = "Lost " + Math.abs(tsa.streak);
                        }
                    } else {
                        ft[options.seasonAttrs[j]] = tsa[options.seasonAttrs[j]];
                    }
                }
            }
        };

        // Filters s by stats (which should be options.stats) into ft. This is to do one season of stats filtering.
        filterStatsPartial = function (ft, s, stats) {
            var j;

            if (s !== undefined && s.gp > 0) {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "gp") {
                        ft.gp = s.gp;
                    } else if (stats[j] === "pts") {
                        ft.pts = (s.ast+s.fg)/s.gp;
                    } else if (stats[j] === "sfgsp") {
                        if (s.sfga > 0) {
                            ft.sfgsp = 100 * s.sfgs / s.sfga;
                        } else {
                            ft.sfgsp = 0;
                        }
                    } else if (stats[j] === "sfg") {
                        if (s.sfga > 0) {
                            ft.sfg = s.sfg / s.gp;
                        } else {
                            ft.sfg = 0;
                        }
                    } else if (stats[j] === "fop") {
                        if (s.fow > 0) {
                            ft.fop = 100 * s.fow / (s.fow+s.fol);
                        } else {
                            ft.fop = 0;
                        }						
                    } else if (stats[j] === "fgp") {
                        if (s.fga > 0) {
                            ft.fgp = 100 * s.fg / s.fga;
                        } else {
                            ft.fgp = 0;
                        }
                    } else if (stats[j] === "fgpAtRim") {
                        if (s.fgaAtRim > 0) {
                            ft.fgpAtRim = 100 * s.fgAtRim / s.fgaAtRim;
                        } else {
                            ft.fgpAtRim = 0;
                        }
                    } else if (stats[j] === "fgpLowPost") {
                        if (s.fgaLowPost > 0) {
                            ft.fgpLowPost = 100 * s.fgLowPost / s.fgaLowPost;
                        } else {
                            ft.fgpLowPost = 0;
                        }
                    } else if (stats[j] === "fgpMidRange") {
                        if (s.fgaMidRange > 0) {
                            ft.fgpMidRange = 100 * s.fgMidRange / s.fgaMidRange;
                        } else {
                            ft.fgpMidRange = 0;
                        }
                    } else if (stats[j] === "tpp") {
                        if (s.tpa > 0) {
                            ft.tpp = 100 * s.tp / s.tpa;
                        } else {
                            ft.tpp = 0;
                        }
                    } else if (stats[j] === "ftp") {
                        if (s.fta > 0) {
                            ft.ftp = 100 * s.ft / s.fta;
                        } else {
                            ft.ftp = 0;
                        }
                    } else if (stats[j] === "goals") {
                        ft.goals = s.fg ;
                    } else if (stats[j] === "oppGoals") {
                        ft.oppGoals = s.oppPts;
                    } else if (stats[j] === "diff") {
                        ft.diff = (s.fg - s.oppPts);
                    } else if (stats[j] === "diffPG") {
						if (s.gp == 0) {
							ft.diffPG = 0;
						} else {
							ft.diffPG = (s.fg - s.oppPts)/s.gp;
						}
  //                      ft.diff = (ft.goals - ft.oppGoals);
                    } else if (stats[j] === "season") {
                        ft.season = s.season;
                    } else {
                        if (options.totals) {
                            ft[stats[j]] = s[stats[j]];
                        } else {
                            ft[stats[j]] = s[stats[j]] / s.gp;
//                            ft[stats[j]] = s[stats[j]] ;
                        }
                    }
                }
            } else {
                for (j = 0; j < stats.length; j++) {
                    if (stats[j] === "season") {
                        ft.season = s.season;
                    } else {
                        ft[stats[j]] = 0;
                    }
                }
            }

            return ft;
        };

        // Copys/filters the stats listed in options.stats from p to fp.
        filterStats = function (ft, t, options) {
            var i, j, ts;

            if (options.stats.length > 0) {
                if (options.season !== null) {
                    // Single season
                    for (j = 0; j < t.stats.length; j++) {
                        if (t.stats[j].season === options.season && t.stats[j].playoffs === options.playoffs) {
                            ts = t.stats[j];
                            break;
                        }
                    }
                } else {
                    // Multiple seasons
                    ts = [];
                    for (j = 0; j < t.stats.length; j++) {
                        if (t.stats[j].playoffs === options.playoffs) {
                            ts.push(t.stats[j]);
                        }
                    }
                }
            }

            if (ts !== undefined && ts.length >= 0) {
                ft.stats = [];
                // Multiple seasons
                for (i = 0; i < ts.length; i++) {
                    ft.stats.push(filterStatsPartial({}, ts[i], options.stats));
                }
            } else {
                // Single seasons - merge stats with root object
                ft = filterStatsPartial(ft, ts, options.stats);
            }
        };

        return dao.teams.getAll({ot: options.ot, key: options.tid}).then(function (t) {
            var ft, fts, i, returnOneTeam, savePayroll, sortBy;

            // t will be an array of g.numTeams teams (if options.tid is null) or an array of 1 team. If 1, then we want to return just that team object at the end, not an array of 1 team.
            returnOneTeam = false;
            if (t.length === 1) {
                returnOneTeam = true;
            }

            fts = [];

            for (i = 0; i < t.length; i++) {
                ft = {};
                filterAttrs(ft, t[i], options);
                filterSeasonAttrs(ft, t[i], options);
                filterStats(ft, t[i], options);
                fts.push(ft);
            }

            if (Array.isArray(options.sortBy)) {
                // Sort by multiple properties
                sortBy = options.sortBy.slice();
                fts.sort(function (a, b) {
                    var result;

                    for (i = 0; i < sortBy.length; i++) {
                        result = (sortBy[i].indexOf("-") === 1) ? a[sortBy[i]] - b[sortBy[i]] : b[sortBy[i]] - a[sortBy[i]];

                        if (result || i === sortBy.length - 1) {
                            return result;
                        }
                    }
                });
            } else if (options.sortBy === "winp") {
                // Sort by winning percentage, descending
                fts.sort(function (a, b) { return b.winp - a.winp; });
            } else if (options.sortBy === "gb") {
                // Sort by winning percentage, descending
                fts.sort(function (a, b) { return b.won - b.lost - a.won + a.lost; });
            }

            // If payroll for the current season was requested, find the current payroll for each team. Otherwise, don't.
            if (options.seasonAttrs.indexOf("payroll") < 0 || options.season !== g.season) {
                return returnOneTeam ? fts[0] : fts;
            } else {
                savePayroll = function (i) {
                    return getPayroll(options.ot, t[i].tid).get(0).then(function (payroll) {
                        fts[i].payroll = payroll / 1000;
                        if (i === fts.length - 1) {
                            return returnOneTeam ? fts[0] : fts;
                        }

                        return savePayroll(i + 1);
                    });
                };
                return savePayroll(0);
            }
        });
    }

    // estValuesCached is either a copy of estValues (defined below) or null. When it's cached, it's much faster for repeated calls (like trading block).
    function valueChange(tid, pidsAdd, pidsRemove, dpidsAdd, dpidsRemove, estValuesCached) {
        var add, getPicks, getPlayers, gpAvg, payroll, pop, remove, roster, strategy, tx;

        // UGLY HACK: Don't include more than 2 draft picks in a trade for AI team
        if (dpidsRemove.length > g.gameType+2) {
            return Promise.resolve(-1);
        }

        // Get value and skills for each player on team or involved in the proposed transaction
        roster = [];
        add = [];
        remove = [];

        tx = dao.tx(["draftPicks", "players", "releasedPlayers", "teams"]);

        // Get players
        getPlayers = function () {
            var fudgeFactor, i;

            // Fudge factor for AI overvaluing its own players
            if (tid !== g.userTid) {
                fudgeFactor = 1.05;
            } else {
                fudgeFactor = 1;
            }
            // Get roster and players to remove
            dao.players.getAll({
                ot: tx,
                index: "tid",
                key: tid
            }).then(function (players) {
                var i, p;

                for (i = 0; i < players.length; i++) {
                    p = players[i];

                    if (pidsRemove.indexOf(p.pid) < 0) {
                        roster.push({
                            value: p.value,
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    } else {
                        remove.push({
                            value: p.value * fudgeFactor,
                            skills: _.last(p.ratings).skills,
                            contract: p.contract,
                            worth: player.genContract(p, false, false, true),
                            injury: p.injury,
                            age: g.season - p.born.year
                        });
                    }
                }
            });
            // Get players to add
            for (i = 0; i < pidsAdd.length; i++) {
                dao.players.get({
                    ot: tx,
                    key: pidsAdd[i]
                }).then(function (p) {

                    add.push({
                        value: p.valueWithContract,
                        skills: _.last(p.ratings).skills,
                        contract: p.contract,
                        worth: player.genContract(p, false, false, true),
                        injury: p.injury,
                        age: g.season - p.born.year
                    });
                });
            }
        };

        getPicks = function () {
            // For each draft pick, estimate its value based on the recent performance of the team
            if (dpidsAdd.length > 0 || dpidsRemove.length > 0) {
                // Estimate the order of the picks by team
				dao.teams.getAll({ot: tx}).then(function (teams) {
                    var estPicks, estValues, gp, i, rCurrent, rLast, rookieSalaries, s, sorted, t, withEstValues, wps;

                
                    // This part needs to be run every time so that gpAvg is available
                    wps = []; // Contains estimated winning percentages for all teams by the end of the season
                    for (i = 0; i < teams.length; i++) {
                        t = teams[i];
                        s = t.seasons.length;
                        if (t.seasons.length === 1) {
                            // First season
                            if (t.seasons[0].won + t.seasons[0].lost > 15) {
                                rCurrent = [t.seasons[0].won, t.seasons[0].lost];
                            } else {
                                // Fix for new leagues - don't base this on record until we have some games played, and don't let the user's picks be overvalued
                                if (i === g.userTid) {
                                    rCurrent = [82, 0];
                                } else {
                                    rCurrent = [0, 82];
                                }
                            }
                            if (i === g.userTid) {
                                rLast = [50, 32];
                            } else {
                                rLast = [32, 50]; // Assume a losing season to minimize bad trades
                            }
                        } else {
                            // Second (or higher) season
                            rCurrent = [t.seasons[s - 1].won, t.seasons[s - 1].lost];
                            rLast = [t.seasons[s - 2].won, t.seasons[s - 2].lost];
                        }

                        gp = rCurrent[0] + rCurrent[1]; // Might not be "real" games played

                        // If we've played half a season, just use that as an estimate. Otherwise, take a weighted sum of this and last year
                        if (gp >= 41) {
                            wps.push(rCurrent[0] / gp);
                        } else if (gp > 0) {
                            wps.push((gp / 41 * rCurrent[0] / gp + (41 - gp) / 41 * rLast[0] / 82));
                        } else {
                            wps.push(rLast[0] / 82);
                        }
                    }
                    // Get rank order of wps http://stackoverflow.com/a/14834599/786644
                    sorted = wps.slice().sort(function (a, b) { return a - b; });
                    estPicks = wps.slice().map(function (v) { return sorted.indexOf(v) + 1; }); // For each team, what is their estimated draft position?

                    rookieSalaries = require("core/draft").getRookieSalaries();

                    // Actually add picks after some stuff below is done

                    withEstValues = function () {
                        var i;
                        for (i = 0; i < dpidsAdd.length; i++) {
                             dao.draftPicks.get({ot: tx, key: dpidsAdd[i]}).then(function (dp) {
                                var estPick, seasons, value;
                                estPick = estPicks[dp.originalTid];
                                // For future draft picks, add some uncertainty
                                seasons = dp.season - g.season;
                                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                                // No fudge factor, since this is coming from the user's team (or eventually, another AI)
                                if (estValues[dp.season]) {
                                    value = estValues[dp.season][estPick - 1 + g.numTeams * (dp.round - 1)];
                                }
                                if (!value) {
									
//                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)]*(1.3+dp.round/5) ;
                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)] ;
									//if (value > 70) {
//									  value = 70;
	///								} else if (value < 55) {
		//							  value = 55; 
			//						}
                                }
									
                                add.push({
                                    value: value,
                                    skills: [],
                                    contract: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
//                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                        exp: dp.season + 4 // 3 for first round, 2 for second
                                    },
                                    worth: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)],
                                        exp: dp.season + 4 // 3 for first round, 2 for second
  //                                      exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                    },
                                    injury: {type: "Healthy", gamesRemaining: 0},
                                    age: 19,
                                    draftPick: true
                                });
							});
                        }

                        for (i = 0; i < dpidsRemove.length; i++) {
                             dao.draftPicks.get({ot: tx, key: dpidsRemove[i]}).then(function (dp) {
                                var estPick, fudgeFactor, seasons, value;
                                estPick = estPicks[dp.originalTid];

                                // For future draft picks, add some uncertainty
                                seasons = dp.season - g.season;
                                estPick = Math.round(estPick * (5 - seasons) / 5 + 15 * seasons / 5);

                                // Set fudge factor with more confidence if it's the current season
                                if (seasons === 0 && gp >= 41) {
                                    fudgeFactor = (1 - gp / 82) * 5;
                                } else {
                                    fudgeFactor = 5;
                                }

                                // Use fudge factor: AI teams like their own picks
                                if (estValues[dp.season]) {
                                    value = estValues[dp.season][estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid) * fudgeFactor;
                                }
                                if (!value) {
//                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)]*(1.3+dp.round/5) + (tid !== g.userTid) * fudgeFactor;
                                    value = estValues.default[estPick - 1 + g.numTeams * (dp.round - 1)] + (tid !== g.userTid) * fudgeFactor;
								//	console.log(value);
                                }

                                remove.push({
                                    value: value,
                                    skills: [],
                                    contract: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
//                                        exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                        exp: dp.season + 4 // 3 for first round, 2 for second
                                    },
                                    worth: {
                                        amount: rookieSalaries[estPick - 1 + g.numTeams * (dp.round - 1)] / 1000,
  //                                      exp: dp.season + 2 + (2 - dp.round) // 3 for first round, 2 for second
                                        exp: dp.season + 4 // 3 for first round, 2 for second
                                    },
                                    injury: {type: "Healthy", gamesRemaining: 0},
                                    age: 19,
                                    draftPick: true
                                });
                            });
                        }
                    };

                    if (estValuesCached) {
                        estValues = estValuesCached;
                        withEstValues();
                    } else {
				
                        require("core/trade").getPickValues(tx).then(function (newEstValues) {
						
                            estValues = newEstValues;
                            withEstValues();
                        });
                    }
                 });
            }
        };

        // Get team strategy and population, for future use
        filter({
            attrs: ["strategy"],
            seasonAttrs: ["pop"],
            stats: ["gp"],
            season: g.season,
            tid: tid,
            ot: tx
        }).then(function (t) {
            strategy = t.strategy;
            pop = t.pop;
            if (pop > 20) {
                pop = 20;
            }
            gpAvg = t.gp; // Ideally would be done separately for each team, but close enough

            getPlayers();
            getPicks();
        });

        getPayroll(tx, tid).then(function (payrollLocal) {
            payroll = payrollLocal;
        });

        return tx.complete().then(function () {
            var contractsFactor, base, doSkillBonuses, dv,  rosterAndAdd, rosterAndRemove, salaryAddedThisSeason, salaryRemoved, skillsNeeded, sumContracts, sumValues;

            gpAvg = helpers.bound(gpAvg, 0, 82);

/*            // Handle situations where the team goes over the roster size limit
            if (roster.length + remove.length > 15) {
                // Already over roster limit, so don't worry unless this trade actually makes it worse
                needToDrop = (roster.length + add.length) - (roster.length + remove.length);
            } else {
                needToDrop = (roster.length + add.length) - 15;
            }
            roster.sort(function (a, b) { return a.value - b.value; }); // Sort by value, ascending
            add.sort(function (a, b) { return a.value - b.value; }); // Sort by value, ascending
            while (needToDrop > 0) {
                // Find lowest value player, from roster or add. Delete him and move his salary to the second lowest value player.
                if (roster[0].value < add[0].value) {
                    if (roster[1].value < add[0].value) {
                        roster[1].contract.amount += roster[0].contract.amount;
                    } else {
                        add[0].contract.amount += roster[0].contract.amount;
                    }
                    roster.shift(); // Remove from value calculation
                } else {
                    if (add.length > 1 && add[1].value < roster[0].value) {
                        add[1].contract.amount += add[0].contract.amount;
                    } else {
                        roster[0].contract.amount += add[0].contract.amount;
                    }
                    add.shift(); // Remove from value calculation
                }

                needToDrop -= 1;
            }*/

            // This roughly corresponds with core.gameSim.updateSynergy
            skillsNeeded = {
                "3": 5,
                A: 5,
                B: 3,
                Di: 2,
                Dp: 2,
                Po: 2,
                Ps: 4,
                R: 3
            };

            doSkillBonuses = function (test, roster) {
                var i, j, rosterSkills, rosterSkillsCount, s;

                // What are current skills?
                rosterSkills = [];
                for (i = 0; i < roster.length; i++) {
                 //   if (roster[i].value >= 45) {
                        rosterSkills.push(roster[i].skills);
                 //   }
                }
                rosterSkills = _.flatten(rosterSkills);
                rosterSkillsCount = _.countBy(rosterSkills);

                // Sort test by value, so that the highest value players get bonuses applied first
                test.sort(function (a, b) { return b.value - a.value; });

                for (i = 0; i < test.length; i++) {
                  //  if (test.value >= 45) {
                        for (j = 0; j < test[i].skills.length; j++) {
                            s = test[i].skills[j];

                            if (rosterSkillsCount[s] <= skillsNeeded[s] - 2) {
                                // Big bonus
                                test.value *= 1.1;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s] - 1) {
                                // Medium bonus
                                test.value *= 1.05;
                            } else if (rosterSkillsCount[s] <= skillsNeeded[s]) {
                                // Little bonus
                                test.value *= 1.025;
                            }

                            // Account for redundancy in test
                            rosterSkillsCount[s] += 1;
                        }
                //    }
                }

                return test;
            };

            // Apply bonuses based on skills coming in and leaving
            rosterAndRemove = roster.concat(remove);
            rosterAndAdd = roster.concat(add);
            add = doSkillBonuses(add, rosterAndRemove);
            remove = doSkillBonuses(remove, rosterAndAdd);

            base = 1.25;

            sumValues = function (players, includeInjuries) {
                var exponential;

                includeInjuries = includeInjuries !== undefined ? includeInjuries : false;

                if (players.length === 0) {
                    return 0;
                }

                exponential = _.reduce(players, function (memo, p) {
                    var contractSeasonsRemaining, contractValue, playerValue, value;

                    playerValue = p.value;

                    if (strategy === "rebuilding") {
                        // Value young/cheap players and draft picks more. Penalize expensive/old players
                        if (p.draftPick) {
                            playerValue *= 1.15;
                        } else {
                            if (p.age <= 19) {
                                playerValue *= 1.15;
                            } else if (p.age === 20) {
                                playerValue *= 1.1;
                            } else if (p.age === 21) {
                                playerValue *= 1.075;
                            } else if (p.age === 22) {
                                playerValue *= 1.05;
                            } else if (p.age === 23) {
                                playerValue *= 1.025;
                            } else if (p.age === 27) {
                                playerValue *= 0.975;
                            } else if (p.age === 28) {
                                playerValue *= 0.95;
                            } else if (p.age >= 29) {
                                playerValue *= 0.9;
                            }
                        }
                    }

                    // Anything below 45 is pretty worthless
                    //playerValue -= 45;

                    // Normalize for injuries
                    if (includeInjuries && tid !== g.userTid) {
                        if (p.injury.gamesRemaining > 75) {
                            playerValue -= playerValue * 0.75;
                        } else {
                            playerValue -= playerValue * p.injury.gamesRemaining / 100;
                        }
                    }

                    contractValue = (p.worth.amount - p.contract.amount) / 1000;

                    // Account for duration
                    contractSeasonsRemaining = player.contractSeasonsRemaining(p.contract.exp, 82 - gpAvg);
                    if (contractSeasonsRemaining > 1) {
                        // Don't make it too extreme
                        contractValue *= Math.pow(contractSeasonsRemaining, 0.25);
                    } else {
                        // Raising < 1 to < 1 power would make this too large
                        contractValue *= contractSeasonsRemaining;
                    }

                    // Really bad players will just get no PT
                    if (playerValue < 0) {
                        playerValue = 0;
                    }
//console.log([playerValue, contractValue]);

//                    value = playerValue + 0.5 * contractValue;
//                    value = playerValue + 0.15 * contractValue;
                    value = playerValue + 0.05 * contractValue;
				//	console.log(value);
					// make value amplified
					//console.log(value);
					//console.log(value);
					//value = value*value*value*value;
					value *= value;
					value /= 100;					
					value *= value;
					value /= 100;					
					value *= value;
					value /= 100;					
					//value *= 3;					
					//console.log(value);
					
                    if (value === 0) {
                        return memo;
                    }
				//	console.log(Math.pow(Math.abs(value), base) * Math.abs(value) / value);
//                    return memo + Math.pow(Math.abs(value), base) * Math.abs(value) / value;
                    return memo+value ;
                }, 0);

                if (exponential === 0) {
                    return exponential;
                }
				//	console.log(Math.pow(Math.abs(exponential), 1 / base) * Math.abs(exponential) / exponential);
				
//                return Math.pow(Math.abs(exponential), 1 / base) * Math.abs(exponential) / exponential;
                return Math.pow(Math.abs(exponential), 1 / base) * Math.abs(exponential) / exponential;
            };

            // Sum of contracts
            // If onlyThisSeason is set, then amounts after this season are ignored and the return value is the sum of this season's contract amounts in millions of dollars
            sumContracts = function (players, onlyThisSeason) {
                var sum;

                onlyThisSeason = onlyThisSeason !== undefined ? onlyThisSeason : false;

                if (players.length === 0) {
                    return 0;
                }

                sum = _.reduce(players, function (memo, p) {
                    if (p.draftPick) {
                        return memo;
                    }

                    return memo + p.contract.amount / 1000 * Math.pow(player.contractSeasonsRemaining(p.contract.exp, 82 - gpAvg), 0.25 - (onlyThisSeason ? 0.25 : 0));
                }, 0);

                return sum;
            };

            if (strategy === "rebuilding") {
                contractsFactor = 0.3;
            } else {
                contractsFactor = 0.1;
            }

            salaryRemoved = sumContracts(remove) - sumContracts(add);

            dv = sumValues(add, true) - sumValues(remove) + contractsFactor * salaryRemoved;
/*console.log("Added players/picks: " + sumValues(add, true));
console.log("Removed players/picks: " + (-sumValues(remove)));
console.log("Added contract quality: -" + contractExcessFactor + " * " + sumContractExcess(add));
console.log("Removed contract quality: -" + contractExcessFactor + " * " + sumContractExcess(remove));
console.log("Total contract amount: " + contractsFactor + " * " + salaryRemoved);*/

            // Aversion towards losing cap space in a trade during free agency
            if (g.phase >= g.PHASE.RESIGN_PLAYERS || g.phase <= g.PHASE.FREE_AGENCY) {
                // Only care if cap space is over 2 million
                if (payroll + 2000 < g.salaryCap) {
                    salaryAddedThisSeason = sumContracts(add, true) - sumContracts(remove, true);
                    // Only care if cap space is being used
                    if (salaryAddedThisSeason > 0) {
//console.log("Free agency penalty: -" + (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason);
                       // dv -= (0.2 + 0.8 * g.daysLeft / 30) * salaryAddedThisSeason; // 0.2 to 1 times the amount, depending on stage of free agency
                    }
                }
            }

 
            // Normalize for number of players, since 1 really good player is much better than multiple mediocre ones
            // This is a fudge factor, since it's one-sided to punish the player
            if (add.length > remove.length) {
                dv -= add.length - remove.length;
            }

            return dv;
/*console.log('---');
console.log([sumValues(add), sumContracts(add)]);
console.log([sumValues(remove), sumContracts(remove)]);
console.log(dv);*/

        });
    }

    /**
     * Update team strategies (contending or rebuilding) for every team in the league.
     *
     * Basically.. switch to rebuilding if you're old and your success is fading, and switch to contending if you have a good amount of young talent on rookie deals and your success is growing.
     * 
     * @memberOf core.team
	 * @param {IDBTransaction} tx An IndexedDB transaction on players, playerStats, and teams, readwrite.	 	 
     * @return {Promise}
     */
    function updateStrategies(tx) {
        //var tx;

        // For
        //tx = dao.tx(["players", "playerStats", "teams"], "readwrite");
        return dao.teams.iterate({
            ot: tx,
            callback: function (t) {
                var dWon, s, won;

                // Skip user's team
                if (t.tid === g.userTid) {
                    return;
                }

                // Change in wins				
                s = t.seasons.length - 1;
                won = t.seasons[s].won;
                if (s > 0) {
                    dWon = won - t.seasons[s - 1].won;
                } else {
                    dWon = 0;
                }

                // Young stars
                return dao.players.getAll({
                    ot: tx,
                    index: "tid",
                    key: t.tid,
					statsSeasons: [g.season],
					statsTid: t.tid
                }).then(function (players) {
                    var age, denominator, i, numerator, players, score, updated, youngStar;

                    players = player.filter(players, {
                        season: g.season,
                        tid: t.tid,
                        attrs: ["age", "value", "contract"],
                        stats: ["min"]
                    });

                    youngStar = 0; // Default value

                    numerator = 0; // Sum of age * mp
                    denominator = 0; // Sum of mp
                    for (i = 0; i < players.length; i++) {
                        numerator += players[i].age * players[i].stats.min;
                        denominator += players[i].stats.min;

                        // Is a young star about to get a pay raise and eat up all the cap after this season?
                        if (players[i].value > 65 && players[i].contract.exp === g.season + 1 && players[i].contract.amount <= 5 && players[i].age <= 25) {
                            youngStar += 1;
                        }
                    }

                    // Average age, weighted by minutes played
                    age = numerator / denominator;

//console.log([t.abbrev, 0.8 * dWon, (won - 41), 5 * (26 - age), youngStar * 20])
                    score = 0.8 * dWon + (won - 41) + 5 * (26 - age) + youngStar * 20;

                    updated = false;
                    if (score > 20 && t.strategy === "rebuilding") {
//console.log(t.abbrev + " switch to contending")
                        t.strategy = "contending";
                        updated = true;
                    } else if (score < -20 && t.strategy === "contending") {
//console.log(t.abbrev + " switch to rebuilding")
                        t.strategy = "rebuilding";
                        updated = true;
                    }

                     if (updated) {
                        return t;
                    }
                });
            }
        });

      //  return tx.complete();
    }

    /**
     * Check roster size limits
     *
     * If any AI team is over the maximum roster size, cut their worst players.
     * If any AI team is under the minimum roster size, sign minimum contract
     * players until the limit is reached. If the user's team is breaking one of
     * these roster size limits, display a warning.
     * 
     * @memberOf core.team
     * @return {Promise.?string} Resolves to null if there is no error, or a string with the error message otherwise.
     */
    function checkRosterSizes() {

        var checkRosterSize, minFreeAgents, minFreeAgentsG, minFreeAgentsS, maxFreeAgentsG, maxFreeAgentsS,  tx, userTeamSizeError;
		var age;

		console.log("check");
		
        checkRosterSize = function (tid) {
			
			return Promise.all([
				dao.players.getAll({ot: tx, index: "tid", key: tid}),
				getPayroll(tx, tid).get(0)
				//team.getPayroll(tx, tid).get(0)
			]).spread(function (players, payroll) {			
 
                var i, numPlayersOnRoster,numSkatersOnRoster,numGoaliesOnRoster, p;
				var numOffenseOnRoster,numDefenseOnRoster,contractHigh;
				var count;				
			//	console.log(minFreeAgentsG);
			//	console.log(minFreeAgentsS);				
                numPlayersOnRoster = players.length;
				numSkatersOnRoster = 0;
				numGoaliesOnRoster = 0;
				numOffenseOnRoster = 0;
				numDefenseOnRoster = 0;
				

				
				if (g.gameType == 0) {
					count = 23+0; // Total number allowed
				} else if (g.gameType == 1) {
					count = 23+5; // Total number allowed
				} else if (g.gameType == 2) {
					count = 23+10; // Total number allowed
				} else if (g.gameType == 3) {
					count = 23+15; // Total number allowed
				} else if (g.gameType == 4) {
					count = 23+20; // Total number allowed
				} else {
					count = 23+23; // Total number allowed
				}					
				for (i = 0; i < (numPlayersOnRoster); i++) {
		//		console.log(players[i].pos);				
					if (players[i].pos == "G") {
						//console.log(players[i].injury.type+" "+players[i].injury.gamesRemaining);
//						if (players[i].injury.gamesRemaining == 0) {
						if (players[i].injury.type == "Healthy") {
							numGoaliesOnRoster += 1;							
						}
					} else {
						numSkatersOnRoster += 1;					
						if ((players[i].pos == "C") || (players[i].pos == "RW") || (players[i].pos == "LW")) {
							numOffenseOnRoster += 1;					
						} else {
							numDefenseOnRoster += 1;					
						}
					}

				}				
			//	console.log(tid+" "+numPlayersOnRoster+" "+numSkatersOnRoster+" "+numGoaliesOnRoster);
             //   db.getPayroll(tx, tid, function (payroll) {		
				//	console.log(payroll);
					if (payroll >= g.salaryCap) {
						if (g.userTids.indexOf(tid) >= 0 && (g.startingSeason != g.season)  && g.autoPlaySeasons === 0) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							}
							userTeamSizeError += 'greater than the salary cap. You must lower payroll by remove players through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
															
						//if ((tid === g.userTid) && (g.startingSeason != g.season) && g.autoPlaySeasons === 0 ) {
							//userTeamSizeError = 'Your team payroll is currently greater than the salary cap. You must lower payroll by remove players through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {					
							players.sort(function (a, b) { return a.value - b.value; }); // Lowest first
//							players.sort(function (a, b) { return player.value(b) - player.value(a); }); // highest first
							for (i = 0; i < (numPlayersOnRoster); i++) {
								//console.log(payroll+" "+players[i].contract.amount+" "+g.salaryCap);
								age = g.season - players[i].born.year;
								//console.log(age+" "+g.season+" "+players[i].born.year);
								//console.log(players[i]);
								if (age<25) {
								
//								} else if (payroll-players[i].contract.amount <= g.salaryCap) {
								} else if (age < 30 && players[i].value > 50)  {
								} else if (age >= 30 && players[i].value > 55)  {
								} else if (payroll-players[i].contract.amount <= g.salaryCap)  {

									if ((players[i].pos == "G") && numGoaliesOnRoster > 2) {
										numGoaliesOnRoster -= 1;
										payroll -= players[i].contract.amount;
										player.release(tx, players[i], true); // not just drafted, but don't count against payroll
										break;
										
									} else if (numSkatersOnRoster < 18) {
										numSkatersOnRoster -= 1;
										payroll -= players[i].contract.amount;
										player.release(tx, players[i], true); // not just drafted, but don't count against payroll
										break;										
									}										
								} else if (i == numPlayersOnRoster-1) {
									//console.log("2: "+payroll);
									if (players[i].pos == "G") {
										numGoaliesOnRoster -= 1;
									} else {
										numSkatersOnRoster -= 1;
									}								
									payroll -= players[i].contract.amount;
									player.release(tx, players[i], true);
								}
							}
						}
					}
						
					if ((payroll <= g.minPayroll)  && (g.phase < g.PHASE.PLAYOFFS)) {
						if (g.userTids.indexOf(tid) >= 0 && (g.startingSeason != g.season)  && g.autoPlaySeasons === 0) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							}
							userTeamSizeError += 'less than the minimum. You must increase payroll by adding players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';							
															
						//if ((tid === g.userTid) && (g.startingSeason != g.season) && g.autoPlaySeasons === 0) {
						//	userTeamSizeError = 'Your team payroll is currently less than the minimum. You must lower payroll by adding players through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
							//userTeamSizeError = 'Your team payroll is currently less than the minimum. You must increase payroll by adding players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';							
						} else {						
						//	players.sort(function (a, b) { return player.value(a) - player.value(b); }); // Lowest first
//							players.sort(function (a, b) { return player.value(b) - player.value(a); }); // highest first
							contractHigh = true;
							while (payroll <= g.minPayroll && maxFreeAgentsS.length>0 && ((numSkatersOnRoster+numGoaliesOnRoster<count) || contractHigh) ) {
								//console.log(tid+" "+numSkatersOnRoster+" "+minFreeAgentsS.length);
								p = maxFreeAgentsS.shift();
							//	console.log(p);								
								p.tid = tid;
								p.active = true;										
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
									p = player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 15;

									eventLog.add(null, {
										type: "freeAgent",
										text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
										showNotification: false,
										pids: [p.pid],
										tids: [p.tid]
									});									
									dao.players.put({ot: tx, value: p});
							//	console.log(payroll+" "+ p.contract.amount);
								payroll += p.contract.amount;				
								if (p.contract.amount<1000) {
									contractHigh=false;
								}
								if (p.pos == "G") {
									numGoaliesOnRoster += 1;
								} else {
									numSkatersOnRoster += 1;
								}
							}	
						}
					}						
				//	console.log(numPlayersOnRoster+" "+numGoaliesOnRoster+" "+numSkatersOnRoster);
					if ((numGoaliesOnRoster < 2) && (g.phase < g.PHASE.PLAYOFFS)) {
						if (g.userTids.indexOf(tid) >= 0 && (g.startingSeason != g.season)  && g.autoPlaySeasons === 0) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							}
							userTeamSizeError += 'less than the minimum number of goalies (2). You must add goalies (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
												
						//if ((tid === g.userTid) && (g.startingSeason != g.season) && g.autoPlaySeasons === 0) {
							//userTeamSizeError = 'Your team currently has less than the minimum number of goalies (2). You must add goalies (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {
							// Auto-add players
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
							while (numGoaliesOnRoster < 2 && minFreeAgentsG.length>0) {
								//console.log(tid+" "+numGoaliesOnRoster+" "+minFreeAgentsG.length);
								p = minFreeAgentsG.shift();
								p.tid = tid;
								p.active = true;						
								//p = player.addStatsRow(p);
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
									p = player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 15;

									eventLog.add(null, {
										type: "freeAgent",
										text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
										showNotification: false,
										pids: [p.pid],
										tids: [p.tid]
									});									
									dao.players.put({ot: tx, value: p});									
								//p = player.setContract(p, p.contract, true);
								//p.gamesUntilTradable = 15;
								//playerStore.put(p);

								numGoaliesOnRoster += 1;
							}
							//rosterAutoSort(tx, tid);
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
						}					
					} else if (numPlayersOnRoster > count) {
						if (g.userTids.indexOf(tid) >= 0 && (g.startingSeason != g.season)  && g.autoPlaySeasons === 0) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							}
							userTeamSizeError += 'more than the maximum number of players '+count+'. You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						
//						if ((tid === g.userTid) && (g.startingSeason != g.season) && g.autoPlaySeasons === 0) {
	//						userTeamSizeError = 'Your team currently has more than the maximum number of players '+count+'. You must remove players (by <a href="' + helpers.leagueUrl(["roster"]) + '">releasing them from your roster</a> or through <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {
							// Automatically drop lowest value players until we reach 15
							players.sort(function (a, b) { return  a.value - b.value; }); // Lowest first
//							for (i = 0; i < (numPlayersOnRoster - count); i++) {
							for (i = 0; i < count; i++) {								
								//console.log(tid+" "+players[i].pos+" "+numGoaliesOnRoster+" "+numSkatersOnRoster+" "+numPlayersOnRoster);
	//							console.log(g.season+" "+players[i].born.year);
								//age = g.season - p.born.year;
								age = g.season - players[i].born.year;
//								console.log(age+" "+g.season+" "+players[i].born.year);
								if (age<25) {
								
								} else if (numGoaliesOnRoster > 3 && players[i].pos == "G") {
									player.release(tx, players[i], false);		
									numPlayersOnRoster -= 1;
									numGoaliesOnRoster -= 1;		
								} else if (numSkatersOnRoster > 18 && players[i].pos != "G") {
									player.release(tx, players[i], false);									
									numPlayersOnRoster -= 1;	
									numSkatersOnRoster -= 1;
								}
								if (numPlayersOnRoster <= count) {
									break;
								}
								
							}
						}
			/*        } else if (numPlayersOnRoster < g.minRosterSize) {
						if (tid === g.userTid && g.autoPlaySeasons === 0) {
							userTeamSizeError = 'Your team currently has less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {
							// Auto-add players
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
							while (numPlayersOnRoster < g.minRosterSize) {
								p = minFreeAgents.shift();
								if (p.pos == "G") {
								
								}
								p.tid = tid;
								p = player.addStatsRow(p);
								p = player.setContract(p, p.contract, true);
								p.gamesUntilTradable = 15;
								playerStore.put(p);

								numPlayersOnRoster += 1;
							}
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
						}*/
					} else if ((numSkatersOnRoster < 18) && (g.phase < g.PHASE.PLAYOFFS)) {
						if (g.userTids.indexOf(tid) >= 0  && (g.startingSeason != g.season)  && g.autoPlaySeasons === 0) {
							if (g.userTids.length <= 1) {
								userTeamSizeError = 'Your team has ';
							} else {
								userTeamSizeError = 'The ' + g.teamRegionsCache[tid] + ' ' + g.teamNamesCache[tid] + ' have ';
							}
							userTeamSizeError += 'less than the minimum number of players (' + g.minRosterSize + '). You must add players (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						
//						if ((tid === g.userTid) && (g.startingSeason != g.season) && g.autoPlaySeasons === 0) {
	//						userTeamSizeError = 'Your team currently has less than the minimum number of skaters (18). You must add skaters (through <a href="' + helpers.leagueUrl(["free_agents"]) + '">free agency</a> or <a href="' + helpers.leagueUrl(["trade"]) + '">trades</a>) before continuing.';
						} else {
							// Auto-add players
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
							while (numSkatersOnRoster < 18 && minFreeAgentsS.length>0) {
								//console.log(tid+" "+numSkatersOnRoster+" "+minFreeAgentsS.length);
								p = minFreeAgentsS.shift();
								//console.log(p);
								p.tid = tid;
								p.active = true;																							
//								p = player.addStatsRow(p);
								p = player.addStatsRow(tx, p, g.phase === g.PHASE.PLAYOFFS);
									p = player.setContract(p, p.contract, true);
									p.gamesUntilTradable = 15;

									eventLog.add(null, {
										type: "freeAgent",
										text: 'The <a href="' + helpers.leagueUrl(["roster", g.teamAbbrevsCache[p.tid], g.season]) + '">' + g.teamNamesCache[p.tid] + '</a> signed <a href="' + helpers.leagueUrl(["player", p.pid]) + '">' + p.name + '</a> for ' + helpers.formatCurrency(p.contract.amount / 1000, "M") + '/year through ' + p.contract.exp + '.',
										showNotification: false,
										pids: [p.pid],
										tids: [p.tid]
									});									
									dao.players.put({ot: tx, value: p});
						
	//							p = player.setContract(p, p.contract, true);
		//						p.gamesUntilTradable = 15;
			//					playerStore.put(p);

								numSkatersOnRoster += 1;
							}
	//console.log([tid, minFreeAgents.length, numPlayersOnRoster]);
						}				
					}
				
				
           //     });	
                // Auto sort rosters (except player's team)
                if (g.userTids.indexOf(tid) < 0 || g.autoPlaySeasons > 0) {
					//console.log(tid+" rosterSort");
				// console.log(tid+" autosort");
                    rosterAutoSort(tx, tid);
				}
			});
		};


        tx = dao.tx(["players", "playerStats", "releasedPlayers", "teams"], "readwrite");


        userTeamSizeError = null;

        dao.players.getAll({ot: tx, index: "tid", key: g.PLAYER.FREE_AGENT}).then(function (players) {

            var i, players;

          //  players = event.target.result;

            // List of free agents looking for minimum contracts, sorted by value. This is used to bump teams up to the minimum roster size.
        //    minFreeAgents = [];
            minFreeAgentsG = [];
            minFreeAgentsS = [];
            maxFreeAgentsG = [];
            maxFreeAgentsS = [];

            players.sort(function (a, b) { return a.value - b.value; }); 

            for (i = 0; i < players.length; i++) {
                //if (players[i].contract.amount === 500) {
                //    minFreeAgents.push(players[i]);

					if (players[i].pos == "G" ) {
						minFreeAgentsG.push(players[i]);
					} else {
						minFreeAgentsS.push(players[i]);
					}
             //   }
            }
         //   minFreeAgents.sort(function (a, b) { return player.value(b) - player.value(a); });

            minFreeAgentsG.sort(function (a, b) { return a.value - b.value; }); 
			
            minFreeAgentsS.sort(function (a, b) { return a.value - b.value; }); 
			
			
            players.sort(function (a, b) { return b.value - a.value; }); 

            for (i = 0; i < players.length; i++) {
                //if (players[i].contract.amount === 500) {
                //    minFreeAgents.push(players[i]);

					if (players[i].pos == "G" ) {
						maxFreeAgentsG.push(players[i]);
					} else {
						maxFreeAgentsS.push(players[i]);
					}
             //   }
            }
         //   minFreeAgents.sort(function (a, b) { return player.value(b) - player.value(a); });

            maxFreeAgentsG.sort(function (a, b) { return b.value - a.value; }); 
			
            maxFreeAgentsS.sort(function (a, b) { return b.value - a.value; }); 
						
            // Make sure teams are all within the roster limits
            for (i = 0; i < g.numTeams; i++) {
                checkRosterSize(i);
                }
            });

        return tx.complete().then(function () {
            return userTeamSizeError;
        });
    }	
	
    return {
        addSeasonRow: addSeasonRow,
        addStatsRow: addStatsRow,
        generate: generate,
        rosterAutoSort: rosterAutoSort,
        filter: filter,
        valueChange: valueChange,
        updateStrategies: updateStrategies,
        checkRosterSizes: checkRosterSizes,
        getPayroll: getPayroll,
        getPayrolls: getPayrolls
    };
})