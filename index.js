// imports
const api = require('./api')
// .env
const interval = process.env.CRAWLER_INTERVAL
const symbol = process.env.SYMBOL
const accCoin = process.env.ACC_COIN
const coin = process.env.COIN
const accMinOrder = process.env.ACC_MIN_ORDER
const accMinBalance = process.env.ACC_MIN_BALANCE
const qtyOrder = process.env.QTY_ORDER
const minOrder = process.env.MIN_ORDER
const symDecimal = process.env.SYMBOL_DECIMAL
const profit = process.env.PROFITABILITY
const buyBack = process.env.BUY_BACK
const initialBuy = process.env.INITIAL_BUY

/**
 * Média ponderada
 */
const avgObj = (array, propValue, propWeight) => {
    const [sum, weightSum] = array.reduce((acc, order) =>{
        let value = parseFloat(order[propValue])
        let weight = parseFloat(order[propWeight])
        acc[0] = acc[0] + value * weight
        acc[1] = acc[1] + weight
        return acc
    }, [0, 0]) 
    return parseFloat(sum / weightSum)
}


/**
 * Data no formato string a partir de um timestamp
 */
const sdtDate = (timestamp) =>{
    const date = new Date(timestamp);
    //
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    //
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`
}


setInterval(async () => {
    //
    let buy = 0, sell = 0

    // limpa
    console.clear()

    // pega o horário do servidor
    let time = await api.time()

    // faz a chamada no book
    const result = await api.depth(symbol)
    console.log('Book:',  symbol, '- Server Time:', sdtDate(time.serverTime))

    // filtra testando se não está vazio
    if(result.bids && result.bids.length){
        console.log('Highest Buy:',  result.bids[0][0])
        buy = parseFloat(result.bids[0][0])
    }
    if(result.asks && result.asks.length){
        console.log('Lowest Sell:',  result.asks[0][0])
        sell = parseFloat(result.asks[0][0])
    }
    // linha
    console.log('----------------------------------------------------------------------')

    // faz a chamada na carteira
    const account = await api.accountInfo()
    // filtra para pegar as moedas
    const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1)
    //console.log('Posição da carteira: ', coins)

    // Pegando os saldos na moeda 
    const coinFree = parseFloat(coins.find(c => c.asset === coin).free)
    const coinLocked = parseFloat(coins.find(c => c.asset === coin).locked)
    const coinTotal = coinFree + coinLocked
    console.log('Total', `${coin}:`, coinTotal.toFixed(symDecimal), '- Free:', coinFree.toFixed(symDecimal), '- Locked:', coinLocked.toFixed(symDecimal))

    // Pegando os saldos na moeda de acumulação
    const accFree = parseFloat(coins.find(c => c.asset === accCoin).free)
    const accLocked = parseFloat(coins.find(c => c.asset === accCoin).locked)
    const accTotal = accFree + accLocked
    console.log('Total', `${accCoin}:`, accTotal.toFixed(symDecimal), '- Free:', accFree.toFixed(symDecimal), '- Locked:', accLocked.toFixed(symDecimal))

    // Calculando o saldo total da carteira na moeda de acumulação
    const totalBalance = parseFloat(accTotal + (coinTotal * sell))
    console.log('Total Balance:', totalBalance.toFixed(symDecimal), accCoin)
    // linha
    console.log('----------------------------------------------------------------------')

    

    // Se for maior que o valor definido
    //if(sell && sell >= initialBuy){      
        
        

        // calcula o valor da carteira na moeda de acumulação
        //
        
       
            //
            
            /*
            Implementar a compra até o final do saldo, respeitando o saldo mínimo
            */

            /*
            // Executa a ordem, comprando 0.01 BTC com USDT por exemplo
            // Não passamos o price, pois é uma ordem a mercado
            // ou seja, o menor preço no momento
            const buyOrder = await api.newOrder(symbol, qtyOrder)
            // pega o preço médio
            const avgPrice = avgObj(buyOrder.fills, 'price', 'qty')
            console.log('BuyStatus: ', buyOrder.status, 'id: ', buyOrder.orderId, 'Preço médio:', avgPrice.toFixed(symDecimal))

            // se conseguiu comprar
            if(buyOrder.status === 'FILLED'){
                // Posicionar ordem de venda com o lucro determinado no PROFITABILITY do .env
                const sellPrice = parseFloat(avgPrice * profit).toFixed(symDecimal)
                // cria a ordem
                const sellOrder = await api.newOrder(symbol, qtyOrder, sellPrice, 'SELL', 'LIMIT')
                console.log('SellStatus: ', sellOrder.status, 'id: ', sellOrder.orderId, 'Preço de venda:', sellPrice)
                // console.log('SellOrder: ', sellOrder)
            }
            */
        
    
    
}, interval)

