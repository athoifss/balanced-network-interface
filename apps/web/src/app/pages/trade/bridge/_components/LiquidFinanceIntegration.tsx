import React from 'react';
import { Flex } from 'rebass/styled-components';
import styled from 'styled-components';
import { Typography } from 'app/theme';
import CurrencyLogo from 'app/components/CurrencyLogo';
import { useBridgeActionHandlers, useBridgeInfo } from 'store/bridge/hooks';
import { sARCH, useARCH } from 'app/_xcall/archway/tokens';
import { XChainId } from 'app/_xcall/types';
import { CurrencyAmount, Token } from '@balancednetwork/sdk-core';
import { useArchwayContext } from 'app/_xcall/archway/ArchwayProvider';
import { archway } from 'app/_xcall/archway/config1';

import { keepPreviousData, useQuery, UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { getArchwayCounterToken } from 'app/_xcall/utils';

const WithdrawOption = styled.button<{ active: boolean }>`
  text-align: center;
  padding: 10px 20px;
  border-radius: 10px;
  border: 0;
  outline: none;
  cursor: pointer;
  margin: 15px 15px 0;
  transition: all 0.2s ease;

  ${({ theme }) => `color: ${theme.colors.text}`};
  ${({ theme, active }) => `background-color: ${active ? theme.colors.bg3 : 'transparent'}`};

  &:hover {
    ${({ theme }) => `background-color: ${theme.colors.bg3}`};
  }

  img {
    margin-bottom: 5px;
  }
`;

export function useWithdrawableNativeAmount(
  chain: XChainId,
  currencyAmount?: CurrencyAmount<Token>,
): UseQueryResult<
  | {
      amount: BigNumber;
      fee: BigNumber;
      symbol: string;
    }
  | undefined
> {
  const { client } = useArchwayContext();
  const { isLiquidsARCH } = useBridgeInfo();

  return useQuery({
    queryKey: ['withdrawableNativeAmount', currencyAmount, chain],
    queryFn: async () => {
      if (!currencyAmount || !client || chain !== 'archway-1' || !isLiquidsARCH) return;

      const sARCHOnArchway = getArchwayCounterToken('sARCH');
      if (sARCHOnArchway?.address) {
        const response = await client!.queryContractSmart(archway.contracts.liquidSwap!, {
          simulation: {
            offer_asset: {
              amount: currencyAmount?.numerator.toString(),
              info: {
                token: {
                  contract_addr: sARCHOnArchway?.address,
                },
              },
            },
          },
        });

        return {
          amount: new BigNumber(response.return_amount).div(10 ** currencyAmount!.currency.decimals),
          fee: new BigNumber(response.commission_amount).div(10 ** currencyAmount!.currency.decimals),
          symbol: 'ARCH',
        };
      }
    },
    placeholderData: keepPreviousData,
    refetchInterval: 2000,
    enabled: !!currencyAmount && !!client && chain === 'archway-1' && isLiquidsARCH,
  });
}

export default function LiquidFinanceIntegration() {
  const {
    currency: currencyToBridge,
    currencyAmountToBridge,
    bridgeDirection,
    isLiquidFinanceEnabled,
    isLiquidsARCH,
  } = useBridgeInfo();
  const { onSelectLiquidFinance } = useBridgeActionHandlers();

  const { data: withdrawableNativeAmount } = useWithdrawableNativeAmount(bridgeDirection.to, currencyAmountToBridge);
  const ARCH = useARCH();

  return (
    isLiquidsARCH && (
      <>
        <Typography textAlign="center" mb="2px" mt={3}>
          {`Choose what to do with your ${currencyToBridge?.symbol}:`}
        </Typography>
        <Flex justifyContent="space-around">
          <WithdrawOption
            active={isLiquidFinanceEnabled !== undefined && isLiquidFinanceEnabled}
            onClick={() => onSelectLiquidFinance(true)}
          >
            {currencyToBridge?.symbol === 'sARCH' && <CurrencyLogo currency={ARCH} />}
            <Typography fontWeight="bold" mb={1}>
              Unstake
            </Typography>
            <Typography>
              {`${withdrawableNativeAmount?.amount.toFormat(2, { groupSeparator: ',', decimalSeparator: '.' })} ${
                withdrawableNativeAmount?.symbol
              }`}{' '}
            </Typography>
          </WithdrawOption>

          <WithdrawOption
            active={isLiquidFinanceEnabled !== undefined && !isLiquidFinanceEnabled}
            onClick={() => onSelectLiquidFinance(false)}
          >
            <CurrencyLogo currency={currencyToBridge} />
            <Typography fontWeight="bold" mb={1}>
              Keep {currencyToBridge?.symbol}
            </Typography>
            <Typography>
              {`${currencyAmountToBridge?.toFixed(2, { groupSeparator: ',', decimalSeparator: '.' })} ${
                currencyAmountToBridge?.currency.symbol
              }`}{' '}
            </Typography>
          </WithdrawOption>
        </Flex>
      </>
    )
  );
}
