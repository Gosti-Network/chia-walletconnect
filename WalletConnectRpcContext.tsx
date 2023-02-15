import { createContext, ReactNode, useContext, useState } from "react";

import {
	getLocalStorageTestnetFlag,
} from "./helpers";
import { useWalletConnectClient } from "./WalletConnectClientContext";
import {
	DEFAULT_CHIA_METHODS,
} from "./constants";


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
	fingerprint: string,
	address: string,
	recieveAddress: string,
	id: string,
	offer: string,
	message: string,
	fee: number,
}

type TRpcRequestCallback = (params: WalletConnectParams) => Promise<void>;

interface IContext {
	ping: () => Promise<void>;
	walletconnectRpc: {
		getNewAddress: TRpcRequestCallback,
		acceptOffer: TRpcRequestCallback,
		logIn: TRpcRequestCallback,
		signMessageByAddress: TRpcRequestCallback,
		signMessageById: TRpcRequestCallback,
		getWalletSyncStatus: TRpcRequestCallback,
	},
	rpcResult?: IFormattedRpcResponse | null;
	isRpcRequestPending: boolean;
	isTestnet: boolean;
	setIsTestnet: (isTestnet: boolean) => void;
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
	const [isTestnet, setIsTestnet] = useState(getLocalStorageTestnetFlag());

	const { client, session } =
		useWalletConnectClient();

	const _createWalletConenctRpcRequestHandler =
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

		acceptOffer: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_ACCEPT_OFFER;
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
		getNewAddress: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_NEW_ADDRESS;
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
		logIn: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_LOG_IN;
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
		signMessageByAddress: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_SIGN_MESSAGE_BY_ADDRESS;
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
		signMessageById: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_SIGN_MESSAGE_BY_ID;
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
		getWalletSyncStatus: _createWalletConenctRpcRequestHandler(
			async (
				params: WalletConnectParams
			): Promise<IFormattedRpcResponse> => {
				const method = DEFAULT_CHIA_METHODS.CHIA_GET_WALLET_SYNC_STATUS
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
			isTestnet,
			setIsTestnet,
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
