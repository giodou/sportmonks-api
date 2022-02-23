const sportmonksApi = require('../apis/sportmonksApi');
const footballRespository = require('../repositories/footballRespository');
const { waitTime } = require('../utils/timeUtils')

async function getInPlayLivescoresWithRetry(numberOfReTrys) {

    if (!numberOfReTrys)
        numberOfReTrys = 0;

    if (numberOfReTrys > process.env.NUMBER_OF_RETRYS_ON_API_ERROR)
        return false;

    try {
        const nestedIncludes = ['inplayOdds',
                                'events',
                                'localTeam',
                                'visitorTeam',
                                'trends',
                                'stats',
                                'probability',
                                'corners',
                                'valuebet',
                                'flatOdds'];

        return await sportmonksApi.getInPlayLivescores(nestedIncludes);
    } catch (err) {
        //retry
        await waitTime(15);
        console.log('[retrying] sincing in play livescores from sportmonks api...');
        return getInPlayLivescoresWithRetry(++numberOfReTrys)
    }
}

function saveInPlayLivescoreStatus(inPlayLivescores) {
    try {
        if (inPlayLivescores)
            inPlayLivescores.map(async (livescore) => {
                try {
                    livescore.minute = livescore.time.minute;
                    footballRespository.insertObj(livescore, 'sportmonks-minute-by-minute-inplay-livescores');
                } catch (err) {
                    footballRespository.insertObj(err, 'sportmonks-api-sincing-errors');
                    console.error(`error in saveInPlayLivescoreStatus: ${err}`);
                }
            });
    } catch (err) {
        console.error(`error in saveInPlayLivescoreStatus: ${err}`);
    }
}

function saveInPlayLivescores(inPlayLivescores) {
    try {
        if (inPlayLivescores)
            inPlayLivescores.map(async (livescore) => {
                try {
                    livescore.minute = livescore.time.minute;
                    delete livescore._id;
                    footballRespository.replaceObj({ id: livescore.id }, { $set: livescore }, 'sportmonks-inplay-livescores');
                } catch (err) {
                    footballRespository.insertObj(err, 'sportmonks-api-sincing-errors');
                    console.error(`error in saveInPlayLivescoreStatus: ${err}`);
                }
            });
    } catch (err) {
        console.error(`error in saveInPlayLivescoreStatus: ${err}`);
    }
}

async function syncCurrentStatusOfInPlayLivescoresToDatabase() {
    try {

        let inPlayLivescores = await getInPlayLivescoresWithRetry();

        if (inPlayLivescores) {
            console.log(`sincing ${inPlayLivescores.length} in play livescores...`);
            saveInPlayLivescoreStatus(inPlayLivescores);
            saveInPlayLivescores(inPlayLivescores);
        }

    } catch (err) {
        console.log(`error in syncCurrentStatusOfInPlayLivescoresToDatabase: ${err}`);
    }
}

async function getAllLeaguesThatCoversPredictions() {
    const leagues = await sportmonksApi.getAllLeagues();

    const coveredLeagues = leagues.filter(league =>
        league.coverage.predictions
        && (league.active));

    const coveredLeagueIds = coveredLeagues.map(obj => {
        return obj.id
    })

    coveredLeagues.map(obj => {
        console.log(obj);
    })

    console.log(`${coveredLeagues.length} leagues with predicitons covered`)

    return coveredLeagueIds;
}

async function getAllLeagues() {
    const leagues = await sportmonksApi.getAllLeagues();

    console.log(`${leagues.length} leagues`)

    return leagues;
}

async function getInPlayLivescores(includes) {
    const livescores = await sportmonksApi.getInPlayLivescores(includes);

    console.log(livescores.length)

    return livescores;
}

module.exports = {
    syncCurrentStatusOfInPlayLivescoresToDatabase,
    getAllLeaguesThatCoversPredictions,
    getAllLeagues,
    getInPlayLivescores
}