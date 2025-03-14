import { useXService } from '@/hooks';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import {
  Address,
  Contract,
  Memo,
  MemoType,
  Networks,
  Operation,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  rpc,
  scValToBigInt,
  xdr,
} from '@stellar/stellar-sdk';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import CustomSorobanServer from './CustomSorobanServer';
import { StellarXService } from './StellarXService';

export const STELLAR_RLP_MSG_TYPE = { type: 'symbol' };

export const STELLAR_RLP_DATA_TYPE = {
  type: {
    data: ['symbol', null],
  },
};

export const STELLAR_RLP_ENVELOPE_TYPE = {
  type: {
    destinations: ['symbol', null],
    sources: ['symbol', null],
    message: ['symbol', null],
  },
};

export const XLM_CONTRACT_ADDRESS = 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA';

// Can be used whenever you need an Address argument for a contract method
export const accountToScVal = (account: string) => new Address(account).toScVal();

export const simulateTx = async (
  tx: Transaction<Memo<MemoType>, Operation[]>,
  server: CustomSorobanServer,
): Promise<any> => {
  const response = await server.simulateTransaction(tx);

  if (response !== undefined) {
    return response;
  }

  throw new Error('cannot simulate transaction');
};

// Get the tokens balance
export const getTokenBalance = async (
  address: string,
  tokenId: string,
  txBuilder: TransactionBuilder,
  server: CustomSorobanServer,
) => {
  const params = [accountToScVal(address)];
  const contract = new Contract(tokenId);
  const tx = txBuilder
    .addOperation(contract.call('balance', ...params))
    .setTimeout(TimeoutInfinite)
    .build();

  const result = await simulateTx(tx, server);

  return scValToBigInt(xdr.ScVal.fromXDR(result.results[0].xdr, 'base64'));
};

export async function sendTX(
  contractAddress: string,
  contractMethod: string,
  params: xdr.ScVal[],
  txBuilder: TransactionBuilder,
  server: CustomSorobanServer,
  kit: StellarWalletsKit,
): Promise<string> {
  const contract = new Contract(contractAddress);
  const simulateTx = txBuilder
    .addOperation(contract.call(contractMethod, ...params))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(simulateTx);
  const tx = rpc.assembleTransaction(simulateTx, simResult).build();

  if (tx) {
    const { signedTxXdr } = await kit.signTransaction(tx.toXDR());
    const txToSubmit = TransactionBuilder.fromXDR(signedTxXdr, Networks.PUBLIC);
    const { hash } = await server.sendTransaction(txToSubmit);
    return hash;
  } else {
    throw new Error('Failed to send stellar transaction');
  }
}

export const isStellarAddress = (address: string) => {
  try {
    new Address(address);
    return true;
  } catch (e) {
    return false;
  }
};

export type StellarAccountValidation = { ok: true } | { ok: false; error: string };

export function useValidateStellarAccount(address?: string | null): UseQueryResult<StellarAccountValidation> {
  const stellarService = useXService('STELLAR') as StellarXService;
  const [verifiedAddresses, setVerifiedAddresses] = useState<{ [key: string]: boolean }>({});

  return useQuery({
    queryKey: [`stellarAccountValidation`, stellarService, address],
    queryFn: async () => {
      if (typeof address !== 'string') {
        return { ok: true };
      }

      try {
        await stellarService.server.loadAccount(address);
        setVerifiedAddresses(prev => ({ ...prev, [address]: true }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: `Stellar wallet inactive. Add at least 1 XLM from an external source` };
      }
    },
    enabled: typeof address === 'string' && !verifiedAddresses[address],
    refetchInterval: 5000,
  });
}
