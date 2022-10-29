let dotenv =  require('dotenv');
dotenv.config('.env');
const sade = require('sade');
const prog = sade('nodechain');
const  chainInt = require('./src/cmd/huobiWs')
const  wsServer = require('./src/cmd/wsServer')
const  socketServer = require('./src/cmd/socketIo')
const  ipAuthorize = require('./src/utils/authorize/ipAuthorize').ipAuthorize
const version = '1.0.1';

prog.version(`v${version}. Copyright 2021 Kaadon.`)
    .describe(`nodechain v${version}. Copyright 2021 Kaadon`);




prog.command('sync')
    .describe('Sync files.')
    .action(() => {
        chainInt()
        // ipAuthorize().then(()=>{
        //
        // }).catch((err)=>{
        //     console.log(err)
        // })
    });

prog.command('ws')
    .describe('ws server')
    .action(() => {
        wsServer()

    });

prog.command('io')
    .describe('io server')
    .action(() => {
        socketServer()
    });



prog.command('update')
    .describe('Check new version of ossync.')
    .action(() => {
        console.log('Not implemented yet');
    });

prog.parse(process.argv);