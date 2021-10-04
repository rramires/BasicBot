// imports
const axios = require('axios')
const querystring = require('querystring')
const crypto = require('crypto')
const apiKey = process.env.API_KEY
const secretKey = process.env.SECRET_KEY
const apiURL = process.env.API_URL
const apiVersion = process.env.API_VERSION

/**
 * Metodo interno que monta e faz as chamadas públicas
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
        const url = `${apiURL}/${apiVersion}/${path}${query}`
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
 * Metodo interno que monta e faz as chamadas privadas
 * 
 * @param path - Consulta desejada na API
 * @param data - Dados que serão convertidos no formato querystring
 * @param method GET ou POST
 * @returns json
 */
const privateCall = async (path, data = {}, method = 'GET') => {
    try{
        // pega o timestamp
        const timestamp = Date.now()
        // monta o hash/assinatura 
        const signature = crypto.createHmac('sha256', secretKey) // cria a assinatura
                                // incrementa os dados e o timestamp
                                .update(`${querystring.encode({...data, timestamp})}`) 
                                // define o formato de saída
                                .digest('hex')
        //console.log('Signature', signature)
        
        // gera o objeto de dados
        const newData = {...data, timestamp, signature}

        // monta a query
        const query = `?${querystring.encode(newData)}`

        // monta a url
        const url = `${apiURL}/${apiVersion}/${path}${query}`
        //console.log('url: ', url)

        // faz a chamada 
        // 'X-MBX-APIKEY', é um Header específico da Binance que tem que ter a API_KEY
        const result = await axios({
            method,
            url,
            headers: {
                'X-MBX-APIKEY': apiKey
            }
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
 * @returns json
 */
const depth = async (symbol = 'BTCUSDT', limit = 5) => {
    return publicCall('depth', {
        symbol, 
        limit
    })
}


/**
 * Retorna as informações da Exchange
 * 
 * @returns json
 */
const exchangeInfo = async () => {
    return publicCall('exchangeInfo')
}


/**
 * Retorna as informações da Conta
 * 
 * @returns json
 */
 const accountInfo = async () => {
    return privateCall('account')
}


// exports
module.exports = {
    time,
    depth,
    exchangeInfo,
    accountInfo
}