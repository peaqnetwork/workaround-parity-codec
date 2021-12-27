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
interface MultiSigRequest {
    addresses: Array<string>;
    threashold: number;
    // the index of the creator address in the [addresses] array
    // used in filtering [otherSignatories]
    owner_index: number;
}

// This is used for Multisig creation response payload
interface MultiSigResponse {
    multisig_address: string;
    other_sig: Array<string>;
}

// A MultiSig service that allows to create MultiSig address 
export default class MultiSigDecoder {

    async get(data: string) {

    }


    async create(data: MultiSigRequest) {
        const addresses = data.addresses;
        const threashold = data.threashold;
        const owner_index = data.owner_index;

        // create addresses in byte array
        var multisig_address = createKeyMulti(addresses, threashold);
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

}
