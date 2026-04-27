/**
 * Actions barrel — every high-level verb the templates need.
 */
export {
    createMarket,
    createBinaryNumberMarket,
    createBinaryStringMarket,
    getCreateMarketCost,
    ResultType,
    type CreateMarketOptions,
    type CreateMarketResult,
    type MultiOutcomeParams,
    type OptionCondition,
    type OptionInput,
} from "./createMarket.js";
export {
    buyNo,
    buyYes,
    sellNo,
    sellYes,
    type BuyParams,
    type SellParams,
    type TradeResult,
    type TradeSharedOptions,
} from "./trade.js";
export {
    waitForResolution,
    findMarketResolvedInLogs,
    type ResolutionObserved,
    type WaitForResolutionOptions,
} from "./resolve.js";
export { claim, type ClaimParams, type ClaimResult } from "./claim.js";
export {
    getMarket,
    getMarketStatus,
    getPrice,
    getUserPosition,
    marketStatusLabel,
    outcomeLabel,
    quoteBuy,
    quoteSell,
} from "./reads.js";
