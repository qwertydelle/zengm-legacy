// @flow

import {g, helpers} from '../../common';
import {idb} from '../db';
import {getProcessedGames} from '../util';
import type {GetOutput, UpdateEvents} from '../../common/types';

/**
 * Generate a box score.
 *
 * @memberOf views.gameLog
 * @param {number} gid Integer game ID for the box score (a negative number means no box score).
 * @return {Promise.Object} Resolves to an object containing the box score data (or a blank object).
 */
async function boxScore(gid: number) {
    if (gid < 0) {
        return {};
    }

    let game: any = helpers.deepCopy(await idb.cache.games.get(gid));

//	console.log(game);
    // Only this season is in cache
    if (!game) {
        game = await idb.league.games.get(gid);
    }

    // If game doesn't exist (bad gid or deleted box scores), show nothing
    if (!game) {
        return {};
    }

    for (let i = 0; i < game.teams.length; i++) {
        const t = game.teams[i];

        // Team metadata
        t.abbrev = g.teamAbbrevsCache[t.tid];
        t.region = g.teamRegionsCache[t.tid];
        t.name = g.teamNamesCache[t.tid];

        // four factors
        t.efg = 100 * (t.fg + (t.tp / 2)) / t.fga;
        t.tovp = 100 * t.tov / (t.fga + 0.44 * t.fta + t.tov);
        t.orbp = 100 * t.orb / (t.orb + game.teams[1 - i].drb);
        t.ftpfga = t.ft / t.fga;

        // Fix the total minutes calculation, which is usually fucked up for some unknown reason
        t.min = 240 + 25 * game.overtimes;

        // Put injured players at the bottom, then sort by GS and roster position
        t.players.sort((a, b) => {
            // This sorts by starters first and minutes second, since .min is always far less than 1000 and gs is either 1 or 0. Then injured players are listed at the end, if they didn't play.
            return (b.gs * 100000 + b.min * 1000 - b.injury.gamesRemaining) - (a.gs * 100000 + a.min * 1000 - a.injury.gamesRemaining);
        });
	//	console.log(t.players);
		 for (let i = 5; i < t.players.length ; i++) {
			 if (t.players[i] == undefined) {
			 } else {
				 delete t.players[i];
			 }
		 }
    }

    // Team metadata
    game.won.region = g.teamRegionsCache[game.won.tid];
    game.won.name = g.teamNamesCache[game.won.tid];
    game.won.abbrev = g.teamAbbrevsCache[game.won.tid];
    game.lost.region = g.teamRegionsCache[game.lost.tid];
    game.lost.name = g.teamNamesCache[game.lost.tid];
    game.lost.abbrev = g.teamAbbrevsCache[game.lost.tid];

    if (game.overtimes === 1) {
        game.overtime = " (OT)";
    } else if (game.overtimes > 1) {
        game.overtime = ` (${game.overtimes}OT)`;
    } else {
        game.overtime = "";
    }

    // Quarter/overtime labels
    game.qtrs = ["Q1", "Q2", "Q3", "Q4"];
    for (let i = 0; i < game.teams[1].ptsQtrs.length - 4; i++) {
        game.qtrs.push(`OT${i + 1}`);
    }
    game.qtrs.push("F");
//	console.log(game);
    return game;
}

async function updateTeamSeason(
    inputs: GetOutput,
): void | {[key: string]: any} {
    return {
        // Needed for dropdown
        abbrev: inputs.abbrev,
        season: inputs.season,
    };
}

/**
 * Update the displayed box score, as necessary.
 *
 * If the box score is already loaded, nothing is done.
 *
 * @memberOf views.gameLog
 * @param {number} inputs.gid Integer game ID for the box score (a negative number means no box score).
 */
async function updateBoxScore(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    const {gid} = inputs;
    if (typeof gid !== 'number') {
        return;
    }

    if (updateEvents.includes('firstRun') || gid !== state.boxScore.gid) {
        const game = await boxScore(gid);
		//console.log(game);
        const vars = {
            boxScore: game,
        };

        // Either update the box score if we found one, or show placeholder
        if (!game.hasOwnProperty("teams")) {
            vars.boxScore.gid = -1;
        } else {
            vars.boxScore.gid = gid;
        }
	//console.log(game);
        return vars;
    }
}

/**
 * Update the game log list, as necessary.
 *
 * If the game log list is already loaded, nothing is done. If the game log list is loaded and a new game has been played, update. If the game log list is not loaded, load it.
 *
 * @memberOf views.gameLog
 * @param {string} inputs.abbrev Abbrev of the team for the list of games.
 * @param {number} inputs.season Season for the list of games.
 * @param {number} inputs.gid Integer game ID for the box score (a negative number means no box score), which is used only for highlighting the relevant entry in the list.
 */
async function updateGamesList(
    inputs: GetOutput,
    updateEvents: UpdateEvents,
    state: any,
): void | {[key: string]: any} {
    const {abbrev, season} = inputs;
    if (typeof abbrev !== 'string' || typeof season !== 'number') {
        return;
    }

    if (updateEvents.includes('firstRun') || abbrev !== state.gamesList.abbrev || season !== state.gamesList.season || (updateEvents.includes('gameSim') && season === g.season)) {
        let games;
        if (state.gamesList && (abbrev !== state.gamesList.abbrev || season !== state.gamesList.season)) {
            // Switching to a new list
            games = [];
        } else {
            games = state.gamesList ? state.gamesList.games : [];
        }
//console.log(games);

        const newGames = await getProcessedGames(abbrev, season, games);
		//console.log(newGames); // has it
        if (games.length === 0) {
            games = newGames;
        } else {
            for (let i = newGames.length - 1; i >= 0; i--) {
                games.unshift(newGames[i]);
            }
        }
		console.log(games);
        return {
            gamesList: {
                games,
                abbrev,
                season,
            },
        };
    }
}

export default {
    runBefore: [updateBoxScore, updateGamesList, updateTeamSeason],
};
