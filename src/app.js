const db = require('../src/db');
const footballService = require('../src/services/footballService');
const timeUtils = require('../src/utils/timeUtils');

//conect and start application
db.connect()
    .then(() => console.log('database connected'))
    .then(async () => {
        
        //force interval to start syncing from init of the next minute
        console.log('Waiting the init of the next minute to start syncing...');
        await timeUtils.waitInitOfNextMinute();

        async function syncDataFromSportmonkApi(){
            const startingSecond = new Date().getSeconds();
    
            //resincronizing sinc calls if needed
            if(startingSecond != 0 && startingSecond > 58)
                await timeUtils.waitInitOfNextMinute();
    
            console.log(`${new Date()} - sincing new data from sportmonks api`);    
            footballService.syncCurrentStatusOfInPlayLivescoresToDatabase();
        }

        syncDataFromSportmonkApi();
        setInterval(syncDataFromSportmonkApi, process.env.TIME_BETWEEN_SINCS_IN_MILISECONDS);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

    

