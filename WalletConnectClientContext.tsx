import Client from "@walletconnect/sign-client";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import QRCodeModal from "@walletconnect/qrcode-modal";
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

import {
	CHIA_EVENTS,
	CHIA_METHODS,
	DEFAULT_APP_METADATA,
	DEFAULT_LOGGER,
	DEFAULT_PROJECT_ID,
	DEFAULT_RELAY_URL,
} from "./constants";
import { getSdkError } from "@walletconnect/utils";


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
export function WalletConnectClientContextProvider({children}: {
	children: ReactNode | ReactNode[];
}) {
	const [client, setClient] = useState<Client>();
	const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
	const [session, setSession] = useState<SessionTypes.Struct>();

	const [isInitializing, setIsInitializing] = useState(false);
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

	const connect = useCallback(
		async (pairing: any) => {
			console.log("pairing:", pairing);
			if (typeof client === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}
			console.log("connect, pairing topic is:", pairing?.topic);
			try {
				const chain = ["chia:mainnet"]

				const requiredNamespaces = {
					'chia': {
						methods: Object.values(CHIA_METHODS),
						chains: ["chia:mainnet"],
						events: Object.values(CHIA_EVENTS),
					},
				}

				console.log("requiredNamespaces", requiredNamespaces)

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

				const session = await approval();
				console.log("Established session:", session);
				await onSessionConnected(session);
				// Update known pairings after session is connected.
				setPairings(client.pairing.getAll({ active: true }));
			} catch (e) {
				console.error(e);
				// ignore rejection
			} finally {
				// close modal in case it was open
				QRCodeModal.close();
			}
		},
		[client, onSessionConnected]
	);

	const disconnect = useCallback(async () => {
		if (typeof client === "undefined") {
			throw new Error("WalletConnect is not initialized");
		}
		if (typeof session === "undefined") {
			throw new Error("Session is not connected");
		}
		try {
			await client.disconnect({
				topic: session.topic,
				reason: getSdkError("USER_DISCONNECTED"),
			});
		} catch (error) {
			console.log(error);
		}
		// Reset app state after disconnect.
		reset();
	}, [client, session]);

	const _subscribeToEvents = useCallback(
		async (_client: Client) => {
		if (typeof _client === "undefined") {
			throw new Error("WalletConnect is not initialized");
		}

		_client.on("session_ping", (args) => {
			console.log("PING");
			console.log("EVENT", "session_ping", args);
		});

		_client.on("session_event", (args) => {
			console.log("Session Event");
			console.log("EVENT", "session_event", args);
		});

		_client.on("session_update", ({ topic, params }) => {
			console.log("Session Update");
			console.log("EVENT", "session_update", { topic, params });
			const { namespaces } = params;
			const _session = _client.session.get(topic);
			const updatedSession = { ..._session, namespaces };
			onSessionConnected(updatedSession);
		});

		_client.on("session_delete", () => {
			console.log("Session Delete");
			console.log("EVENT", "session_delete");
			reset();
		});

		},
		[onSessionConnected]
	);

	const _checkPersistedState = useCallback(
		async (_client: Client) => {
			if (typeof _client === "undefined") {
				throw new Error("WalletConnect is not initialized");
			}

			console.log(
				"RESTORING CLIENT: ",
				_client);
			
			// populates existing pairings to state
			setPairings(_client.pairing.getAll({ active: true }));
			console.log(
				"RESTORED PAIRINGS: ",
				_client.pairing.getAll({ active: true })
			);

			if (typeof session !== "undefined") return;
			// populates (the last) existing session to state
			if (_client.session.length) {
				const lastKeyIndex = _client.session.keys.length - 1;
				const _session = _client.session.get(
					_client.session.keys[lastKeyIndex]
				);
				console.log("RESTORED SESSION:", _session);
				await onSessionConnected(_session);
				return _session;
			}
		},
		[session, onSessionConnected]
	);

	const createClient = useCallback(async () => {
		try {
			setIsInitializing(true);
			
			const _client = await Client.init({
				logger: DEFAULT_LOGGER,
				relayUrl: relayerRegion,
				projectId: DEFAULT_PROJECT_ID,
				metadata: DEFAULT_APP_METADATA,
			});

			console.log("CREATED CLIENT: ", _client);
			console.log("relayerRegion ", relayerRegion);
			setClient(_client);
			prevRelayerValue.current = relayerRegion;
			await _subscribeToEvents(_client);
			await _checkPersistedState(_client);
		} catch (err) {
			throw err;
		} finally {
			setIsInitializing(false);
		}
	}, [_checkPersistedState, _subscribeToEvents, relayerRegion]);

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
