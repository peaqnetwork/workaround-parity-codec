import { ApiPromise, WsProvider } from '@polkadot/api';
import { xxhashAsHex, blake2AsHex, blake2AsU8a } from '@polkadot/util-crypto'
import { u8aConcat, u8aToHex, u8aToU8a, hexToU8a, hexStripPrefix } from '@polkadot/util';
import { RegistryTypes } from '@polkadot/types-codec/types';
import { decodeAddress, Keyring } from '@polkadot/keyring'
import {
    createKeyMulti,
    encodeAddress,
    sortAddresses
} from '@polkadot/util-crypto';
import config from '../config/default.json';

// This is used for Multisig creation request payload
interface TransferRequest {
    signer_uri: string
    address: string;
    amount: string;
}

// This is used for Multisig creation response payload
interface TransferResponse {
    message: string;
    status: boolean;
}

// A Transfer service that allows to create Transfer to an address 
// using provided signer uri 
export default class Transfer {

    async get(data: string) { }


    async create(data: TransferRequest) {
        // init the api connection
        var wsp = new WsProvider(config.localnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;

        const kr = new Keyring({ type: 'sr25519', ss58Format: config.ss58Prefix });
        const kp = kr.createFromUri(data.signer_uri);
        // console.log(`kp: ${JSON.stringify(kp)}\n\n`);

        await api.tx.balances
            .transfer(data.address, data.amount).signAndSend(kp);

        api.disconnect();
        var res: TransferResponse = {
            message: "SUCCESS",
            status: true
        };

        return res;

    }

}
