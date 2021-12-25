import { ApiPromise, WsProvider } from '@polkadot/api';
import config from '../config/default.json';

// This is the interface for the event data
interface Event {
    message: string;
    system?: any;
    pallet?: any;
}

// An Event decoder service that allows to fetch 
// and decode events of a block
export default class EventDecoder {

    async get(hsh: string) {
        console.log("block hash:: ", hsh);

        var wsp = new WsProvider(config.testnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;
        // var api = await (await ApiPromise.create()).isReady;

        console.log("connected: ", api.isConnected);
        // console.log("ready: ", await api.isReady);

        // var block = await api.rpc.chain.getBlock(hsh);
        // console.log("block: ", JSON.stringify(block.toHuman()));

        var apiAt = await api.at(hsh);
        var event = await apiAt.query.system.events();
        // var errors = (await apiAt.query.sytem).errors;
        console.log(`Event:: ${event} \n\n`);
        // console.log(`Errors:: ${JSON.stringify(errors)} \n\n`);

        var res: Event = {
            message: "EVENT FOUND"
        }
        var decoded = JSON.parse(JSON.stringify(event.toHuman()));

        if (decoded.length < 2) {
            res.message = "NO EVENT FOUND";
            api.disconnect();
            return res;
        }

        var systemEvent = decoded[0]["event"];
        var palletEvent = decoded[1]["event"];


        res.system = systemEvent;
        res.pallet = palletEvent;

        api.disconnect();

        return res;

    }

}