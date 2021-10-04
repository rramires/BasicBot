// imports
const api = require('./api')
const symbol = process.env.SYMBOL

setInterval(async () => {
    /*
    console.log('Chamou a API :',  await api.time())
    //console.log('ExchangeInfo :',  await api.exchangeInfo())
    */

    let buy = 0, sell = 0

    // faz a chamada no book
    const result = await api.depth(symbol)
    console.log('Symbol: ',  symbol)

    // filtra testando se não está vazio
    if(result.bids && result.bids.length){
        console.log('Highest Buy: ',  result.bids[0][0])
        buy = parseInt(result.bids[0][0])
    }
    if(result.asks && result.asks.length){
        console.log('Lowest Sell: ',  result.asks[0][0])
        sell = parseInt(result.asks[0][0])
    }

    // Implemente sua estratégia
    if(sell < 50000){
        console.log('Compre !!!')
    }
    else if(buy > 60000){
        console.log('Venda !!!')
    }
    else{
        console.log('Esperando o mercado sair do lugar...')
    }
}, process.env.CRAWLER_INTERVAL)

