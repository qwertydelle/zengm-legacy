// @flow

import {g, PHASE} from '../../common';
import {idb} from '../db';
import {local, toUI} from '../util';
import type {Conditions} from '../../common/types';

/*Save status to database and push to client.

If no status is given, set a default status based on game state.

Pass conditions only if you want to force update a single tab (like beforeView).

Args:
    status: A string containing the current status message to be pushed to
        the client.
*/
async function updateStatus(statusText?: string, conditions?: Conditions) {
    if (statusText === undefined) {
        // This should only be triggered on loading a league from DB for now, but eventually this could actually
        // populate statusText in most situations (just call with no argument).
        let defaultStatusText = 'Idle';
        if (g.gameOver) {
            defaultStatusText = "You're fired!";
        } else if (g.phase === g.PHASE.FREE_AGENCY) {
            defaultStatusText = `${g.daysLeft} days left`;
        } else if (g.phase === g.PHASE.DRAFT) {
            const drafted = await idb.cache.players.indexGetAll('playersByTid', [0, Infinity]);
            if (drafted.some((p) => p.draft.year === g.season)) {
                defaultStatusText = 'Draft in progress...';
            }
        }

        toUI(['emit', 'updateTopMenu', {statusText: defaultStatusText}]);
    } else if (statusText !== local.statusText) {
        local.statusText = statusText;
        toUI(['emit', 'updateTopMenu', {statusText}]);
    } else if (conditions !== undefined) {
        toUI(['emit', 'updateTopMenu', {statusText}], conditions);
    }
}

export default updateStatus;
