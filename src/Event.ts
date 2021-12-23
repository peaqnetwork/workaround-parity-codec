import { ApiPromise, WsProvider } from '@polkadot/api';

// This is the interface for the message data
interface Event {
    message: string;
    system?: any;
    pallet?: any;
}

// A messages service that allows to create new
// and return all existing messages
export default class EventDecoder {
    // private api: ApiPromise;

    constructor() {
        // var wsp = new WsProvider("wss://fn1.test.peaq.network", 1);
        // ApiPromise.create()
        //     .then((api) => this.api = api)
        //     .catch((e) => console.log("Error occurred while connecting to node: ", e));
    }

    async get(hsh: string) {
        // hsh = "0xba00a7a2a8863f51d815d1f418710021387c4cbd22fa01bd8dd389d9e6c18cc1";
        // hsh = "0xb06152a8c37d8d9adc6a774074dc322cdd48739cd1d4256b5c79889f336771cc";
        // hsh = "0xed3ff0aa6a665f3cd2413547c533f345b50d4ad20c1e9f957f93429ef6395b6f";
        console.log("hhitss:: ", hsh);

        // var wsp = new WsProvider("https://fn1.test.peaq.network");
        // var api = await ApiPromise.create({ provider: wsp });
        var api = await (await ApiPromise.create()).isReady;

        console.log("connected: ", api.isConnected);
        // console.log("ready: ", await api.isReady);

        // var block = await api.rpc.chain.getBlock();
        // console.log("block: ", block);

        var apiAt = await api.at(hsh);
        var event = await apiAt.query.system.events();

        var res: Event = {
            message: "EVENT FOUND"
        }
        console.log(`Event:: ${event} \n\n`);
        var decoded = JSON.parse(JSON.stringify(event.toHuman()));

        if (decoded.length < 2) {
            res.message = "NO EVENT FOUND";
            return res;
        }
        // console.log("event:: ", event.toHuman());
        // var decoded: Array<any> = JSON.parse(JSON.stringify(event.toHuman()));
        // console.log("decoded:: ", decoded);
        var systemEvent = decoded[0]["event"];
        var palletEvent = decoded[1]["event"];
        // console.log(`block event human:: System: #${systemEvent}`);
        // console.log(``);
        // console.log(`block event human:: Pallet: #${palletEvent}`);


        res.system = systemEvent;
        res.pallet = palletEvent;

        api.disconnect();

        return res;

    }

}