export enum WalletType {
	STANDARD = 0,
	RATE_LIMITED = 1,
	ATOMIC_SWAP = 2,
	AUTHORIZED_PAYEE = 3,
	MULTISIG = 4,
	CUSTODY = 5,
	CAT = 6,
	RECOVERABLE = 7,
	DID = 8,
	POOLING = 9,
	NFT = 10,
	DATALAYER = 11,
	DATALAYEROFFER = 12,
}

export type RpcResult = {
	data: GetWalletsResult[] | GetNftsResult;
	endpointName: string;
	fulfilledTimeStamp: number;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	isUninitialized: boolean;
	originalArgs: object;
	startedTimeStamp: number;
};

export type GetWalletsResult = {
	data: string;
	id: number;
	meta: WalletMetadata;
	name: string;
	type: WalletType;
};

export type WalletMetadata = {
	assetId: string;
	name: string;
};

export type GetNftsResult = {
	id: Nft[];
};

export type Nft = {
	$nftId: string;
	chainInfo: string;
	dataHash: string;
	dataUris: string[];
	editionNumber: number;
	editionTotal: number;
	launcherId: string;
	launcherPuzhash: string;
	licenseHash: string;
	licenseUris: string[];
	metadataHash: string;
	metadataUris: string[];
	mintHeight: number;
	minterDid: string;
	nftCoinId: string;
	offChainMetadata: string;
	ownerDid: string;
	p2Address: string;
	pendingTransaction: boolean;
	royaltyPercentage: number;
	royaltyPuzzleHash: string;
	supportsDid: boolean;
	updaterPuzhash: string;
	walletId: number;
};
