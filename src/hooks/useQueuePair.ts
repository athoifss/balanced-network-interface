import { useEffect, useState } from 'react';

import { Pair } from '@balancednetwork/v1-sdk';
import { BalancedJs } from 'packages/BalancedJs';

import bnJs from 'bnJs';
import { SUPPORTED_TOKENS_MAP_BY_ADDRESS } from 'constants/tokens';
import { getQueuePair } from 'utils';

import useLastCount from './useLastCount';
import { PairState } from './useV2Pairs';

export function useQueuePair(): [PairState, Pair | null] {
  const [pair, setPair] = useState<[PairState, Pair | null]>([PairState.LOADING, null]);

  const ICX = SUPPORTED_TOKENS_MAP_BY_ADDRESS[bnJs.ICX.address].wrapped;
  const sICX = SUPPORTED_TOKENS_MAP_BY_ADDRESS[bnJs.sICX.address].wrapped;

  const last = useLastCount(10000);

  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const poolId = BalancedJs.utils.POOL_IDS.sICXICX;

        const stats = await bnJs.Dex.getPoolStats(poolId);

        const newPair = getQueuePair(stats, ICX, sICX);

        setPair(newPair);
      } catch (err) {
        setPair([PairState.INVALID, null]);
      }
    };
    fetchReserves();
  }, [last, ICX, sICX]);

  return pair;
}
