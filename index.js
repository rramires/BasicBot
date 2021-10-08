// imports
const api = require('./api')
// .env
const interval = process.env.CRAWLER_INTERVAL
//
const symbol = process.env.SYMBOL
//
const accCoin = process.env.ACC_COIN
const accDecimal = process.env.ACC_DECIMAL
const accMinOrder = process.env.ACC_MIN_ORDER
const accMinBalance = process.env.ACC_MIN_BALANCE
const initialBuy = process.env.INITIAL_BUY
//
const coin = process.env.COIN
const coinDecimal = process.env.COIN_DECIMAL
const qtyOrder = process.env.QTY_ORDER
const minOrder = process.env.MIN_ORDER
const profit = process.env.PROFITABILITY
const buyBack = process.env.BUY_BACK


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


// armazena o maior valor de compra
let athWhenBought = 0


setInterval(async () => {
    // limpa
    console.clear()

    // pega o horário do servidor
    let time = await api.time()

    // faz a chamada no book
    const result = await api.depth(symbol)
    console.log('Book:',  symbol, '- Server Time:', sdtDate(time.serverTime))

    let buy = 0, sell = 0
    // filtra testando se não está vazio
    if(result.bids && result.bids.length){
        buy = parseFloat(result.bids[0][0])
        console.log('Highest Buy:',  buy)
    }
    if(result.asks && result.asks.length){
        sell = parseFloat(result.asks[0][0])
        console.log('Lowest Sell:',  sell)
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
    console.log('Total', `${coin}:`, coinTotal.toFixed(coinDecimal), '- Free:', coinFree.toFixed(coinDecimal), '- Locked:', coinLocked.toFixed(coinDecimal))

    // Pegando os saldos na moeda de acumulação
    const accFree = parseFloat(coins.find(c => c.asset === accCoin).free)
    const accLocked = parseFloat(coins.find(c => c.asset === accCoin).locked)
    const accTotal = accFree + accLocked
    console.log('Total', `${accCoin}:`, accTotal.toFixed(accDecimal), '- Free:', accFree.toFixed(accDecimal), '- Locked:', accLocked.toFixed(accDecimal))

    // Calculando o saldo total da carteira na moeda de acumulação
    const totalBalance = parseFloat(accTotal + (coinTotal * sell))
    console.log('Min Balance:', parseFloat(accMinBalance).toFixed(accDecimal), '- Aprox. Total Balance:', totalBalance.toFixed(accDecimal), accCoin)
    // linha
    console.log('----------------------------------------------------------------------')

    
    /**
     * Se tiver ordem no book de vendas
     * se for maior que o valor mínimo de entrada, definido no book
     */
    if(sell < 0 && sell <= initialBuy){ 
        console.log('Waiting for the market to reach:', initialBuy)
    }
    else{
        /**
         * Cálculos do tamanho da ordem
         */

        // calcula o valor disponivel para compra
        const accAvailable = accFree - accMinBalance - accMinOrder
        //console.log('accAvailable:', accAvailable)

        // calcula o tamanho da ordem na moeda de acumulo de acordo com o definido em QTY_ORDER
        const buyAccValue = parseFloat(qtyOrder * sell)

        // calcula o tamanho mínimo da ordem possível na moeda de acumulo de acordo com o definido em MIN_ORDER
        const minBuyAccValue = parseFloat(minOrder * sell)

        // valor a ser comprado
        let buyValue = 0

        // Verifica se tem saldo suficiente para comprar o valor inteiro definido em QTY_ORDER
        if(buyAccValue <= accAvailable){
            buyValue = qtyOrder
        }
        // Verifica se tem saldo suficiente para comprar o mínimo definido em MIN_ORDER
        else if(minBuyAccValue <= accAvailable){
            buyValue = parseFloat(accAvailable / sell).toFixed(coinDecimal)
        }
        else{
            console.log('There is not enough balance for a purchase.')
        }
        // console.log('buyValue:', buyValue)

        // se foi validado e definido um valor de compra
        if(buyValue > 0){
            
            /**
             * Faz a compra
             * Não passamos o price, pois é uma ordem a mercado 
             * ou seja, o menor preço no momento
             */ 
            const buyOrder = await api.newOrder(symbol, buyValue)

            // calcula o preço médio da compra
            const avgPrice = avgObj(buyOrder.fills, 'price', 'qty')
            console.log('BuyStatus:', buyOrder.status, '- Id: ', buyOrder.orderId, '- Qty:', buyValue, '- Average price:', avgPrice.toFixed(accDecimal))

            
            // se conseguiu comprar, posicionar ordem de venda com o lucro determinado no PROFITABILITY do .env
            if(buyOrder.status === 'FILLED'){
                // adiciona o percentual de lucro em cima do preço médio
                const sellPrice = parseFloat(avgPrice * profit).toFixed(accDecimal)

                // cria a ordem
                const sellOrder = await api.newOrder(symbol, buyValue, sellPrice, 'SELL', 'LIMIT')
                console.log('SellStatus: ', sellOrder.status, '- Id: ', sellOrder.orderId, '- Qty:', buyValue, '- Sell price:', sellPrice)
                // console.log('SellOrder: ', sellOrder)
            }
        }
    }    
}, interval * 1000)

