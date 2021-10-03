// imports
const axios = require('axios')
const querystring = require('querystring')

/**
 * Metodo interno que monta e faz as chamadas
 * 
 * @param path - Consulta desejada na API
 * @param data - Dados que serão convertidos no formato querystring
 * @param method GET ou POST
 * @returns json
 */
const publicCall = async (path, data, method = 'GET') => {
    try{
        // monta a query
        const query = data ? `?${querystring.encode(data)}` : ''

        // monta a url
        const url = `${process.env.API_URL}/${process.env.API_VERSION}/${path}${query}`
        //console.log('url: ', url)

        // faz a chamada
        const result = await axios({
            method,
            url
        })
        return result.data
    }
    catch(err){
        console.log(err)
    }
}


/**
 * Metodo de teste, que retora o horario do servidor
 * 
 * @returns json
 */
const time = async () => {
    return publicCall('time')
}


/**
 * Retorna infos do book de um par de moedas (symbol)
 * 
 * @param symbol Par de moedas, ex BTCUSDT, LTCBTC, etc
 * @param limit Quantidade de ordens no book - Minimo 5
 * @returns 
 */
const depth = async (symbol = 'BTCUSDT', limit = 5) => {
    return publicCall('depth', {
        symbol, 
        limit
    })
}


// exports
module.exports = {
    time,
    depth
}