import { createContext, ReactNode, useContext, useState } from "react";

import { ChiaMethods } from "../constants";
import { GetNftsResult, GetWalletsResult, SignMessageByIdResult } from "../types";
import { useWalletConnectClient } from "./WalletConnectClientContext";


/**
 * Types
 */
interface IFormattedRpcResponse {
	method?: string;
	address?: string;
	valid: boolean;
	result: GetNftsResult | GetWalletsResult | SignMessageByIdResult;
}

export type WalletConnectRpcParams = {
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

type TRpcRequestCallback = (params: WalletConnectRpcParams) => Promise<IFormattedRpcResponse>;

interface IContext {
	ping: () => Promise<boolean>;
	walletconnectRpc: {
		logIn: TRpcRequestCallback,
		getWallets: TRpcRequestCallback,
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
	setChainId: React.Dispatch<React.SetStateAction<string>>,
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
export function WalletConnectRpcContextProvider({ children }: {
	children: ReactNode | ReactNode[];
}) {
	const [pending, setPending] = useState(false);
	const [result, setResult] = useState<IFormattedRpcResponse | null>();
	const [chainId, setChainId] = useState<string>("chia:testnet");

	const { client, session } =
		useWalletConnectClient();

	const createWalletConnectRpcRequestHandler =
		(
			rpcRequest: (
				params: WalletConnectRpcParams
			) => Promise<IFormattedRpcResponse>
		) =>
			async (params: WalletConnectRpcParams): Promise<IFormattedRpcResponse> => {
				if (typeof client === "undefined") {
					throw new Error("WalletConnect is not initialized");
				}
				if (typeof session === "undefined") {
					throw new Error("Session is not connected");
				}

				try {
					setPending(true);
					const res = await rpcRequest(params);
					setResult(res);
					return res;
				} catch (err: any) {
					console.error("RPC request failed: ", err);
					const errorMessage = {
						valid: false,
						result: err?.message ?? err,
					};
					setResult(errorMessage);
					return errorMessage;
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
			try {
				await client.ping({ topic: session.topic });
				return true;
			} catch (e) {
				return false;
			}
		} catch (e) {
			console.error(e);
			return false;
		} finally {
			setPending(false);
		}
	};

	const standardRequest = (method: string): (params: WalletConnectRpcParams) => Promise<IFormattedRpcResponse> => async (
		params: WalletConnectRpcParams
	): Promise<IFormattedRpcResponse> => {
		const res = await client!.request({
			topic: session!.topic,
			chainId,
			request: {
				method,
				params,
			},
		});

		return {
			method,
			valid: true,
			result: res,
		} as IFormattedRpcResponse;
	};


	const walletconnectRpc = {

		/**
		 * @param fingerprint
		 */
		logIn: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_LOG_IN)),

		/**
		 * @param fingerprint
		 */
		getWallets: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_WALLETS)),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 */
		getWalletBalance: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_WALLET_BALANCE)),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 */
		getCurrentAddress: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_CURRENT_ADDRESS)),

		/**
		 * @param fingerprint
		 * @param amount
		 * @param fee
		 * @param address
		 * @param walletId
		 * @param waitForConfirmation: optional
		 */
		sendTransaction: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_SEND_TRANSACTION)),

		/**
		 * @param fingerprint
		 * @param id
		 * @param message
		 */
		signMessageById: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_SIGN_MESSAGE_BY_ID)),

		/**
		 * @param fingerprint
		 * @param address
		 * @param amount
		 */
		signMessageByAddress: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_SIGN_MESSAGE_BY_ADDRESS)),

		/**
		 * @param fingerprint
		 * @param walletId: optional
		 * @param newAddress: optional
		 */
		getNextAddress: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_NEXT_ADDRESS)),

		/**
		 * @param fingerprint
		 * @param None
		 */
		getSyncStatus: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_SYNC_STATUS)),

		/**
		 * @param fingerprint
		 * @param start: optional
		 * @param end: optional
		 * @param sortKey: optional
		 * @param reverse: optional
		 * @param includeMyOffers: optional
		 * @param includeTakenOffers: optional
		 */
		getAllOffers: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_ALL_OFFERS)),

		/**
		 * @param fingerprint
		 * @param None
		 */
		getOffersCount: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_OFFERS_COUNT)),

		/**
		 * @param fingerprint
		 * @param walletIdsAndAmounts
		 * @param driverDict
		 * @param validateOnly: optional
		 * @param disableJSONFormatting: optional
		 */
		createOfferForIds: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_CREATE_OFFER_FOR_IDS)),

		/**
		 * @param fingerprint
		 * @param tradeId
		 * @param secure
		 * @param fee
		 */
		cancelOffer: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_CANCEL_OFFER)),

		/**
		 * @param fingerprint
		 * @param offerData
		 */
		checkOfferValidity: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_CHECK_OFFER_VALIDITY)),

		/**
		 * @param fingerprint
		 * @param offer
		 * @param fee
		 */
		takeOffer: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_TAKE_OFFER)),

		/**
		 * @param fingerprint
		 * @param offerData
		 */
		getOfferSummary: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_OFFER_SUMMARY)),

		/**
		 * @param fingerprint
		 * @param offerId
		 */
		getOfferData: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_OFFER_DATA)),

		/**
		 * @param fingerprint
		 * @param offerId
		 */
		getOfferRecord: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_OFFER_RECORD)),

		/**
		 * @param fingerprint
		 * @param amount
		 * @param fee
		 */
		createNewCATWallet: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_CREATE_NEW_CAT_WALLET)),

		/**
		 * @param fingerprint
		 * @param walletId
		 */
		getCATAssetId: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_CAT_ASSET_ID)),

		/**
		 * @param fingerprint
		 * @param walletId
		 * @param address
		 * @param amount
		 * @param fee
		 * @param memo: optional
		 * @param waitForConfirmation: optional
		 */
		spendCAT: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_SPEND_CAT)),

		/**
		 * @param fingerprint
		 * @param assetId
		 * @param name
		 */
		addCATToken: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_ADD_CAT_TOKEN)),

		/**
		 * @param fingerprint
		 * @param walletIds
		 */
		getNFTs: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_NFTS)),

		/**
		 * @param fingerprint
		 * @param coinId
		 */
		getNFTInfo: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_GET_NFT_INFO)),

		/**
		 * @param fingerprint
		 * @param walletId
		 * @param nftCoinId
		 * @param launcherId
		 * @param targetAddress
		 * @param fee
		 */
		transferNFT: createWalletConnectRpcRequestHandler(standardRequest(ChiaMethods.CHIA_TRANSFER_NFT)),

	};

	return (
		<WalletConnectRpcContext.Provider
			value={{
				ping,
				walletconnectRpc,
				rpcResult: result,
				isRpcRequestPending: pending,
				setChainId,
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
