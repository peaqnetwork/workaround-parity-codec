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

// This is used for Multisig address creation request payload
interface MultiSigRequest {
    addresses: Array<string>;
    threshold: number;
    // the index of the creator address in the [addresses] array
    // used in filtering [otherSignatories]
    owner_index: number;
}

// This is used for Multisig address creation response payload
interface MultiSigResponse {
    multisig_address: string;
    other_sig: Array<string>;
}

// This is used for Multisig as_multisig transaction creation request payload
interface AsMultiSigRequest {
    signer_uri: string
    signer_seed: string
    address: string;
    threshold: number;
    other_sig: Array<string>;
    amount: string;
}

// This is used for Multisig approve_as_multisig transaction creation request payload
interface ApproveAsMultiSigRequest {
    signer_uri: string
    signer_seed: string
    threshold: number;
    other_sig: Array<string>;
    call_hash: string;
    timepoint: any;
}

// A MultiSig service that allows to create MultiSig address 
export default class MultiSig {

    async get(data: string) {

    }


    async create(data: MultiSigRequest) {
        const addresses = data.addresses;
        const threshold = data.threshold;
        const owner_index = data.owner_index;

        // create addresses in byte array
        var multisig_address = createKeyMulti(addresses, threshold);
        console.log(`multisig addr: ${multisig_address}`);

        // Convert multisig_address to SS58 encoding.
        const ss58_address = encodeAddress(multisig_address, config.ss58Prefix);
        console.log(`ss58_address : ${ss58_address}`);

        // Remove the owner from the addresses.
        const other_sig_addr = addresses.filter((who) => who !== addresses[owner_index]);
        console.log(`other_sig_addr : ${other_sig_addr}`);

        // Sort the [other_sig] addresses
        const other_sig = sortAddresses(other_sig_addr, config.ss58Prefix);
        console.log(`other_sig : ${other_sig}`);

        var res: MultiSigResponse = {
            multisig_address: ss58_address,
            other_sig: other_sig
        }

        return res;

    }

    async update(id: string, data: AsMultiSigRequest) {

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

        var transfer = api.tx.balances
            .transfer(data.address, data.amount);

        // console.log(`transfer: ${transfer}\n\n`);
        // console.log(`transfer byte: ${transfer.toU8a()}\n\n`);

        var call = transfer.toU8a();
        var callhash = u8aToHex(call);
        console.log(`tx hash: ${callhash}\n\n`);


        var txhash = await api.tx.multiSig.asMulti(
            data.threshold, data.other_sig, null,
            callhash, true, 1000000000).signAndSend(kp);
        console.log(`tx hash: ${txhash}\n\n`);

        var ev = api.events.multisig.NewMultisig.is
        console.log(`ev: ${ev}\n\n`);


        api.disconnect();

        return { status: true, tx_hash: txhash, call_hash: callhash };


    }

    async patch(id: string, data: ApproveAsMultiSigRequest) {

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

        var txhash = await api.tx.multiSig.approveAsMulti(
            data.threshold, data.other_sig, data.timepoint, data.call_hash, 1000000000).signAndSend(kp);

        api.disconnect();

        return { status: true, tx_hash: txhash };

    }

}
