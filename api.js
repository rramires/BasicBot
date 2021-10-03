// imports
const axios = require('axios')


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
        const query = data ? `?${querystring.stringify(data)}` : ''
        // faz a chamada
        const result = await axios({
            method,
            url: `${process.env.API_URL}/${process.env.API_VERSION}/${path}${query}`
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
const time = () => {
    return publicCall('time')
}

// exports
module.exports = {
    time
}