require('dotenv').config;
const ccxt = require('ccxt');
const axios = require('axios');

const tick = async (config,binanceClient) => {
    const {asset, base , allocation, spread, trickInterval} = config;
    const market = `${asset}/${base}`;

    console.log("Binance Client ", binanceClient);

    // const orders = binanceClient.fetchOpenOrder(market);
    // orders.forEach(order => {
    //      binanceClient.cancelOrder(order.id);
    // });

    const results = await Promise.all([
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
    ]);
    const marketPrice = results[0].data.bitcoin.usd / results[1].data.tether.usd;

    const sellPrice = marketPrice * (1 + spread);
    const buyPrice = marketPrice * (1 - spread);
    const assetBalance = 10;
    const baseBalance = 10;
    const sellVolume = assetBalance * allocation;
    const buyVolume = (baseBalance * allocation) / marketPrice;

    console.log(`
    New tick for ${market}....
    Create limit sell order for ${sellVolume} @${sellPrice}
    Create limit buy order for ${buyVolume} @${buyPrice}
    `);
}

const run = () =>{
    const config= {
        asset: 'BTC',
        base: 'USDT',
        allocation: 0.1,
        spread: 0.2,
        trickInterval: 2000
    };
    const binanceClient = new ccxt.binance({
        apiKey: process.env.API_ENV,
        secret: process.env.SECRET_KEY 
    });
    tick(config,binanceClient);
    setInterval(tick, config.trickInterval,config, binanceClient);
};

run();