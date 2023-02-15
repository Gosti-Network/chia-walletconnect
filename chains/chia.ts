import { JsonRpcRequest } from "@walletconnect/jsonrpc-utils";
import { ChainsMap } from "caip-api";

import {
	NamespaceMetadata,
	ChainMetadata,
	ChainRequestRender,
} from "../helpers";

export const ChiaMetadata: NamespaceMetadata = {
	testnet: {
		logo: "https://www.chia.net/wp-content/uploads/2022/09/chia-logo.svg",
		rgb: "92, 170, 98",
	},
	mainnet: {
		logo: "https://www.chia.net/wp-content/uploads/2022/09/chia-logo.svg",
		rgb: "92, 170, 98",
	},
};

// TODO: add `chia` namespace to `caip-api` package to avoid manual specification here.
export const ChiaChainData: ChainsMap = {
	testnet: {
		name: "Chia Testnet",
		id: "chia:testnet",
		rpc: ["https://chia.net"],
		slip44: 8444,
		testnet: true,
	},
	mainnet: {
		name: "Chia Mainnet",
		id: "chia:mainnet",
		rpc: ["https://chia.net"],
		slip44: 8444,
		testnet: false,
	}
};

export function getChainMetadata(chainId: string): ChainMetadata {
	const reference = chainId.split(":")[1];
	const metadata = ChiaMetadata[reference];
	if (typeof metadata === "undefined") {
		throw new Error(`No chain metadata found for chainId: ${chainId}`);
	}
	return metadata;
}

export function getChainRequestRender(
	request: JsonRpcRequest
): ChainRequestRender[] {
	let params = [{ label: "Method", value: request.method }];

	switch (request.method) {
		default:
		params = [
			...params,
			{
				label: "params",
				value: JSON.stringify(request.params, null, "\t"),
			},
		];
		break;
	}
	return params;
}
