import { Typography } from '@/app/theme';
import { useOraclePrices } from '@/store/oracle/hooks';
import { toFraction } from '@/utils';
import { formatPrice } from '@/utils/formatter';
import { Token } from '@balancednetwork/sdk-core';
import { Position, XChainId } from '@balancednetwork/xwagmi';
import React from 'react';
import CurrencyLogo from '../CurrencyLogo';
import { AssetSymbol, BalanceAndValueWrap, BalanceBreakdown, DataText, ListItem } from '../Wallet/styledComponents';
import { StyledListItem } from './MultiChainItem';
import SingleChainItemOverview from './SingleChainItemOverview';

type MultiChainItemOverviewProps = {
  baseToken: Token;
  chains: Partial<{ [key in XChainId]: Position | {} }>;
  total: Position;
  onSelect: (symbol: string, chainId?: XChainId) => void;
};

const MultiChainItemOverview = ({ baseToken, chains, onSelect, total }: MultiChainItemOverviewProps) => {
  const { symbol } = baseToken;
  const prices = useOraclePrices();
  const arrowRef = React.useRef<HTMLElement>(null);
  const { collateral, loan } = total;

  const price = React.useMemo(() => {
    if (!prices || (symbol && !prices[symbol])) return;
    return toFraction(prices[symbol!]);
  }, [prices, symbol]);

  const sortedEntries = React.useMemo(() => {
    return Object.entries(chains || {}).sort(([, chainA], [, chainB]) => {
      if ('collateral' in chainA && 'collateral' in chainB && chainA.collateral && chainB.collateral) {
        return chainB.collateral.lessThan(chainA.collateral) ? -1 : 1;
      }
      return chainA ? -1 : 1;
    });
  }, [chains]);

  return (
    <>
      <StyledListItem $border={false} onClick={() => onSelect(baseToken.symbol)}>
        <AssetSymbol>
          <CurrencyLogo currency={baseToken} />
          <Typography fontSize={16} fontWeight="bold">
            <span ref={arrowRef} style={{ display: 'inline-block' }}>
              {symbol}
            </span>
          </Typography>
        </AssetSymbol>
        <BalanceAndValueWrap>
          {collateral && collateral.greaterThan(0) && (
            <DataText as="div">
              {price && '$'}
              {/* {collateral
                ?.multiply(price || 1)
                .toFixed(price ? 0 : HIGH_PRICE_ASSET_DP[baseToken.address] || 2, { groupSeparator: ',' })} */}
              {formatPrice(collateral?.multiply(price || 1).toFixed())}
            </DataText>
          )}

          <DataText>{!loan || loan.isEqualTo(0) ? '-' : `$${loan.toFormat(0)}`}</DataText>
        </BalanceAndValueWrap>
      </StyledListItem>
      <BalanceBreakdown
        $arrowPosition={arrowRef.current ? `${Math.floor(arrowRef.current.clientWidth / 2 + 23)}px` : '40px'}
      >
        {sortedEntries.map(([xChainId]) => (
          <SingleChainItemOverview
            key={xChainId}
            baseToken={baseToken}
            networkPosition={{ [xChainId]: {} }}
            onSelect={onSelect}
            isNested={true}
          />
        ))}
      </BalanceBreakdown>
    </>
  );
};

export default MultiChainItemOverview;
