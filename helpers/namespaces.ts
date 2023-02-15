import { ProposalTypes } from "@walletconnect/types";
import {
  DEFAULT_CHIA_METHODS,
  DEFAULT_CHIA_EVENTS,
} from "../constants";

export const getNamespacesFromChains = (chains: string[]) => {
	const supportedNamespaces: string[] = [];
	chains.forEach((chainId) => {
		const [namespace] = chainId.split(":");
		if (!supportedNamespaces.includes(namespace)) {
			supportedNamespaces.push(namespace);
		}
	});

	return supportedNamespaces;
};

export const getSupportedMethodsByNamespace = (namespace: string) => {
	switch (namespace) {
		case "chia":
			return Object.values(DEFAULT_CHIA_METHODS);
		default:
			throw new Error(`No default methods for namespace: ${namespace}`);
	}
};

export const getSupportedEventsByNamespace = (namespace: string) => {
	switch (namespace) {
		case "chia":
			return Object.values(DEFAULT_CHIA_EVENTS);
		default:
			throw new Error(`No default events for namespace: ${namespace}`);
	}
};

export const getRequiredNamespaces = (
	chains: string[]
): ProposalTypes.RequiredNamespaces => {
	const selectedNamespaces = ["chia"];//getNamespacesFromChains(chains);
	console.log("selected namespaces:", selectedNamespaces);

	return Object.fromEntries(
		selectedNamespaces.map((namespace) => [
			namespace,
			{
				methods: getSupportedMethodsByNamespace(namespace),
				chains: chains.filter((chain) => chain.startsWith(namespace)),
				events: getSupportedEventsByNamespace(namespace) as any[],
			},
		])
	);
};
