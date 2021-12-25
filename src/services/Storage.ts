import { ApiPromise, WsProvider } from '@polkadot/api';
import { xxhashAsHex, blake2AsHex, blake2AsU8a } from '@polkadot/util-crypto'
import { decodeAddress } from '@polkadot/keyring'
import { u8aConcat, u8aToHex, u8aToU8a, hexToU8a, hexStripPrefix } from '@polkadot/util';
import { RegistryTypes } from '@polkadot/types-codec/types';
import config from '../config/default.json';
// This is the interface for the event data
interface Storage {
    message: string;
    name?: String;
    value?: any;
    validity?: Number;
    created?: Number;
}

interface StorageKey {
    address: string;
    key: string;
}



// A Storage service that allows to create chain state storage key
// and fetch storage data from chain
export default class StorageDecoder {

    async create(data: StorageKey) {
        const address = data.address;
        const name = data.key;

        // decode address to byte array
        var decoded_address = decodeAddress(address, false, 42);
        console.log(`decoded addr: ${decoded_address}`);

        // convert the name attribute to byte
        var hash_name = u8aToU8a(name)
        console.log(`hash name: ${hash_name}`);

        // concatenate the address and the hash name
        var key = u8aConcat(decoded_address, hash_name);
        console.log(`key: ${key}`);

        // encode the key using blake2b
        var hashed_key = blake2AsHex(key, 256);
        console.log(`hashed key: ${hashed_key}`);

        // hash the pallet name
        var pallet_hash = xxhashAsHex("PeaqDid", 128);
        console.log(`pallet_hash: ${pallet_hash}`);

        // hash the storage name
        var storage_hash = xxhashAsHex("AttributeStore", 128);
        console.log(`storage_hash: ${storage_hash}`);

        // convert the hash_key to bytes
        var hashed_key_bytes = hexToU8a(hashed_key);
        console.log(`hashed_key_bytes: ${hashed_key_bytes}`);

        // hash the hashed_key_bytes to hex using blake2b concat method
        var hashed_key_concat = u8aToHex(u8aConcat(blake2AsU8a(hashed_key_bytes, 128), u8aToU8a(hashed_key_bytes)))
        console.log(`hashed_key_concat: ${hashed_key_concat}`);

        // generate the storage key
        var storage_key = pallet_hash + hexStripPrefix(storage_hash) + hexStripPrefix(hashed_key_concat);

        console.log(`storage-key: ${storage_key}`);

        return storage_key;

    }

}
