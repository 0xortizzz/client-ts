import Client, {
  HTTPTransport,
  RequestManager,
  WebSocketTransport,
} from "@open-rpc/client-js";
import {
  Config,
  EngineCancelOrder,
  EngineMarketState,
  EngineMarketConfig,
  EngineOpenOrder,
  EnginePlaceOrder,
  EngineOrderbook,
  EngineMarketPrice,
  EngineAccount,
  AddTradingKey,
} from "./types";
import { type Address, Hash, type LocalAccount, parseUnits } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { encodeExpiration } from "./utils";
import { DECIMALS } from "@foundation-network/core/src";

export const EIP712_DOMAIN = {
  name: "FOUNDATION",
  chainId: 1,
  version: "0.1.0",
} as const;
export const TESTNET_RPC_URL =
  "https://testnet-rpc.foundation.network/perpetual";

export class FoundationPerpEngine {
  private client: Client;
  private config: Config | undefined;

  constructor(rpc: string) {
    const transport = rpc.startsWith("ws")
      ? new WebSocketTransport(rpc)
      : new HTTPTransport(rpc);

    this.client = new Client(new RequestManager([transport]));
  }

  async getUserNonce(address: Address): Promise<number> {
    return this.client.request({
      method: "core_get_user_nonce",
      params: [address],
    });
  }

  async addTradingKey(params: AddTradingKey, signature: Hash): Promise<void> {
    await this.client.request({
      method: "ob_add_trading_key",
      params: [
        {
          account_id: params.accountId,
          signer: params.signer,
        },
        params.nonce,
        signature,
      ],
    });
  }

  async getTradingKey(accountId: Hash): Promise<Address | null> {
    return this.client.request({
      method: "ob_get_trading_key",
      params: [accountId],
    });
  }

  async placeOrder(params: EnginePlaceOrder, signature: Hash): Promise<number> {
    return this.client.request({
      method: "ob_place_limit",
      params: [params, signature],
    });
  }

  async cancelOrder(
    params: EngineCancelOrder,
    signature: Hash,
  ): Promise<number> {
    return this.client.request({
      method: "ob_cancel",
      params: [params, signature],
    });
  }

  async getOpenOrderById(
    marketId: number,
    orderId: number,
  ): Promise<EngineOpenOrder | null> {
    return this.client.request({
      method: "ob_query_order",
      params: [marketId, orderId],
    });
  }

  async getOpenOrdersByAccount(
    marketId: number,
    accountId: Hash,
  ): Promise<EngineOpenOrder[]> {
    return this.client.request({
      method: "ob_query_user_orders",
      params: [marketId, accountId],
    });
  }

  async getAccount(accountId: Hash): Promise<EngineAccount> {
    return this.client.request({
      method: "core_query_account",
      params: [accountId],
    });
  }

  async getMarketConfigs(): Promise<EngineMarketConfig[]> {
    return this.client.request({
      method: "ob_query_open_markets",
      params: [],
    });
  }

  async getMarketStates(): Promise<EngineMarketState[]> {
    return this.client.request({
      method: "ob_query_markets_state",
      params: [],
    });
  }

  async getMarketPrice(marketId: number): Promise<EngineMarketPrice> {
    return this.client.request({
      method: "core_query_price",
      params: [marketId],
    });
  }

  async getOrderbook(
    marketId: number,
    take: number,
  ): Promise<EngineOrderbook | null> {
    return this.client.request({
      method: "ob_query_depth",
      params: [marketId, take],
    });
  }

  async updateConfig(): Promise<void> {
    this.config = await this.client.request({
      method: "core_get_config",
      params: [],
    });
  }

  async signPlaceOrder(
    signer: LocalAccount | SmartAccount,
    params: EnginePlaceOrder,
    verifyingAddr?: Address,
  ): Promise<Hash> {
    const verifyingContract: Address =
      verifyingAddr || (await this.getConfig()).addresses.offchain_book;

    return signer.signTypedData({
      domain: {
        ...EIP712_DOMAIN,
        verifyingContract,
      },
      types: {
        Order: [
          { name: "subaccount", type: "bytes32" },
          { name: "market", type: "uint64" },
          { name: "price", type: "int128" },
          { name: "amount", type: "int128" },
          { name: "nonce", type: "uint64" },
          { name: "expiration", type: "uint64" },
          { name: "triggerCondition", type: "uint128" },
        ],
      },
      primaryType: "Order",
      message: {
        subaccount: params.account_id,
        market: BigInt(params.market_id),
        price: parseUnits(params.price, DECIMALS),
        amount: parseUnits(
          params.side === "bid" ? params.amount : `-${params.amount}`,
          DECIMALS,
        ),
        nonce: BigInt(params.nonce),
        expiration: encodeExpiration(params),
        triggerCondition: 0n,
      },
    });
  }

  async signCancelOrder(
    signer: LocalAccount | SmartAccount,
    params: EngineCancelOrder,
    verifyingAddr?: Address,
  ): Promise<Hash> {
    const verifyingContract: Address =
      verifyingAddr || (await this.getConfig()).addresses.offchain_book;

    return signer.signTypedData({
      domain: {
        ...EIP712_DOMAIN,
        verifyingContract,
      },
      types: {
        Cancel: [
          { name: "subaccount", type: "bytes32" },
          { name: "market", type: "uint64" },
          { name: "nonce", type: "uint64" },
          { name: "orderId", type: "uint64" },
        ],
      },
      primaryType: "Cancel",
      message: {
        subaccount: params.account_id,
        market: BigInt(params.market_id),
        nonce: BigInt(params.nonce),
        orderId: BigInt(params.order_id),
      },
    });
  }

  async signAddTradingKey(
    signer: LocalAccount | SmartAccount,
    params: AddTradingKey,
    verifyingAddr?: Address,
  ): Promise<Hash> {
    const verifyingContract: Address =
      verifyingAddr || (await this.getConfig()).addresses.endpoint;

    return signer.signTypedData({
      domain: {
        ...EIP712_DOMAIN,
        verifyingContract,
      },
      types: {
        LinkSigner: [
          { name: "sender", type: "bytes32" },
          { name: "signer", type: "address" },
          { name: "nonce", type: "uint64" },
        ],
      },
      primaryType: "LinkSigner",
      message: {
        sender: params.accountId,
        signer: params.signer,
        nonce: BigInt(params.nonce),
      },
    });
  }

  async getConfig(): Promise<Config> {
    if (!this.config) {
      await this.updateConfig();
    }

    return this.config as Config;
  }
}
