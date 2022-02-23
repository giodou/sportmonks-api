const axios = require("axios").default;
const footballRespository = require('../repositories/footballRespository');

function registerRequest(options) {
    try {
        const request = {
            request: options,
            time: new Date()
        }

        footballRespository.insertObj(request, 'sportmonks-api-requests');
    }
    catch (err) {
        throw err;
    }
}

async function getInPlayLivescores(includes) {
    const includeOptions = includes ? `&include=${includes.join()}` : '';

    const options = {
        method: 'GET',
        url: `${process.env.API_BASE_URL}/livescores/now
        ?tz=${process.env.TIMEZONE}
        &api_token=${process.env.SPORTMONKS_API_TOKEN}
        ${includeOptions}`,
    };

    try {
        registerRequest(options);
        const response = await axios.request(options);

        if(response.status == 200)
            return response.data.data;
        else{
            registerError(options, err);
            throw 'Response from sportmoks returned a error';
        }    
    }
    catch (err) {
        registerError(options, err);
        throw err;
    }

}

async function getAllLeagues() {
    const options = {
        method: 'GET',
        url: `${process.env.API_BASE_URL}/leagues?api_token=${process.env.SPORTMONKS_API_TOKEN}`
    };

    try {
        registerRequest(options);
        const response = await (await axios.request(options));
        return response.data.data;
    }
    catch (err) {
        registerError(options, err);
        throw err;
    }
}

function registerError(requestOptions, error){
    error.request_options = requestOptions;
    try {
        footballRespository.insertObj(err, 'sportmonks-api-errors');    
    } catch (error) {
        console.error('Error on register error method: ', error);
    } 
}



module.exports = {
    getAllLeagues,
    getInPlayLivescores
}
