// imports
const api = require('./api')
// .env
const interval = process.env.CRAWLER_INTERVAL
const symbol = process.env.SYMBOL
const accSymbol = process.env.ACC_SYMBOL
const accMinOrder = process.env.ACC_MIN_ORDER
const qtyOrder = process.env.QTY_ORDER
const symDecimal = process.env.SYMBOL_DECIMAL
const profit = process.env.PROFITABILITY
const initialBuy = process.env.INITIAL_BUY


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
        buy = parseFloat(result.bids[0][0])
    }
    if(result.asks && result.asks.length){
        console.log('Lowest Sell: ',  result.asks[0][0])
        sell = parseFloat(result.asks[0][0])
    }

    // faz a chamada na carteira
    const account = await api.accountInfo()
    // filtra para pegar as moedas
    const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1)
    console.log('Posição da carteira: ', coins)

    
    // Se for maior que o valor definido
    if(sell >= initialBuy){      
        // Verificando se tenho saldo 
        const saldo = parseFloat(coins.find(c => c.asset === accSymbol).free)
        // Verifica se o saldo é o mínimo possivel para efetuar uma ordem
        if(saldo > accMinOrder){
            //
            console.log('Meu saldo é de: ', saldo)

            // Executa a ordem, comprando 0.01 BTC com USDT por exemplo
            // Não passamos o price, pois é uma ordem a mercado
            // ou seja, o menor preço no momento
            const buyOrder = await api.newOrder(symbol, qtyOrder)
            console.log('BuyStatus: ', buyOrder.status, 'id: ', buyOrder.orderId)

            if(buyOrder.status === 'FILLED'){
                // Posicionar ordem de venda com o lucro determinado no PROFITABILITY do .env
                const sellPrice = parseFloat(sell * profit).toFixed(symDecimal)
                const sellOrder = await api.newOrder(symbol, qtyOrder, sellPrice, 'SELL', 'LIMIT')
                console.log('SellStatus: ', sellOrder.status, 'id: ', sellOrder.orderId)
                // console.log('SellOrder: ', sellOrder)
            }
        }
        else{
            console.log(`Saldo inferior a ${accMinOrder}`, saldo)
        }
    }
    else{
        console.log('Esperando o mercado sair do lugar...')
    }
    
}, interval)

