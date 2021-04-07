import React, { useCallback, useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { BalancedJs } from 'packages/BalancedJs';
import { convertLoopToIcx } from 'packages/icon-react/utils';
import { useDispatch, useSelector } from 'react-redux';

import bnJs from 'bnJs';
import { useAllTransactions } from 'store/transactions/hooks';

import { AppState } from '..';
import { changeLiquiditySupply } from './actions';
import { LiquidityState } from './reducer';

// #redux-step-5: define function get value of variable from store
export function useLiquiditySupply(): AppState['liquidity'] {
  const liquidity = useSelector((state: AppState) => state.liquidity);
  return useMemo(() => liquidity, [liquidity]);
}

// #redux-step-6: define function working with variable on store
export function useChangeLiquiditySupply(): ({
  sICXPoolsICXbnUSDTotal,
  bnUSDPoolsICXbnUSDTotal,
  sICXbnUSDBalance,
  sICXbnUSDTotalSupply,

  BALNPoolBALNbnUSDTotal,
  bnUSDPoolBALNbnUSDTotal,
  BALNbnUSDBalance,
  BALNbnUSDTotalSupply,

  sICXSuppliedPoolsICXbnUSD,
  bnUSDSuppliedPoolsICXbnUSD,

  BALNSuppliedPoolBALNbnUSD,
  bnUSDSuppliedPoolBALNbnUSD,

  sICXICXTotalSupply,
  ICXBalance,
}: LiquidityState) => void {
  const dispatch = useDispatch();
  return useCallback(
    ({
      sICXPoolsICXbnUSDTotal,
      bnUSDPoolsICXbnUSDTotal,
      sICXbnUSDBalance,
      sICXbnUSDTotalSupply,

      BALNPoolBALNbnUSDTotal,
      bnUSDPoolBALNbnUSDTotal,
      BALNbnUSDBalance,
      BALNbnUSDTotalSupply,

      sICXSuppliedPoolsICXbnUSD,
      bnUSDSuppliedPoolsICXbnUSD,

      BALNSuppliedPoolBALNbnUSD,
      bnUSDSuppliedPoolBALNbnUSD,

      sICXICXTotalSupply,
      ICXBalance,
    }) => {
      dispatch(
        changeLiquiditySupply({
          sICXPoolsICXbnUSDTotal,
          bnUSDPoolsICXbnUSDTotal,
          sICXbnUSDBalance,
          sICXbnUSDTotalSupply,

          BALNPoolBALNbnUSDTotal,
          bnUSDPoolBALNbnUSDTotal,
          BALNbnUSDBalance,
          BALNbnUSDTotalSupply,

          sICXSuppliedPoolsICXbnUSD,
          bnUSDSuppliedPoolsICXbnUSD,

          BALNSuppliedPoolBALNbnUSD,
          bnUSDSuppliedPoolBALNbnUSD,

          sICXICXTotalSupply,
          ICXBalance,
        }),
      );
    },
    [dispatch],
  );
}

export function useFetchLiquidity(account?: string | null) {
  // eject this account and we don't need to account params for when call contract
  bnJs.eject({ account });
  const transactions = useAllTransactions();
  const changeLiquiditySupply = useChangeLiquiditySupply();

  const calculateTokenSupplied = (balance: BigNumber, poolSupply: BigNumber, poolTotal: BigNumber) => {
    let poolFraction = balance.dividedBy(poolSupply);
    let tokenSupplied = poolFraction.multipliedBy(poolTotal);
    if (tokenSupplied.isNaN()) tokenSupplied = new BigNumber(0);
    return tokenSupplied;
  };

  const fetchLiquidity = React.useCallback(() => {
    const getSuppliedToken = (poolId: number, baseAddress: string, quoteAddress: string) => {
      return new Promise((resolve, reject) => {
        Promise.all([
          bnJs.Dex.balanceOf(poolId),
          bnJs.Dex.totalSupply(poolId),
          bnJs.Dex.getPoolTotal(poolId, baseAddress),
          bnJs.Dex.getPoolTotal(poolId, quoteAddress),
        ])
          .then(result => {
            const [balance, poolTotalSupply, poolBaseTotal, poolQuoteTotal] = result.map(v =>
              convertLoopToIcx(v as BigNumber),
            );
            const baseTokenSupplied = calculateTokenSupplied(balance, poolTotalSupply, poolBaseTotal);
            const quoteTokenSupplied = calculateTokenSupplied(balance, poolTotalSupply, poolQuoteTotal);
            resolve({ balance, baseTokenSupplied, quoteTokenSupplied, poolBaseTotal, poolQuoteTotal, poolTotalSupply });
          })
          .catch(reject);
      });
    };

    if (account) {
      Promise.all([
        bnJs.Dex.totalSupply(BalancedJs.utils.sICXICXpoolId),
        bnJs.eject({ account: account }).Dex.getICXBalance(),
      ]).then(result => {
        const [sICXICXTotalSupply, ICXBalance] = result.map(v => convertLoopToIcx(v as BigNumber));

        changeLiquiditySupply({
          sICXICXTotalSupply,
          ICXBalance,
        });
      });

      getSuppliedToken(BalancedJs.utils.sICXbnUSDpoolId, bnJs.sICX.address, bnJs.bnUSD.address)
        .then((result: any) =>
          changeLiquiditySupply({
            sICXbnUSDBalance: result.balance,
            sICXSuppliedPoolsICXbnUSD: result.baseTokenSupplied,
            bnUSDSuppliedPoolsICXbnUSD: result.quoteTokenSupplied,
            sICXPoolsICXbnUSDTotal: result.poolBaseTotal,
            bnUSDPoolsICXbnUSDTotal: result.poolQuoteTotal,
            sICXbnUSDTotalSupply: result.poolTotalSupply,
          }),
        )
        .catch(e => console.error(e));

      getSuppliedToken(BalancedJs.utils.BALNbnUSDpoolId, bnJs.Baln.address, bnJs.bnUSD.address)
        .then((result: any) =>
          changeLiquiditySupply({
            BALNbnUSDBalance: result.balance,
            BALNSuppliedPoolBALNbnUSD: result.baseTokenSupplied,
            bnUSDSuppliedPoolBALNbnUSD: result.quoteTokenSupplied,
            BALNPoolBALNbnUSDTotal: result.poolBaseTotal,
            bnUSDPoolBALNbnUSDTotal: result.poolQuoteTotal,
            BALNbnUSDTotalSupply: result.poolTotalSupply,
          }),
        )
        .catch(e => console.error(e));
    }
  }, [account, changeLiquiditySupply]);

  React.useEffect(() => {
    fetchLiquidity();
  }, [fetchLiquidity, transactions, account]);
}
