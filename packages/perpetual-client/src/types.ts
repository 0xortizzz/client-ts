import { Address, Hash } from "viem";
import { OrderStatus, Side, TimeInForce } from "@foundation-network/core";
import { SelfTradeBehavior } from "@foundation-network/core/src";

export type AddressConfig = {
  endpoint: Address;
  cr_manager: Address;
  offchain_book: Address;
};

export type FeeTier = {
  maker_fee: string;
  taker_fee: string;
};

export type Config = {
  addresses: AddressConfig;
  system_fee_tiers: FeeTier[];
};

export type ClientPlaceOrder = {
  accountId: Hash;
  marketId: number;
  side: Side;
  price: string;
  amount: string;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  isMarketOrder?: boolean;
  selfTradeBehavior?: SelfTradeBehavior;
  nonce?: string;
  expiresAt?: number;
  verifyingAddr?: Address;
};

export type EnginePlaceOrder = {
  account_id: Hash;
  market_id: number;
  side: Side;
  price: string;
  amount: string;
  time_in_force: TimeInForce;
  reduce_only: boolean;
  is_market_order: boolean;
  self_trade_behavior: SelfTradeBehavior;
  nonce: string;
  expires_at?: number;
};

export type ClientCancelOrder = {
  accountId: Hash;
  marketId: number;
  orderId: string;
  nonce?: string;
  verifyingAddr?: Address;
};

export type EngineCancelOrder = {
  account_id: Hash;
  market_id: number;
  order_id: string;
  nonce: string;
};

export type AddTradingKey = {
  accountId: Hash;
  signer: Address;
  nonce: number;
};

export type OrderTag = "limit" | "market" | "stop_loss" | "take_profit";

export type OrderSource =
  | "Trade"
  | "Liquidate"
  | "InsuranceFundCover"
  | "Deleverage"
  | "Delist";

export type OrderExpiration = {
  time_in_force: TimeInForce;
  reduce_only: boolean;
  self_trade_behavior: SelfTradeBehavior;
  expires_at: number | null;
  is_market_order: boolean;
};

export type ClientOpenOrder = {
  orderId: number;
  accountId: Hash;
  marketId: number;
  side: Side;
  createTimestamp: number;
  amount: string;
  price: string;
  matchedQuoteAmount: string;
  matchedBaseAmount: string;
  quoteFee: string;
  nonce: number;
  expiration: OrderExpiration;
  isTriggered: boolean;
  hasDependency: boolean;
  tag: OrderTag;
};

export type EngineOpenOrder = {
  order_id: number;
  account_id: Hash;
  market_id: number;
  side: Side;
  create_timestamp: number;
  amount: string;
  price: string;
  status: OrderStatus;
  matched_quote_amount: string;
  matched_base_amount: string;
  quote_fee: string;
  nonce: number;
  expiration: OrderExpiration;
  is_triggered: boolean;
  signature: Hash;
  signer: Address;
  has_dependency: boolean;
  source: OrderSource;
  system_fee_tier: FeeTier;
  broker_fee_tier: FeeTier;
  tag: OrderTag;
};

export type ClientMarketConfig = {
  id: number;
  ticker: string;
  minVolume: string;
  tickSize: string;
  stepSize: string;
  initialMargin: string;
  maintenanceMargin: string;
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
  insuranceId: Hash | null;
  priceCap: string;
  priceFloor: string;
  availableFrom: number;
  unavailableAfter: number | null;
};

export type EngineMarketConfig = {
  id: number;
  ticker: string;
  min_volume: string;
  tick_size: string;
  step_size: string;
  initial_margin: string;
  maintenance_margin: string;
  is_open: boolean;
  next_open: number | null;
  next_close: number | null;
  insurance_id: Hash | null;
  price_cap: string;
  price_floor: string;
  available_from: number;
  unavailable_after: number | null;
  pyth_id: string;
};

export type ClientMarketState = {
  id: number;
  openInterest: string;
  cumulativeFunding: string;
  availableSettle: string;
  nextFundingRate: string;
};

export type EngineMarketState = {
  id: number;
  open_interest: string;
  cumulative_funding: string;
  available_settle: string;
  next_funding_rate: string;
  mark_price: string;
};

export type OrderbookItem = [
  price: string,
  amount: string,
  cumulativeAmount: string,
];

export type ClientOrderbook = {
  marketId: number;
  asks: OrderbookItem[];
  bids: OrderbookItem[];
};

export type EngineOrderbook = {
  market_id: number;
  asks: OrderbookItem[];
  bids: OrderbookItem[];
};

export type ClientMarketPrice = {
  indexPrice: string;
  markPrice: string;
  lastPrice: string | null;
};

export type EngineMarketPrice = {
  index_price: string;
  mark_price: string;
  last_price: string | null;
  index_price_time: number;
};

export type ClientPosition = {
  marketId: number;
  baseAmount: string;
  quoteAmount: string;
  lastCumulativeFunding: string;
  frozenInBidOrder: string;
  frozenInAskOrder: string;
  unsettledPnl: string;
};

export type EnginePosition = {
  base_amount: string;
  quote_amount: string;
  last_cumulative_funding: string;
  frozen_in_bid_order: string;
  frozen_in_ask_order: string;
  unsettled_pnl: string;
  is_settle_pending: string;
};

export type ClientAccount = {
  positions: ClientPosition[];
  collateral: string;
  isInLiquidationQueue: boolean;
};

export type EngineAccount = {
  positions: { [marketId: string]: EnginePosition };
  collateral: string;
  is_in_liquidation_queue: boolean;
};
