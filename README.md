# DEPRECATED - this is old wallet connect code. The current stuff has moved to spriggan-shared.

I may update this with the new walletconnect 2 code at a later time if a better standalone lib doesn't get made

# chia-walletconnect

A Chia specific WalletConnect client derived from the original [Chia Wallet Connect DApp Test](https://github.com/Chia-Network/chia-wallet-connect-dapp-test) with all of the bloat cut out and added chia functionality.

## Usage
Include this repository as a submodule to easily add WalletConnect functionality to your Chia DApp.

```git submodule add https://github.com/Open-Market-Dev-Club/chia-walletconnect.git [./src/chia-walletconnect]```

Put a file named `walletconnectconfig.json` directory above chia-walletconnect with your configuration. Get your own project id from [walletconnect.com](https://walletconnect.com/)

`walletconnectconfig.json` Example:
```
{
	"project_id": "87af2d227d63f4dbf4a8ac6b7e3f763c",
	"metadata": {
		"name": "Spriggan Marketplace Dapp",
		"description": "Connection to Spriggan Marketplace",
		"url": "",
		"icons": ["https://avatars.githubusercontent.com/u/37784886"]
	}
}
```

See [Spriggan Marketplace DApp](https://github.com/Open-Market-Dev-Club/spriggan-marketplace-dapp) for an example usage.
