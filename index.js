// imports
const api = require('./api')

setInterval(async () => {
    // faz a chamada
    // console.log('Chamou a API :',  await api.time())
    // console.log('Depth :',  await api.depth())
    const result = await api.depth()
    console.log('Highest Buy: ',  result.bids[0][0])
    console.log('Highest Sell: ',  result.asks[0][0])
}, process.env.CRAWLER_INTERVAL)