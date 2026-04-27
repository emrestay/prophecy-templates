/**
 * CreatorResolvedMarket ABI.
 *
 * ⚠️ DORMANT on Somnia testnet staging + development as of 2026-04-24.
 * `VenueRegistry.isResolver(CreatorResolvedMarket)` returns `false`,
 * so calling `createMarket(...)` on it reverts at the resolver check.
 * The canonical market-creation path for hackathon templates is
 * `MultiOutcomeAIResolutionMarket` (see `createMarket.ts`).
 *
 * This ABI is kept in-tree so integrators can still read existing
 * manually-resolved markets (e.g. on other deployments where this
 * resolver IS registered). New markets should go through MOM.
 *
 * Manual resolution path: registerMarket + resolve(marketId, outcome).
 *
 * Mirrored from references/prophecy-social-frontend/packages/prophecy-types/.
 * Regenerate when the contracts team ships a new version.
 */
export const CreatorResolvedMarketABI = [{
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
    name: "AlreadyResolved",
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
    name: "IncorrectMsgValue",
    type: "error",
}, {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
}, {
    inputs: [],
    name: "InvalidWindow",
    type: "error",
}, {
    inputs: [],
    name: "NotAuthorized",
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
    name: "ResolutionWindowClosed",
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
    inputs: [],
    name: "UnknownMarket",
    type: "error",
}, {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
    }, {
        indexed: false,
        internalType: "bool",
        name: "result",
        type: "bool",
    }],
    name: "CreatorMarketResolved",
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
        indexed: true,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
    }, {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
    }, {
        indexed: true,
        internalType: "address",
        name: "resolver",
        type: "address",
    }],
    name: "MarketCreated",
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
        name: "implementation",
        type: "address",
    }],
    name: "Upgraded",
    type: "event",
}, {
    inputs: [],
    name: "SUBSCRIPTION_FUNDING",
    outputs: [{
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    stateMutability: "view",
    type: "function",
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
        internalType: "string",
        name: "name",
        type: "string",
    }, {
        internalType: "string",
        name: "description",
        type: "string",
    }, {
        internalType: "uint256",
        name: "venueId",
        type: "uint256",
    }, {
        internalType: "bytes",
        name: "venueSignature",
        type: "bytes",
    }, {
        internalType: "address",
        name: "stakeToken",
        type: "address",
    }, {
        internalType: "uint256",
        name: "tradingStartTs",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "tradingEndTs",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "resolutionStartTs",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "resolutionEndTs",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "initialLiquidityBase",
        type: "uint256",
    }, {
        internalType: "address",
        name: "resolver",
        type: "address",
    }],
    name: "createMarket",
    outputs: [{
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
    }],
    stateMutability: "payable",
    type: "function",
}, {
    inputs: [{
        internalType: "contract OnChainEventMarket",
        name: "_onChainMarket",
        type: "address",
    }, {
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
        internalType: "uint256",
        name: "",
        type: "uint256",
    }],
    name: "markets",
    outputs: [{
        internalType: "uint256",
        name: "resolutionStartTs",
        type: "uint256",
    }, {
        internalType: "uint256",
        name: "resolutionEndTs",
        type: "uint256",
    }, {
        internalType: "address",
        name: "resolver",
        type: "address",
    }, {
        internalType: "address",
        name: "creator",
        type: "address",
    }, {
        internalType: "bool",
        name: "resolved",
        type: "bool",
    }],
    stateMutability: "view",
    type: "function",
}, {
    inputs: [],
    name: "onChainMarket",
    outputs: [{
        internalType: "contract OnChainEventMarket",
        name: "",
        type: "address",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}, {
    inputs: [{
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
    }, {
        internalType: "bool",
        name: "result",
        type: "bool",
    }],
    name: "resolveMarket",
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
    stateMutability: "payable",
    type: "receive",
}] as const;
