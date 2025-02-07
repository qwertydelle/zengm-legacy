import React from 'react';
import {helpers} from '../../common';
import {DataTable, NewWindowLink, PlayerPicture, SafeHtml, SkillsBlock, WatchBlock} from '../components';
import {getCols, setTitle, toWorker} from '../util';

const RatingsOverview = ({ratings}) => {
    const r = ratings.length - 1;

    return <div>
        <div className="row">
            <div className="col-xs-6">
                <h2>Overall: {ratings[r].ovr}</h2>
            </div>
            <div className="col-xs-6">
                <h2 className="pull-right">Potential: {ratings[r].pot}</h2>
            </div>
        </div>

        <div className="row">
            <div className="col-xs-4">
                <b>Mental</b><br />
                Adaptability: {ratings[r].hgt}<br />
                Fortitude: {ratings[r].stre}<br />
                Consistency: {ratings[r].spd}<br />
                Team Player: {ratings[r].jmp}<br />
                Leadership: {ratings[r].endu}
            </div>
            <div className="col-xs-4">
                <b>Tactical</b><br />
                Awareness: {ratings[r].ins}<br />
                Laning: {ratings[r].dnk}<br />
                Team Fighting: {ratings[r].ft}<br />
                Risk Taking: {ratings[r].fg}
            </div>
            <div className="col-xs-4">
                <b>Game</b><br />
                Positioning: {ratings[r].tp}<br />
                Skill Shots: {ratings[r].blk}<br />
                Last Hitting: {ratings[r].stl}<br />
                Summoner Spells: {ratings[r].drb}
            </div>
        </div>

       <div className="row">
            <div className="col-xs-4">
            </div>
            <div className="col-xs-4">
                Stamina: {ratings[r].pss}
            </div>
            <div className="col-xs-4">
                Injury Resistant: {ratings[r].reb}
            </div>
        </div>

</div>;

};

RatingsOverview.propTypes = {
    ratings: React.PropTypes.arrayOf(React.PropTypes.shape({
        blk: React.PropTypes.number.isRequired,
        dnk: React.PropTypes.number.isRequired,
        drb: React.PropTypes.number.isRequired,
        endu: React.PropTypes.number.isRequired,
        fg: React.PropTypes.number.isRequired,
        ft: React.PropTypes.number.isRequired,
        hgt: React.PropTypes.number.isRequired,
        ins: React.PropTypes.number.isRequired,
        jmp: React.PropTypes.number.isRequired,
        ovr: React.PropTypes.number.isRequired,
        pot: React.PropTypes.number.isRequired,
        pss: React.PropTypes.number.isRequired,
        reb: React.PropTypes.number.isRequired,
        spd: React.PropTypes.number.isRequired,
        stl: React.PropTypes.number.isRequired,
        stre: React.PropTypes.number.isRequired,
        tp: React.PropTypes.number.isRequired,
    })).isRequired,
};

const StatsTable = ({careerStats = {}, name, stats = []}) => {
    return <DataTable
		cols={getCols('Year','Split', 'Team', 'Age', 'GP',  'Min', 'K', 'D', 'A', 'KDA', 'SC', 'Dst', 'A', 'SC', 'D', 'A', 'CS', 'CSOpp', 'CS', 'CSOpp', 'Jgl', 'Rvr', 'K', 'A','K', 'A', 'K', 'A', 'FB', 'Gld(k)')}
        defaultSort={[0, 'asc']}
        footer={[
            'Career',
            null,
            null,
            null,
            careerStats.gp,
            careerStats.min.toFixed(1),
            careerStats.fg.toFixed(1),
            careerStats.fga.toFixed(1),
            careerStats.fgp.toFixed(1),
            careerStats.kda.toFixed(1),
            careerStats.scKills.toFixed(1),
            careerStats.pf.toFixed(1),
            careerStats.orb.toFixed(1),
			careerStats.gs,
            careerStats.fgaLowPost.toFixed(1),
            careerStats.fgLowPost.toFixed(1),
            careerStats.tp.toFixed(1),
            careerStats.tpa.toFixed(1),
            careerStats.ft.toFixed(1),
            careerStats.fta.toFixed(1),
            careerStats.fgMidRange.toFixed(1),
            careerStats.oppJM.toFixed(1),
            careerStats.riftKills.toFixed(1),
            careerStats.riftAssists.toFixed(1),
            careerStats.drb.toFixed(1),
            careerStats.blk.toFixed(1),
            careerStats.tov.toFixed(1),
            careerStats.ast.toFixed(1),
            careerStats.firstBlood.toFixed(1),
            careerStats.trb.toFixed(1),

        ]}
        name={name}
        rows={stats.map(ps => {
            return {
                key: ps.psid,
                data: [
                    ps.season,
                    ps.seasonSplit,
                    <a href={helpers.leagueUrl(['roster', ps.abbrev, ps.season])}>{ps.abbrev}</a>,
                    ps.age,
                    ps.gp,
                    ps.min.toFixed(1),
                    ps.fg.toFixed(1),
                    ps.fga.toFixed(1),
                    ps.fgp.toFixed(1),
                    ps.kda.toFixed(1),
                    ps.scKills.toFixed(1),
                    ps.pf.toFixed(1),
                    ps.orb.toFixed(1),
                    ps.gs,
                    ps.fgaLowPost.toFixed(1),
                    ps.fgLowPost.toFixed(1),
                    ps.tp.toFixed(1),
                    ps.tpa.toFixed(1),
                    ps.ft.toFixed(1),
                    ps.fta.toFixed(1),
                    ps.fgMidRange.toFixed(1),
                    ps.oppJM.toFixed(1),
                    ps.riftKills.toFixed(1),
                    ps.riftAssists.toFixed(1),
                    ps.drb.toFixed(1),
                    ps.blk.toFixed(1),
                    ps.tov.toFixed(1),
                    ps.ast.toFixed(1),
                    ps.firstBlood.toFixed(2),
                    ps.trb.toFixed(1),

                ],
            };
        })}
        superCols={[{
            title: '',
            colspan: 6,
        }, {
            title: 'Champion',
            desc: 'Champion',
            colspan: 5,
        }, {
            title: 'Towers',
            desc: 'Towers',
            colspan: 3,
        }, {
            title: 'Inhibitors',
            desc: 'Inhibitors',
            colspan: 2,
        }, {
            title: 'CS',
            desc: 'Creap Score',
            colspan: 2,
        }, {
            title: 'CS-20',
            desc: 'Creep Score in first 20 minutes',
            colspan: 2,
        }, {
            title: 'Jungle',
            desc: 'Neutral Jungle Monsters',
            colspan: 2,
        }, {
            title: 'Rift Herald',
            desc: 'Neutral Monster Rift Herald',
            colspan: 2,
        }, {
            title: 'Dragon',
            desc: 'Neutral Monster Dragon',
            colspan: 2,
        }, {
            title: 'Baron',
            desc: 'Neutral Monster Baron Nashor',
            colspan: 2,
        }, {
            title: '',
            colspan: 2,
        }]}
    />;
};

StatsTable.propTypes = {
    careerStats: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    stats: React.PropTypes.arrayOf(React.PropTypes.object),
};


const Player = ({events, feats, freeAgent, godMode, injured, player, retired, showContract, showTradeFor}) => {
    setTitle(player.name);

    let draftInfo = null;
    if (player.draft.round) {
        draftInfo = <div>
            Draft: <a href={helpers.leagueUrl(['draft_summary', player.draft.year])}>{player.draft.year}</a> - Round {player.draft.round} (Pick {player.draft.pick}) by {player.draft.abbrev}<br />
        </div>;
    } else {
        draftInfo = <div>Undrafted: {player.draft.year}<br /></div>;
    }

    let contractInfo = null;
    if (showContract) {
        contractInfo = <div>
            {freeAgent ? 'Asking for' : 'Contract'}: {helpers.formatCurrency(player.contract.amount, 'K')}/yr thru {player.contract.exp}<br />
        </div>;
    }

    let statusInfo = null;
    if (!retired) {
        statusInfo = <div>
            {injured ? <span className="label label-danger label-injury" style={{marginLeft: 0}} title={`${player.injury.type} (out ${player.injury.gamesRemaining} more games)`}>{player.injury.gamesRemaining}</span> : null}
            <SkillsBlock
                className={injured ? null : 'skills-alone'}
                skills={player.ratings[player.ratings.length - 1].skills}
            />
            <WatchBlock
                pid={player.pid}
                watch={player.watch}
            />
            <br />
        </div>;
    }

    const statsRegularSeason = player.stats.filter((ps) => !ps.playoffs);
    const statsPlayoffs = player.stats.filter((ps) => ps.playoffs);

    return <div>
        <div className="row">
            <div className="col-sm-6">
                <h1>{player.name} <NewWindowLink /></h1>
                <div  id="player-picture-container" className="player-picture face">
                    <PlayerPicture face={player.face} imgURL={player.imgURL} />
                </div>
                <div style={{float: 'left'}}>
                    <strong>{player.ratings[player.ratings.length - 1].pos}, {player.teamRegion} </strong><br />
                    MMR: {player.ratings[player.ratings.length - 1].MMR}<br />
                    Rank: {player.ratings[player.ratings.length - 1].rank}<br />
                    Born: {player.born.year} - {player.born.country}<br />
                    Region: {player.born.loc}<br />
                    {!player.diedYear ? <div>Age: {player.age}<br /></div> : <div>Died: {player.diedYear}<br /></div>}
                    Gender: {player.born.maleFemale}<br />
                    {contractInfo}
                    {godMode ? <div><a href={helpers.leagueUrl(['customize_player', player.pid])} className="god-mode god-mode-text">Edit Player</a><br /></div> : null}
                    {statusInfo}
                </div>
            </div>

            <div className="visible-xs clearfix" />

            <div className="col-sm-6" style={{whiteSpace: 'nowrap'}}>
                {!retired ? <RatingsOverview ratings={player.ratings} /> : null}
            </div>
        </div>

        <p />

        {showTradeFor ? <span title={player.untradableMsg}>
            <button
                className="btn btn-default"
                disabled={player.untradable}
                onClick={() => toWorker('actions.tradeFor', {pid: player.pid})}
            >Trade For</button>
        </span> : null}
        {freeAgent ? <button
            className="btn btn-default"
            onClick={() => toWorker('actions.negotiate', player.pid)}
        >Sign Free Agent</button> : null}


	   <h2>Champions</h2>
		<DataTable
			cols={getCols('Champion','Games Played','Win Rate','Minutes','Kills','Deaths','Assists', 'KDA', 'Creep Score')}
			defaultSort={[1, 'asc']}
			name="Player:Champions"
			rows={player.championStats.map((s, i) => {
				return {
					key: i,
					data: [s.champPicked,s.gp,s.winP.toFixed(0),s.min.toFixed(1),s.fg.toFixed(1),s.fga.toFixed(1),s.fgp.toFixed(1),s.kda.toFixed(2),s.tp.toFixed(1)],
				};
			})}
		/>

        <h2>Regular Season</h2>
        <h3>Stats</h3>
        <StatsTable
            careerStats={player.careerStats}
            name="Player:Stats"
            stats={statsRegularSeason}
        />



        <h2>Playoffs</h2>
        <h3>Stats</h3>
        <StatsTable
            careerStats={player.careerStatsPlayoffs}
            name="Player:PlayoffStats"
            stats={statsPlayoffs}
        />




        <h2>Ratings</h2>
        <DataTable
            cols={getCols('Year','Split', 'Region','Team', 'Age', 'Pos', 'Rank', 'MMR', 'Ovr', 'Pot', 'rating:Ad', 'rating:Ft', 'rating:Con', 'rating:TP', 'rating:Ld', 'rating:Aw', 'rating:La', 'rating:TF', 'rating:RT', 'rating:Ps', 'rating:SkS', 'rating:LH', 'rating:SuS', 'rating:St', 'rating:InjR', 'Languages', 'Skills')}
            defaultSort={[0, 'asc']}
            name="Player:Ratings"
            rows={player.ratings.map(r => {
                return {
                    key: r.season,
                    data: [
                        r.season,
                        r.seasonSplit,
                        r.region,
                        r.abbrev ? <a href={helpers.leagueUrl(['roster', r.abbrev, r.season])}>{r.abbrev}</a> : null,
                        r.age,
                        r.pos,
                        r.rank,
						r.MMR,
                        r.ovr,
                        r.pot,
                        r.hgt,
                        r.stre,
                        r.spd,
                        r.jmp,
                        r.endu,
                        r.ins,
                        r.dnk,
                        r.ft,
                        r.fg,
                        r.tp,
                        r.blk,
                        r.stl,
                        r.drb,
                        r.pss,
                        r.reb,
                        r.languagesGrouped,
                        <SkillsBlock className="skills-alone" skills={r.skills} />,
                    ],
                };
            })}
        />

        <div className="row">
            <div className="col-sm-6">
                <h2>Awards</h2>
                {player.awardsGrouped.length > 0 ? <table className="table table-nonfluid table-striped table-bordered table-condensed player-awards">
                    <tbody>
                        {player.awardsGrouped.map((a, i) => {
                            return <tr key={i}><td>
                                {a.count > 1 ? <span>{a.count}x </span> : null}
                                {a.type} ({a.seasons.join(', ')})
                            </td></tr>;
                        })}
                    </tbody>
                </table> : null}
                {player.awardsGrouped.length === 0 ? <p>None</p> : null}
            </div>
            <div className="col-sm-6">
                <h2>Statistical Feats</h2>
                {feats.map(e => {
                    return <p key={e.eid}><b>{e.season}</b>: <SafeHtml dirty={e.text} /></p>;
                })}
                {feats.length === 0 ? <p>None</p> : null}
            </div>
        </div>




        <div className="row">
            <div className="col-md-10 col-md-push-2 col-sm-9 col-sm-push-3">
                <h2>Transactions</h2>
                {events.map(e => {
                    return <p key={e.eid}><b>{e.season}</b>: <SafeHtml dirty={e.text} /></p>;
                })}
                {events.length === 0 ? <p>None</p> : null}
            </div>
            <div className="col-md-2 col-md-pull-10 col-sm-3 col-sm-pull-9">
                <h2>Salaries</h2>
                <DataTable
                    cols={getCols('Year', 'Amount')}
                    defaultSort={[0, 'asc']}
                    footer={['Total', helpers.formatCurrency(player.salariesTotal, 'K')]}
                    name="Player:Salaries"
                    rows={player.salaries.map((s, i) => {
                        return {
                            key: i,
                            data: [s.season, helpers.formatCurrency(s.amount, 'K')],
                        };
                    })}
                />
            </div>
        </div>


    </div>;
};

Player.propTypes = {
    events: React.PropTypes.arrayOf(React.PropTypes.shape({
        eid: React.PropTypes.number.isRequired,
        season: React.PropTypes.number.isRequired,
        text: React.PropTypes.string.isRequired,
    })).isRequired,
    feats: React.PropTypes.arrayOf(React.PropTypes.shape({
        eid: React.PropTypes.number.isRequired,
        season: React.PropTypes.number.isRequired,
        text: React.PropTypes.string.isRequired,
    })).isRequired,
    freeAgent: React.PropTypes.bool.isRequired,
    godMode: React.PropTypes.bool.isRequired,
    injured: React.PropTypes.bool.isRequired,
    player: React.PropTypes.object.isRequired,
    retired: React.PropTypes.bool.isRequired,
    showContract: React.PropTypes.bool.isRequired,
    showTradeFor: React.PropTypes.bool.isRequired,
};

export default Player;
