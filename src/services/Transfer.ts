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
    signer_seed: string
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

    async get(data: string) {


        var wsp = new WsProvider(config.localnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;

        var bal = api.tx.balances.transfer.callIndex;
        console.log(`bal: ${JSON.stringify(bal)}\n\n`);

        var did = api.tx.peaqDid.readAttribute.callIndex;
        console.log(`bal: ${JSON.stringify(did)}\n\n`);

        var did = api.tx.peaqDid.addAttribute.callIndex;
        console.log(`bal: ${JSON.stringify(did)}\n\n`);

        var multisig = api.tx.multiSig.approveAsMulti.callIndex;
        console.log(`multisig: ${JSON.stringify(multisig)}\n\n`);

        const kr = new Keyring({ type: 'sr25519', ss58Format: config.ss58Prefix });
        const kp = kr.createFromUri("//Bob");

        const transfer = api.tx.balances.transfer("5FYeWGzCG8rp9uD1fLciEn2E8bspijXC5JHe1PXnTTNPFLTX", "10000000000000000");

        // retrieve the payment info
        const { partialFee, weight } = await transfer.paymentInfo(kp);
        console.log(`partialFee: ${JSON.stringify(partialFee)}\n\n`);
        console.log(`weight: ${JSON.stringify(weight)}\n\n`);

        return { msg: "SUCCESS" };
    }


    async create(data: TransferRequest) {
        // init the api connection
        var wsp = new WsProvider(config.localnet);
        var api = await (await ApiPromise.create({ provider: wsp })).isReady;

        const kr = new Keyring({ type: 'sr25519', ss58Format: config.ss58Prefix });
        var kp;
        if (data.signer_seed != null) {
            kp = kr.addFromMnemonic(data.signer_seed);
        } else {
            kp = kr.createFromUri(data.signer_uri);
        }
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
