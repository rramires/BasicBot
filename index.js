// imports
const api = require('./api')
const symbol = process.env.SYMBOL

setInterval(async () => {
    // faz a chamada
    //console.log('Chamou a API :',  await api.time())
    //console.log('ExchangeInfo :',  await api.exchangeInfo())
    const result = await api.depth(symbol)
    console.log('Symbol: ',  symbol)
    console.log('Highest Buy: ',  result.bids[0][0])
    console.log('Lowest Sell: ',  result.asks[0][0])
}, process.env.CRAWLER_INTERVAL)