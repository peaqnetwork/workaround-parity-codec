import { ApiPromise, WsProvider } from '@polkadot/api';
import { xxhashAsHex, blake2AsHex, blake2AsU8a } from '@polkadot/util-crypto'
import { u8aConcat, u8aToHex, u8aToU8a, hexToU8a, hexStripPrefix } from '@polkadot/util';
import { RegistryTypes } from '@polkadot/types-codec/types';
import { decodeAddress, Keyring, } from '@polkadot/keyring'
import {
    createKeyMulti,
    encodeAddress,
    sortAddresses,
} from '@polkadot/util-crypto';
import config from '../config/default.json';
import MultiSig from './MultiSig';

// This is used for Transaction address creation request payload
interface TransactionRequest {
    addresses: Array<string>;
    threshold: number;
    // the index of the creator address in the [addresses] array
    // used in filtering [otherSignatories]
    owner_index: number;
}

// This is used for Transaction address creation response payload
interface TransactionResponse {
    multisig_address: string;
    other_sig: Array<string>;
}

// This is used for Requesting Transaction
interface ServiceRequest {
    signer_uri: string
    signer_seed: string
    provider_address: string;
    amount: string;
}

interface ServiceDeliveredRequest {
    signer_uri: string;
    signer_seed: string;
    spent: Info;
    refund: Info;
}

interface Info {
    token: string;
    tx_hash: string;
    timepoint: any;
    call_hash: string;
}



// A Transaction service that allows to create Transaction address 
export default class Transaction {

    async get(data: string) {

    }

    async create(data: ServiceRequest) {
        // init the api connection
        var wsp = new WsProvider(config.testnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;

        const kr = new Keyring({ type: 'sr25519', ss58Format: config.ss58Prefix });
        var kp;
        if (data.signer_seed != null) {
            kp = kr.addFromMnemonic(data.signer_seed);
        } else {
            kp = kr.createFromUri(data.signer_uri);
        }

        var txhash = await api.tx.transaction.serviceRequested(
            data.provider_address, data.amount).signAndSend(kp);
        console.log(`tx hash: ${txhash}\n\n`);

        api.disconnect();

        return { status: true, tx_hash: txhash };

    }

    async update(id: string, data: ServiceDeliveredRequest) {

        // init the api connection
        var wsp = new WsProvider(config.testnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;

        const kr = new Keyring({ type: 'sr25519', ss58Format: config.ss58Prefix });
        var kp;
        if (data.signer_seed != null) {
            kp = kr.addFromMnemonic(data.signer_seed);
        } else {
            kp = kr.createFromUri(data.signer_uri);
        }
        console.log(`kp: ${JSON.stringify(kp)}\n\n`);

        var txhash = await api.tx.transaction.serviceDelivered(
            kp.address, data.refund, data.spent).signAndSend(kp);
        console.log(`tx hash: ${txhash}\n\n`);

        api.disconnect();

        return { status: true, tx_hash: txhash };


    }

}
