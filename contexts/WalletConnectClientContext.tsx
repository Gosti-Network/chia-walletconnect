import QRCodeModal from "@walletconnect/qrcode-modal";
import Client from "@walletconnect/sign-client";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useRef,
} from "react";

import wc_config from "../../walletconnectconfig.json";
import {
	ChiaEvents,
	ChiaMethods,
	DEFAULT_LOGGER,
	DEFAULT_RELAY_URL,
} from "../constants";




/**
 * Types
 */
interface IContext {
	client: Client | undefined;
	session: SessionTypes.Struct | undefined;
	connect: (pairing?: { topic: string }) => Promise<void>;
	disconnect: () => Promise<void>;
	isInitializing: boolean;
	relayerRegion: string;
	pairings: PairingTypes.Struct[];
	setRelayerRegion: any;
}

/**
 * Context
 */
export const WalletConnectClientContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
export function WalletConnectClientContextProvider({ children }: {
	children: ReactNode | ReactNode[];
}) {
	const [client, setClient] = useState<Client>();
	const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
	const [session, setSession] = useState<SessionTypes.Struct>();

	const [isInitializing, setIsInitializing] = useState(true);
	const prevRelayerValue = useRef<string>("");

	const [relayerRegion, setRelayerRegion] = useState<string>(
		DEFAULT_RELAY_URL!
	);

	const reset = () => {
		setSession(undefined);
		setPairings([]);
		setRelayerRegion(DEFAULT_RELAY_URL!);
	};


	const onSessionConnected = useCallback(
		async (_session: SessionTypes.Struct) => {
			setSession(_session);
		},
		[]
	);

	const disconnect = useCallback(async () => {
		// if (typeof client === "undefined") {
		// 	throw new Error("WalletConnect is not initialized");
		// }
		// if (typeof session === "undefined") {
		// 	throw new Error("Session is not connected");
		// }
		try {

			await client?.disconnect({
				topic: session ? session.topic : "",
				reason: getSdkError("USER_DISCONNECTED"),
			});
		} catch (error) {
			console.error(error);
		}
		// Reset app state after disconnect.
		reset();
	}, [client, session]);

	const connect = useCallback(
		async (pairing: any) => {
			console.log("pairing:", pairing);
			if (typeof client === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}
			console.log("connect, pairing topic is:", pairing?.topic);
			try {
				const requiredNamespaces = {
					'chia': {
						methods: Object.values(ChiaMethods),
						chains: ["chia:testnet"],
						events: Object.values(ChiaEvents),
					},
				};
				console.log("requiredNamespaces", requiredNamespaces);
				const { uri, approval } = await client.connect({
					pairingTopic: pairing?.topic,
					requiredNamespaces,
				});
				// Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
				if (uri) {
					QRCodeModal.open(uri, () => {
						console.log("EVENT", "QR Code Modal closed");
					});
				}

				const sess = await approval();
				console.log("Established session:", sess);
				await onSessionConnected(sess);
				// Update known pairings after session is connected.
				setPairings(client.pairing.getAll({ active: true }));
			} catch (e) {
				disconnect();
				// ignore rejection
			} finally {
				// close modal in case it was open
				QRCodeModal.close();
			}
		},
		[client, disconnect, onSessionConnected]
	);


	const subscribeToEvents = useCallback(
		async (newClient: Client) => {
			if (typeof newClient === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}

			newClient.on("session_ping", (args) => {
				console.log("PING");
				console.log("EVENT", "session_ping", args);
			});

			newClient.on("session_event", (args) => {
				console.log("Session Event");
				console.log("EVENT", "session_event", args);
			});

			newClient.on("session_update", ({ topic, params }) => {
				console.log("Session Update");
				console.log("EVENT", "session_update", { topic, params });
				const { namespaces } = params;
				const sess = newClient.session.get(topic);
				const updatedSession = { ...sess, namespaces };
				onSessionConnected(updatedSession);
			});

			newClient.on("session_delete", () => {
				console.log("Session Delete");
				console.log("EVENT", "session_delete");
				reset();
			});

		},
		[onSessionConnected]
	);

	const checkPersistedState = useCallback(
		async (newClient: Client) => {
			if (typeof newClient === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}

			console.log("RESTORING CLIENT: ", newClient);

			// populates existing pairings to state
			setPairings(newClient.pairing.getAll({ active: true }));

			console.log("RESTORED PAIRINGS: ", newClient.pairing.getAll({ active: true }));

			if (typeof session !== "undefined") return;
			// populates (the last) existing session to state
			if (newClient.session.length) {
				const lastKeyIndex = newClient.session.keys.length - 1;
				const newSession = newClient.session.get(
					newClient.session.keys[lastKeyIndex]
				);
				console.log("RESTORED SESSION:", newSession);
				await onSessionConnected(newSession);
			}
		},
		[session, onSessionConnected]
	);

	const createClient = useCallback(async () => {
		try {
			setIsInitializing(true);

			const newClient = await Client.init({
				logger: DEFAULT_LOGGER,
				relayUrl: relayerRegion,
				projectId: wc_config.project_id,
				metadata: wc_config.metadata,
			});

			console.log("CREATED CLIENT: ", newClient);
			console.log("relayerRegion ", relayerRegion);
			setClient(newClient);
			prevRelayerValue.current = relayerRegion;
			await subscribeToEvents(newClient);
			await checkPersistedState(newClient);
		} catch (err) {
			console.error(err);
			throw err;
		} finally {
			setIsInitializing(false);
		}
	}, [checkPersistedState, subscribeToEvents, relayerRegion]);

	useEffect(() => {
		if (!client || prevRelayerValue.current !== relayerRegion) {
			createClient();
		}
	}, [client, createClient, relayerRegion]);


	const value = useMemo(
		() => ({
			pairings,
			isInitializing,
			relayerRegion,
			client,
			session,
			connect,
			disconnect,
			setRelayerRegion,
		}),
		[
			pairings,
			isInitializing,
			relayerRegion,
			client,
			session,
			connect,
			disconnect,
			setRelayerRegion,
		]
	);

	return (
		<WalletConnectClientContext.Provider
			value={{
				...value,
			}}
		>
			{children}
		</WalletConnectClientContext.Provider>
	);
}

export function useWalletConnectClient() {
	const context = useContext(WalletConnectClientContext);
	if (context === undefined) {
		throw new Error(
			"useWalletConnectClient must be used within a ClientContextProvider"
		);
	}
	return context;
}
