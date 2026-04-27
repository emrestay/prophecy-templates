// Auto-generated from UpgradeV50Module#MultiOutcomeMarketImpl.json
// Source: references/prophecy-protocol-contracts/ignition/deployments/somnia-testnet-staging/artifacts/UpgradeV50Module#MultiOutcomeMarketImpl.json

export const MultiOutcomeAIResolutionMarketABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "target",
                "type": "address"
            }
        ],
        "name": "AddressEmptyCode",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "AgentPlatformOnly",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "AlreadyResolved",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "implementation",
                "type": "address"
            }
        ],
        "name": "ERC1967InvalidImplementation",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ERC1967NonPayable",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "EmptyUrl",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "FailedCall",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "FeeNotDeposited",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "IncorrectMsgValue",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidAgreement",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidInitialization",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidOptionConditions",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidWindow",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NoOptions",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotInitializing",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "OnlyReactivityPrecompile",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PermitExpired",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ResolutionInFlight",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ResolutionWindowClosed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UUPSUnauthorizedCallContext",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "slot",
                "type": "bytes32"
            }
        ],
        "name": "UUPSUnsupportedProxiableUUID",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnknownEvent",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receiptId",
                "type": "uint256"
            }
        ],
        "name": "EventNameGenCallbackReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "generatedName",
                "type": "string"
            }
        ],
        "name": "EventNameGenCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "reason",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            }
        ],
        "name": "EventNameGenFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            }
        ],
        "name": "EventNameGenRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint64",
                "name": "version",
                "type": "uint64"
            }
        ],
        "name": "Initialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receiptId",
                "type": "uint256"
            }
        ],
        "name": "LLMHandleResponse",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "marketIds",
                "type": "uint256[]"
            }
        ],
        "name": "MultiOutcomeEventCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            }
        ],
        "name": "MultiOutcomeLLMRequestDispatched",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receiptId",
                "type": "uint256"
            }
        ],
        "name": "MultiOutcomeLLMResponseFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receiptId",
                "type": "uint256"
            }
        ],
        "name": "MultiOutcomeResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "result",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "receiptId",
                "type": "uint256"
            }
        ],
        "name": "MultiOutcomeStringResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "scheduleTimestampMs",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "subscriptionId",
                "type": "uint256"
            }
        ],
        "name": "ResolutionScheduleCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "implementation",
                "type": "address"
            }
        ],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "AGENT_DEPOSIT_MULTIPLIER",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_OPTIONS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_SOURCES",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "NAME_GEN_DEPOSIT_MULTIPLIER",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "SUBSCRIPTION_FUNDING",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "UPGRADE_INTERFACE_VERSION",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "agentPlatform",
        "outputs": [
            {
                "internalType": "contract IHttpSingletonSomniaAgents",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "eventName",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "prompt",
                        "type": "string"
                    },
                    {
                        "internalType": "string[]",
                        "name": "urls",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minAgreement",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "resolveUrl",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint8",
                        "name": "numSources",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum IMultiOutcomeAIResolutionMarket.ResultType",
                        "name": "resultType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string[]",
                        "name": "stringOptions",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "venueId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "venueSignature",
                        "type": "bytes"
                    },
                    {
                        "internalType": "address",
                        "name": "stakeToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "tradingStartTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "tradingEndTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "resolutionStartTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "resolutionEndTs",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IMultiOutcomeAIResolutionMarket.MultiOutcomeParams",
                "name": "p",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "components": [
                            {
                                "internalType": "string",
                                "name": "operatorStr",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "numValue",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "strValue",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct IMultiOutcomeAIResolutionMarket.OptionCondition[]",
                        "name": "conditions",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "initialLiquidityBase",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IMultiOutcomeAIResolutionMarket.OptionInput[]",
                "name": "options",
                "type": "tuple[]"
            }
        ],
        "name": "createMultiOutcomeMarket",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "marketIds",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "eventToScheduleSubId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "extractAgentId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "initialLiquidityBases",
                "type": "uint256[]"
            },
            {
                "internalType": "address",
                "name": "stakeToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "urlCount",
                "type": "uint256"
            }
        ],
        "name": "getCreateMarketCost",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalCost",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "getEventDefinition",
        "outputs": [
            {
                "internalType": "string",
                "name": "prompt",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "urls",
                "type": "string[]"
            },
            {
                "internalType": "uint256",
                "name": "minAgreement",
                "type": "uint256"
            },
            {
                "internalType": "enum IMultiOutcomeAIResolutionMarket.ResultType",
                "name": "resultType",
                "type": "uint8"
            },
            {
                "internalType": "string[]",
                "name": "stringOptions",
                "type": "string[]"
            },
            {
                "internalType": "bool",
                "name": "resolveUrl",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "numSources",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "getEventMarketIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "getEventResolutionProgress",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalSources",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pendingResponses",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "getEventUrls",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getNameGenDeposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "validator",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "result",
                        "type": "bytes"
                    },
                    {
                        "internalType": "enum ResponseStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "receipt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "executionCost",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentResponse[]",
                "name": "responses",
                "type": "tuple[]"
            },
            {
                "internalType": "enum ResponseStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "requester",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "callbackAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes4",
                        "name": "callbackSelector",
                        "type": "bytes4"
                    },
                    {
                        "internalType": "address[]",
                        "name": "subcommittee",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "validator",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes",
                                "name": "result",
                                "type": "bytes"
                            },
                            {
                                "internalType": "enum ResponseStatus",
                                "name": "status",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "receipt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "executionCost",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct AgentResponse[]",
                        "name": "responses",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "responseCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "failureCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "threshold",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum ResponseStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum ConsensusType",
                        "name": "consensusType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "remainingBudget",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentRequest",
                "name": "",
                "type": "tuple"
            }
        ],
        "name": "handleEventNameResponse",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "validator",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "result",
                        "type": "bytes"
                    },
                    {
                        "internalType": "enum ResponseStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "receipt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "executionCost",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentResponse[]",
                "name": "responses",
                "type": "tuple[]"
            },
            {
                "internalType": "enum ResponseStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "requester",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "callbackAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes4",
                        "name": "callbackSelector",
                        "type": "bytes4"
                    },
                    {
                        "internalType": "address[]",
                        "name": "subcommittee",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "validator",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes",
                                "name": "result",
                                "type": "bytes"
                            },
                            {
                                "internalType": "enum ResponseStatus",
                                "name": "status",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "receipt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "executionCost",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct AgentResponse[]",
                        "name": "responses",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "responseCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "failureCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "threshold",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum ResponseStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum ConsensusType",
                        "name": "consensusType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "remainingBudget",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AgentRequest",
                "name": "",
                "type": "tuple"
            }
        ],
        "name": "handleResponse",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract OnChainEventMarket",
                "name": "_onChainMarket",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_agentPlatform",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_extractAgentId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_inferAgentId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nameAgentPlatform",
        "outputs": [
            {
                "internalType": "contract IHttpSingletonSomniaAgents",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nameGenAgentId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nameGenPrompt",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "onChainMarket",
        "outputs": [
            {
                "internalType": "contract OnChainEventMarket",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "emitter",
                "type": "address"
            },
            {
                "internalType": "bytes32[]",
                "name": "eventTopics",
                "type": "bytes32[]"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "onEvent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proxiableUUID",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reactivityPrecompile",
        "outputs": [
            {
                "internalType": "contract ISomniaReactivityPrecompile",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "requestToEvent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_agentPlatform",
                "type": "address"
            }
        ],
        "name": "setAgentPlatform",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_extractAgentId",
                "type": "uint256"
            }
        ],
        "name": "setExtractAgentId",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_platform",
                "type": "address"
            }
        ],
        "name": "setNameAgentPlatform",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_nameGenAgentId",
                "type": "uint256"
            }
        ],
        "name": "setNameGenAgentId",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_prompt",
                "type": "string"
            }
        ],
        "name": "setNameGenPrompt",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "triggerResolution",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "eventId",
                "type": "uint256"
            }
        ],
        "name": "triggerResolutionScheduled",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "upgradeToAndCall",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const;
