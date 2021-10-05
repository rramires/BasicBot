// imports
const api = require('./api')
const symbol = process.env.SYMBOL
const profit = process.env.PROFITABILITY

setInterval(async () => {
    /*
    console.log('Chamou a API :',  await api.time())
    //console.log('ExchangeInfo :',  await api.exchangeInfo())
    console.log('Account Info: ',  await api.accountInfo())
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

    // faz a chamada na carteira
    const account = await api.accountInfo()
    // filtra para pegar as moedas
    const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1)
    console.log('Posição da carteira: ', coins)

    // Implemente sua estratégia
    if(sell < 52000){      
        // Verificando se tenho saldo 
        const saldo = parseInt(coins.find(c => c.asset === 'USDT').free)
        if(saldo > 10){
            console.log('Meu saldo é de: ', saldo)
            // Executa a ordem, comprando 0.01 BTC com USDT por exemplo
            // Não passamos o price, pois é uma ordem a mercado
            // ou seja, o menor preço no momento
            /*
            const buyOrder = await api.newOrder(symbol, 0.01)
            console.log('BuyStatus: ', buyOrder.status, 'id: ', buyOrder.orderId)
            */

            // Posicionar ordem de venda com algum lucro
            //const sellPrice = parseInt(sell * profit)
            const sellPrice = parseInt(buy * 0.9) 
            const sellOrder = await api.newOrder(symbol, 0.01, sellPrice, 'SELL', 'LIMIT')
            console.log('SellStatus: ', sellOrder.status, 'id: ', sellOrder.orderId)
            console.log('SellOrder: ', sellOrder)
        }
        else{
            console.log('Saldo inferior a 10')
        }

    }
    else if(buy > 52500){
        console.log('Venda !!!')
    }
    else{
        console.log('Esperando o mercado sair do lugar...')
    }
}, process.env.CRAWLER_INTERVAL)

