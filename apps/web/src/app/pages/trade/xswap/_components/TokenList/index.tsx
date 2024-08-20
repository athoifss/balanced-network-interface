import { BoxPanel } from '@/app/components/Panel';
import { Typography } from '@/app/theme';
import React from 'react';
import { Trans } from '@lingui/macro';
import { Box, Flex } from 'rebass';
import styled, { css, useTheme } from 'styled-components';
import { useMedia } from 'react-use';
import SearchInput from '@/app/components/SearchModal/SearchInput';
import { TokenStats, useAllTokensByAddress } from '@/queries/backendv2';
import { HeaderText } from '@/app/pages/trade/supply/_components/AllPoolsPanel';
import useSort from '@/hooks/useSort';
import TokenItem from './TokenItem';
import Divider from '@/app/components/Divider';
import SkeletonTokenPlaceholder from './SkeletonTokenPlaceholder';
import DropdownLink from '@/app/components/DropdownLink';
import CommunityListToggle from '@/app/components/CommunityListToggle';
import { useTokenListConfig } from '@/store/lists/hooks';

const COMPACT_ITEM_COUNT = 8;

const List = styled.div`
  -webkit-overflow-scrolling: touch;
  min-width: 840px;
  overflow: hidden;
`;

export const Grid = styled.div`
  display: grid;
  margin: 20px 0;
  gap: 1em;
  align-items: center;
  grid-template-columns: 6fr 6fr 9fr 5fr 7fr;
  ${({ theme }) => theme.mediaWidth.upLarge`
    grid-template-columns: 23fr 16fr 15fr 11fr 15fr;
  `}

  > *, ${HeaderText} {
      justify-content: flex-end;
      text-align: right;

      &:first-child {
        justify-content: flex-start;
        text-align: left;
      }
    }

  .recharts-wrapper {
    margin-left: auto;
  }
`;

const TokenList = () => {
  const { data: allTokens } = useAllTokensByAddress();
  const { sortBy, handleSortSelect, sortData } = useSort({ key: 'price_24h_change', order: 'DESC' });
  const [showingExpanded, setShowingExpanded] = React.useState(false);
  const theme = useTheme();
  const isSmallScreen = useMedia(`(minWidth: ${theme.mediaWidth.upSmall})`);
  const [query, setQuery] = React.useState('');
  const { community: isCommunityListEnabled } = useTokenListConfig();

  const tokens = React.useMemo(() => {
    if (!allTokens) return [];
    const filteredTokens = Object.values(allTokens).filter((token: TokenStats) => {
      const shouldShow = isCommunityListEnabled || token.type === 'balanced';
      const tokenName = token.name.toLowerCase();
      const tokenSymbol = token.symbol.toLowerCase();
      const search = query.toLowerCase();
      return shouldShow && (tokenName.includes(search) || tokenSymbol.includes(search));
    });
    return sortData(filteredTokens);
  }, [allTokens, query, sortData, isCommunityListEnabled]);

  const noTokensFound = query && tokens.length === 0;

  return (
    <BoxPanel bg="bg2" mt="50px">
      <Flex justifyContent="space-between" flexWrap="wrap" mb="25px">
        <Typography variant="h2" mr={2}>
          <Trans>Tokens</Trans>
        </Typography>
        <Box width={isSmallScreen ? '100%' : '295px'} mb={isSmallScreen ? '25px' : 0}>
          <SearchInput value={query} onChange={e => setQuery(e.target.value)} />
        </Box>
      </Flex>
      <Box overflow="auto">
        <List>
          {!noTokensFound && (
            <Grid>
              <HeaderText
                role="button"
                className={sortBy.key === 'name' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'name',
                  })
                }
              >
                <span>ASSET</span>
              </HeaderText>
              <HeaderText
                role="button"
                className={sortBy.key === 'price_24h_change' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'price_24h_change',
                  })
                }
              >
                PRICE (24H)
              </HeaderText>
              <HeaderText
                role="button"
                className={sortBy.key === 'market_cap' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'market_cap',
                  })
                }
              >
                MARKETCAP
              </HeaderText>
              <HeaderText
                role="button"
                className={sortBy.key === 'liquidity' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'liquidity',
                  })
                }
              >
                LIQUIDITY
              </HeaderText>
              <HeaderText style={{ cursor: 'default' }}>7d trend</HeaderText>
            </Grid>
          )}

          {tokens ? (
            <>
              {tokens.map((token, index, arr) =>
                showingExpanded || index < COMPACT_ITEM_COUNT ? (
                  <TokenItem
                    key={token.symbol}
                    token={token}
                    isLast={index === arr.length - 1 || (!showingExpanded && index === COMPACT_ITEM_COUNT - 1)}
                  />
                ) : null,
              )}
              {noTokensFound && (
                <Typography width="100%" paddingTop="30px" fontSize={16} color="text">
                  Couldn't find any listings for <strong>{query}</strong>.
                </Typography>
              )}
            </>
          ) : (
            <>
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
            </>
          )}
        </List>
      </Box>

      {tokens.length > COMPACT_ITEM_COUNT && (
        <Box pb="3px">
          <DropdownLink expanded={showingExpanded} setExpanded={setShowingExpanded} />
        </Box>
      )}

      <Flex paddingTop="13px" width="100%" justifyContent="center">
        <CommunityListToggle />
      </Flex>
    </BoxPanel>
  );
};

export default TokenList;
