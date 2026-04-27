/**
 * VenueRegistry ABI.
 *
 * Mirrored from the Prophecy protocol deployments. Used by:
 *   - scripts/create-hackathon-venue.ts  (createVenue call)
 *   - SDK actions that need to read venue config (fee, signer, active)
 *
 * Regenerate from references/prophecy-social-frontend/packages/prophecy-types/
 * if the contracts team ships a new VenueRegistry version.
 */
export const VenueRegistryABI = [{
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
}, {
    inputs: [{
        internalType: "address",
        name: "target",
        type: "address",
    }],
    name: "AddressEmptyCode",
    type: "error",
}, {
    inputs: [],
    name: "ECDSAInvalidSignature",
    type: "error",
}, {
    inputs: [{
        internalType: "uint256",
        name: "length",
        type: "uint256",
    }],
    name: "ECDSAInvalidSignatureLength",
    type: "error",
}, {
    inputs: [{
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
    }],
    name: "ECDSAInvalidSignatureS",
    type: "error",
}, {
    inputs: [{
        internalType: "address",
        name: "implementation",
        type: "address",
    }],
    name: "ERC1967InvalidImplementation",
    type: "error",
}, {
    inputs: [],
    name: "ERC1967NonPayable",
    type: "error",
}, {
    inputs: [],
    name: "FailedCall",
    type: "error",
}, {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
}, {
    inputs: [],
    name: "NotInitializing",
    type: "error",
}, {
    inputs: [{
        internalType: "address",
        name: "owner",
        type: "address",
    }],
    name: "OwnableInvalidOwner",
    type: "error",
}, {
    inputs: [{
        internalType: "address",
        name: "account",
        type: "address",
    }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
}, {
    inputs: [],
    name: "UUPSUnauthorizedCallContext",
    type: "error",
}, {
    inputs: [{
        internalType: "bytes32",
        name: "slot",
        type: "bytes32",
    }],
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
}, {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "Erc20RequirementsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
    }],
    name: "Initialized",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: false,
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "MaxVenueFeeBpsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: false,
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "MaxVenueRewardBpsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "NftRequirementsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
    }, {
        indexed: false,
        internalType: "uint256",
        name: "newNonce",
        type: "uint256",
    }],
    name: "NonceConsumed",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
    }, {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
    }],
    name: "OwnershipTransferStarted",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
    }, {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
    }],
    name: "OwnershipTransferred",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "resolver",
        type: "address",
    }, {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
    }],
    name: "ResolverSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
    }],
    name: "Upgraded",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
    }, {
        indexed: false,
        internalType: "address",
        name: "signer",
        type: "address",
    }, {
        indexed: false,
        internalType: "bool",
        name: "active",
        type: "bool",
    }],
    name: "VenueCreated",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: false,
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "VenueFeeBpsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
    }],
    name: "VenueOwnerChanged",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: false,
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "VenueRewardBpsSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
    }, {
        indexed: false,
        internalType: "address",
        name: "signer",
        type: "address",
    }, {
        indexed: false,
        internalType: "bool",
        name: "active",
        type: "bool",
    }],
    name: "VenueUpdated",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: false,
        internalType: "enum IVenueRegistry.ListMode",
        name: "mode",
        type: "uint8",
    }],
    name: "WalletListModeSet",
    type: "event",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        indexed: false,
        internalType: "address[]",
        name: "wallets",
        type: "address[]",
    }, {
        indexed: false,
        internalType: "bool",
        name: "onList",
        type: "bool",
    }],
    name: "WalletListUpdated",
    type: "event",
}, {
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{
        internalType: "string",
        name: "",
        type: "string",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address[]",
        name: "wallets",
        type: "address[]",
    }],
    name: "addToWalletList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "user",
        type: "address",
    }, {
        internalType: "bytes32",
        name: "structHash",
        type: "bytes32",
    }, {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
    }],
    name: "consumeGenericPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "signer",
        type: "address",
    }, {
        internalType: "bool",
        name: "active",
        type: "bool",
    }],
    name: "createVenue",
    outputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [],
    name: "eip712Domain",
    outputs: [{
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
    }, {
        internalType: "string",
        name: "name",
        type: "string",
    }, {
        internalType: "string",
        name: "version",
        type: "string",
    }, {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
    }, {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
    }, {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "erc20Requirements",
    outputs: [{
        internalType: "address",
        name: "token",
        type: "address",
    }, {
        internalType: "uint256",
        name: "minBalance",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getErc20Requirements",
    outputs: [{
        components: [{
            internalType: "address",
            name: "token",
            type: "address",
        }, {
            internalType: "uint256",
            name: "minBalance",
            type: "uint256",
        }],
        internalType: "struct VenueRegistry.Erc20Requirement[]",
        name: "",
        type: "tuple[]",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getNftRequirements",
    outputs: [{
        components: [{
            internalType: "address",
            name: "collection",
            type: "address",
        }, {
            internalType: "uint256",
            name: "minBalance",
            type: "uint256",
        }],
        internalType: "struct VenueRegistry.NftRequirement[]",
        name: "",
        type: "tuple[]",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "user",
        type: "address",
    }],
    name: "getNonce",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getVenueFeeBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getVenueOwner",
    outputs: [{
        internalType: "address",
        name: "",
        type: "address",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getVenueRewardBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getWalletList",
    outputs: [{
        internalType: "address[]",
        name: "",
        type: "address[]",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }],
    name: "getWalletListMode",
    outputs: [{
        internalType: "enum IVenueRegistry.ListMode",
        name: "",
        type: "uint8",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "_owner",
        type: "address",
    }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "",
        type: "address",
    }],
    name: "isResolver",
    outputs: [{
        internalType: "bool",
        name: "",
        type: "bool",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "wallet",
        type: "address",
    }],
    name: "isWalletOnList",
    outputs: [{
        internalType: "bool",
        name: "",
        type: "bool",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "maxVenueFeeBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "maxVenueRewardBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "nextVenueId",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "nftRequirements",
    outputs: [{
        internalType: "address",
        name: "collection",
        type: "address",
    }, {
        internalType: "uint256",
        name: "minBalance",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }, {
        internalType: "address",
        name: "",
        type: "address",
    }],
    name: "nonces",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "owner",
    outputs: [{
        internalType: "address",
        name: "",
        type: "address",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "pendingOwner",
    outputs: [{
        internalType: "address",
        name: "",
        type: "address",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "proxiableUUID",
    outputs: [{
        internalType: "bytes32",
        name: "",
        type: "bytes32",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address[]",
        name: "wallets",
        type: "address[]",
    }],
    name: "removeFromWalletList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        components: [{
            internalType: "address",
            name: "token",
            type: "address",
        }, {
            internalType: "uint256",
            name: "minBalance",
            type: "uint256",
        }],
        internalType: "struct VenueRegistry.Erc20Requirement[]",
        name: "requirements",
        type: "tuple[]",
    }],
    name: "setErc20Requirements",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "setMaxVenueFeeBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "setMaxVenueRewardBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        components: [{
            internalType: "address",
            name: "collection",
            type: "address",
        }, {
            internalType: "uint256",
            name: "minBalance",
            type: "uint256",
        }],
        internalType: "struct VenueRegistry.NftRequirement[]",
        name: "requirements",
        type: "tuple[]",
    }],
    name: "setNftRequirements",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "resolver",
        type: "address",
    }, {
        internalType: "bool",
        name: "allowed",
        type: "bool",
    }],
    name: "setResolver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "setVenueFeeBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "bps",
        type: "uint256",
    }],
    name: "setVenueRewardBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "signer",
        type: "address",
    }],
    name: "setVenueSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "bool",
        name: "active",
        type: "bool",
    }],
    name: "setVenueStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "enum IVenueRegistry.ListMode",
        name: "mode",
        type: "uint8",
    }],
    name: "setWalletListMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "newOwner",
        type: "address",
    }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "address",
        name: "newOwner",
        type: "address",
    }],
    name: "transferVenueOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "address",
        name: "newImplementation",
        type: "address",
    }, {
        internalType: "bytes",
        name: "data",
        type: "bytes",
    }],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "venueFeeBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "venueRewardBps",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "venues",
    outputs: [{
        internalType: "address",
        name: "owner",
        type: "address",
    }, {
        internalType: "address",
        name: "signer",
        type: "address",
    }, {
        internalType: "bool",
        name: "active",
        type: "bool",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "walletListModes",
    outputs: [{
        internalType: "enum IVenueRegistry.ListMode",
        name: "",
        type: "uint8",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }, {
        internalType: "address",
        name: "",
        type: "address",
    }],
    name: "walletLists",
    outputs: [{
        internalType: "bool",
        name: "",
        type: "bool",
    }],
    stateMutability: "view",
    type: "function",
}] as const;
