// imports
const api = require('./api')

setInterval(async () => {
    // faz a chamada
    console.log('Chamou a API :',  await api.time())
}, process.env.CRAWLER_INTERVAL)