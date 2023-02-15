export const DEFAULT_MAIN_CHAINS = [
	"chia:mainnet",
];

export const DEFAULT_TEST_CHAINS = [
	"chia:testnet"
];

export const DEFAULT_CHAINS = [...DEFAULT_MAIN_CHAINS, ...DEFAULT_TEST_CHAINS];

export const DEFAULT_PROJECT_ID = '87af2d227d63f4dbf4a8ac6b7e3f763c';
export const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com';

export const DEFAULT_LOGGER = "debug";

export enum DEFAULT_CHIA_METHODS {
	CHIA_SEND_TRANSACTION = "chia_sendTransaction",
	CHIA_ACCEPT_OFFER = "chia_takeOffer",
	CHIA_NEW_ADDRESS = "chia_getNextAddress",
	CHIA_LOG_IN = 'chia_logIn',
	CHIA_SIGN_MESSAGE_BY_ADDRESS = 'chia_signMessageByAddress',
	CHIA_SIGN_MESSAGE_BY_ID = 'chia_signMessageById',
	CHIA_GET_WALLET_SYNC_STATUS = 'chia_getSyncStatus',
}

export enum DEFAULT_CHIA_EVENTS {}

export const DEFAULT_APP_METADATA = {
	name: "Spriggan Marketplace Dapp",
	description: "Connection to Spriggan Marketplace",
	url: "",
	icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

type RelayerType = {
	value: string | undefined;
	label: string;
};

export const REGIONALIZED_RELAYER_ENDPOINTS: RelayerType[] = [
	{
		value: DEFAULT_RELAY_URL,
		label: "Default",
	},

	{
		value: "wss://us-east-1.relay.walletconnect.com/",
		label: "US",
	},
	{
		value: "wss://eu-central-1.relay.walletconnect.com/",
		label: "EU",
	},
	{
		value: "wss://ap-southeast-1.relay.walletconnect.com/",
		label: "Asia Pacific",
	},
];
