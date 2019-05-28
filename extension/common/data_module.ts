export const NEO = '0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';
export const GAS = '0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7';
export enum EVENT {
    READY = 'neoline.ready',
    ACCOUNT_CHANGED = 'neoline.account_changed',
    CONNECTED = 'neoline.connected',
    CONNECTION_REJECTED = 'neoline.connection_rejected',
    NETWORK_CHANGED = 'neoline.network_changed'
}

export enum requestTarget {
    Provider = 'neoline.request_provider',
    Networks = 'neoline.request_networks',
    Account = 'neoline.request_account',
    AccountPublicKey = 'neoline.request_public_key',
    Balance = 'neoline.request_balance',
    InvokeRead = 'neoline.request_invoke_read',
    Transaction = 'neoline.request_transaction'

}

export enum returnTarget {
    Provider = 'neoline.return_provider',
    Networks = 'neoline.return_networks',
    Account = 'neoline.return_account',
    AccountPublicKey = 'neoline.return_public_key',
    Balance = 'neoline.return_balance',
    InvokeRead = 'neoline.return_invoke_read',
    Transaction = 'neoline.return_transaction'

}

export enum errorDescription {
    NO_PROVIDER = 'No provider available.',
    CONNECTION_DENIED = 'The user rejected the request to connect with your dApp'
}

export interface Provider {
    name: string;
    website: string;
    version: string;
    compatibility: string[];
    extra: object;
}

export interface Networks {
    networks: string[]; // Array of network names the wallet provider has available for the dapp developer to connect to.
    defaultNetwork: string; // Network the wallet is currently set to.
}

export interface Account {
    address: string; // Address of the connected account
    label?: string; // A label the users has set to identify their wallet
}

export interface AccountPublicKey {
    address: string; // Address of the connected account
    publicKey: string; // Public key of the connected account
}
export interface GetBalanceArgs {
    params: BalanceRequest | BalanceRequest[];
    network?: string; // Network to submit this request to.If omitted, will default to network the wallet is currently set to.
}

export interface BalanceRequest {
    address: string; // Address to check balance(s)
    assets?: string | string[]; // Asset ID or script hash to check balance.
    // Requests to "MainNet" will accept the asset symbols we well.
    // Requests to non "MainNet" will just return asset balances for NEO and GAS
    fetchUTXO?: boolean;
    // Fetches to UTXO data for NEO and/or GAS if attribute is 'true'
}

export interface BalanceResults {
    [address: string]: Balance[];
}

export interface Balance {
    assetID: string;
    symbol: string;
    amount: string;
}

export interface InvokeReadArgs {
    scriptHash: string; // script hash of the smart contract to invoke a read on
    operation: string; // operation on the smart contract to call
    args: Argument[]; // any input arguments for the operation
    network?: string;  // Network to submit this request to.If omitted, will default to network the wallet is currently set to.
}

export interface Argument {
    type: ArgumentDataType;
    value: any;
}

type ArgumentDataType = 'String' | 'Boolean' | 'Hash160' | 'Hash256' | 'Integer' | 'ByteArray' | 'Array' | 'Address';

export interface TransactionInputArgs {
    txid: string;
    network?: string;
}

export interface TransactionDetails {
    txid: string;
    size: number;
    type: string;
    version: number;
    attributes: TransactionAttribute[];
    vin: any[];
    vout: any[];
    sys_fee: string;
    net_fee: string;
    scripts: TransactionScript[];
    script: string;
    gas: string;
    blockhash: string;
    confirmations: number;
    blocktime: number;
}

interface TransactionAttribute {
    usage: string;
    data: string;
}

interface TransactionScript {
    invocation: string;
    verification: string;
}

export interface Error {
    type: string; // `NO_PROVIDER`|`CONNECTION_DENIED`
    description: string;
    data: string;
}