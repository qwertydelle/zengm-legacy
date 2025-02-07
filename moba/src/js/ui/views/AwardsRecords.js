import React from 'react';
import _ from 'underscore';
import {helpers} from '../../common';
import {getCols, setTitle} from '../util';
import {DataTable, Dropdown, NewWindowLink} from '../components';

const formatYear = (year) => {
    return Object.keys(year).map((k, i) => {
        const years = helpers.yearRanges(year[k].map(y => y.season)).join(', ');
        return <span key={i}>{i > 0 ? ', ' : null}{k} <small>({years})</small></span>;
    });
};

const CheckmarkOrCross = ({children}) => {
    if (children === 1) {
        return <span className="glyphicon glyphicon-ok text-success" />;
    }

    return <span className="glyphicon glyphicon-remove text-danger" />;
};
CheckmarkOrCross.propTypes = {
    children: React.PropTypes.number.isRequired,
};

const AwardsRecords = ({awardType, awardTypeVal, awardsRecords, playerCount}) => {
    setTitle('Awards Records');
    const cols = getCols('Name', 'Count', 'Year', 'Last', 'Retired', 'HOF');

    const rows = awardsRecords.map(a => {
        return {
            key: a.pid,
            data: [
                <a href={helpers.leagueUrl(["player", a.pid])}>{a.name}</a>,
                a.count,
                formatYear(_.groupBy(a.years, 'team')),
                a.lastYear,
                <CheckmarkOrCross>{a.retired ? 1 : 0}</CheckmarkOrCross>,
                <CheckmarkOrCross>{a.hof ? 1 : 0}</CheckmarkOrCross>,
            ],
        };
    });

    return <div>
        <Dropdown view="awards_records" fields={["awardType"]} values={[awardType]} />
        <h1>Awards<NewWindowLink /></h1>

        <p>More: <a href={helpers.leagueUrl(['history_all'])}>League History</a> | <a href={helpers.leagueUrl(['history_all_MSI'])}>MSI History</a> | <a href={helpers.leagueUrl(['team_records'])}>Team Records</a></p>

        <h4>{playerCount} players - {awardTypeVal} </h4>

        <DataTable
            cols={cols}
            defaultSort={[1, 'desc']}
            name="AwardsRecords"
            rows={rows}
            pagination
        />
    </div>;
};

AwardsRecords.propTypes = {
    awardType: React.PropTypes.oneOf([
        'champion',
        'mvp',
        'finals_mvp',
        'dpoy',
        'smoy',
        'roy',
        'first_team',
        'second_team',
        'third_team',
        'all_league',
        'first_def',
        'second_def',
        'third_def',
        'all_def',
        'ppg_leader',
        'rpg_leader',
        'apg_leader',
        'spg_leader',
        'bpg_leader',
        'region_mvp',		
        'region_all',				
        'region_champion',						
    ]).isRequired,
    awardTypeVal: React.PropTypes.string.isRequired,
    awardsRecords: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    playerCount: React.PropTypes.number.isRequired,
};

export default AwardsRecords;
