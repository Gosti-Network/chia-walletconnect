import { createContext, ReactNode, useContext, useState } from "react";

import { useWalletConnectClient } from "./WalletConnectClientContext";

import { CHIA_METHODS } from "./constants";

/**
 * Types
 */
interface IFormattedRpcResponse {
	method?: string;
	address?: string;
	valid: boolean;
	result: string;
}

export type WalletConnectParams = {
	address: string,
	amount: number,
	assetId: string,
	coinId: string,
	disableJSONFormatting: boolean,
	driverDict: object,
	end: number,
	fee: number,
	fingerprint: string,
	id: string,
	includeMyOffers: boolean,
	includeTakenOffers: boolean,
	launcherId: string,
	message: string,
	name: string,
	nftCoinId: string,
	newAddress: boolean,
	offer: string,
	offerData: string,
	offerId: string,
	receiveAddress: string,
	reverse: boolean,
	secure: boolean,
	sortKey: string,
	start: number,
	targetAddress: string,
	tradeId: string,
	transactionId: string,
	validateOnly: boolean
	waitForConfirmation: boolean,
	walletId: number,
	walletIds: object,
	walletIdsAndAmounts: object,
}

type TRpcRequestCallback = (params: WalletConnectParams) => Promise<void>;

interface IContext {
	ping: () => Promise<void>;
	walletconnectRpc: {
		logIn: TRpcRequestCallback,
		getWallets: TRpcRequestCallback,
		getTransaction: TRpcRequestCallback,
		getWalletBalance: TRpcRequestCallback,
		getCurrentAddress: TRpcRequestCallback,
		sendTransaction: TRpcRequestCallback,
		signMessageById: TRpcRequestCallback,
		signMessageByAddress: TRpcRequestCallback,
		getNextAddress: TRpcRequestCallback,
		getSyncStatus: TRpcRequestCallback,
		getAllOffers: TRpcRequestCallback,
		getOffersCount: TRpcRequestCallback,
		createOfferForIds: TRpcRequestCallback,
		cancelOffer: TRpcRequestCallback,
		checkOfferValidity: TRpcRequestCallback,
		takeOffer: TRpcRequestCallback,
		getOfferSummary: TRpcRequestCallback,
		getOfferData: TRpcRequestCallback,
		getOfferRecord: TRpcRequestCallback,
		createNewCATWallet: TRpcRequestCallback,
		getCATAssetId: TRpcRequestCallback,
		spendCAT: TRpcRequestCallback,
		addCATToken: TRpcRequestCallback,
		getNFTs: TRpcRequestCallback,
		getNFTInfo: TRpcRequestCallback,
		transferNFT: TRpcRequestCallback,
	},
	rpcResult?: IFormattedRpcResponse | null;
	isRpcRequestPending: boolean;
}

/**
 * Context
 */
export const WalletConnectRpcContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
export function WalletConnectRpcContextProvider({children}: {
	children: ReactNode | ReactNode[];
}) {
	const [pending, setPending] = useState(false);
	const [result, setResult] = useState<IFormattedRpcResponse | null>();
	const [chainId, setChainId] = useState<string>("chia:mainnet")

	const { client, session } =
		useWalletConnectClient();

	const _createWalletConnectRpcRequestHandler =
		(
			rpcRequest: (
				params: WalletConnectParams
			) => Promise<IFormattedRpcResponse>
		) =>
		async (params: WalletConnectParams) => {
			if (typeof client === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}
			if (typeof session === "undefined") {
				throw new Error("Session is not connected");
			}

			try {
				setPending(true);
				const result = await rpcRequest(params);
				setResult(result);
			} catch (err: any) {
				console.error("RPC request failed: ", err);
				setResult({
					valid: false,
					result: err?.message ?? err,
				});
			} finally {
				setPending(false);
			}
		};


	const ping = async () => {
		if (typeof client === "undefined") {
			throw new Error("WalletConnect is not initialized");
		}
		if (typeof session === "undefined") {
			throw new Error("Session is not connected");
		}

		try {
			setPending(true);
			let valid = false;
			try {
				await client.ping({ topic: session.topic });
				valid = true;
			} catch (e) {
				valid = false;
			}

			// display result
			setResult({
				method: "ping",
				valid,
				result: valid ? "Ping succeeded" : "Ping failed",
			});
		} catch (e) {
			console.error(e);
			setResult(null);
		} finally {
			setPending(false);
		}
	};


	const walletconnectRpc = {

		/**
		 * @param fingerprint
		 */
		logIn: _createWalletConnectRpcRequestHandler(
			
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_LOG_IN;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),
		
		/**
		 * @param fingerprint
		 */
		getWallets: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_WALLETS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 */
		getTransaction: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_WALLETS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 */
		getWalletBalance: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_WALLET_BALANCE;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 */
		getCurrentAddress: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_CURRENT_ADDRESS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param amount
		 * @param fee
		 * @param address
		 * @param walletId
		 * @param waitForConfirmation: optional
		 */
		sendTransaction: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_SEND_TRANSACTION;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param id
		 * @param message
		 */
		signMessageById: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_SIGN_MESSAGE_BY_ID;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param address
		 * @param amount
		 */
		signMessageByAddress: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_SIGN_MESSAGE_BY_ADDRESS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 * @param newAddress: optional
		 */
		getNextAddress: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_NEXT_ADDRESS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param None
		 */
		getSyncStatus: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_SYNC_STATUS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param start: optional
		 * @param end: optional
		 * @param sortKey: optional
		 * @param reverse: optional
		 * @param includeMyOffers: optional
		 * @param includeTakenOffers: optional
		 */
		getAllOffers: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_ALL_OFFERS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param None
		 */
		getOffersCount: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_OFFERS_COUNT;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletIdsAndAmounts
		 * @param driverDict
		 * @param validateOnly: optional
		 * @param disableJSONFormatting: optional
		 */
		createOfferForIds: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_CREATE_OFFER_FOR_IDS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param tradeId
		 * @param secure
		 * @param fee
		 */
		cancelOffer: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_CANCEL_OFFER;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param offerData
		 */
		checkOfferValidity: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_CHECK_OFFER_VALIDITY;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param offer
		 * @param fee
		 */
		takeOffer: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_TAKE_OFFER;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param offerData
		 */
		getOfferSummary: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_OFFER_SUMMARY;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param offerId
		 */
		getOfferData: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_OFFER_DATA;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param offerId
		 */
		getOfferRecord: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_OFFER_RECORD;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param amount
		 * @param fee
		 */
		createNewCATWallet: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_CREATE_NEW_CAT_WALLET;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId
		 */
		getCATAssetId: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_CAT_ASSET_ID;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId
		 * @param address
		 * @param amount
		 * @param fee
		 * @param memo: optional
		 * @param waitForConfirmation: optional
		 */
		spendCAT: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_SPEND_CAT;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),
		
		/**
		 * @param fingerprint
		 * @param assetId
		 * @param name
		 */
		addCATToken: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_ADD_CAT_TOKEN;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletIds
		 */
		getNFTs: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_NFTS;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param coinId
		 */
		getNFTInfo: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_GET_NFT_INFO;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),

		/**
		 * @param fingerprint
		 * @param walletId
		 * @param nftCoinId
		 * @param launcherId
		 * @param targetAddress
		 * @param fee
		 */
		transferNFT: _createWalletConnectRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = CHIA_METHODS.CHIA_TRANSFER_NFT;
				const result = await client!.request({
					topic: session!.topic,
					chainId,
					request: {
						method,
						params: params,
					},
				});
		
				return {
					method,
					valid: true,
					result: JSON.stringify(result),
				};
			}
		),
		
	};

	return (
		<WalletConnectRpcContext.Provider
			value={{
				ping,
				walletconnectRpc,
				rpcResult: result,
				isRpcRequestPending: pending,
			}}
			>
			{children}
		</WalletConnectRpcContext.Provider>
	);
}

export function useWalletConnectRpc() {
	const context = useContext(WalletConnectRpcContext);
	if (context === undefined) {
		throw new Error("useWalletConnectRpc must be used within a WalletConnectRpcContextProvider");
	}
	return context;
}
