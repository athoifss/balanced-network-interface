import React, { useMemo, useState } from 'react';

import { MetaToken } from '@/queries';
import { useAllTokensByAddress, useTokenTrendData } from '@/queries/backendv2';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass/styled-components';
import styled, { css } from 'styled-components';

import AssetManagerTokenBreakdown from '@/components/AssetManagerTokenBreakdown';
import Divider from '@/components/Divider';
import DropdownLink from '@/components/DropdownLink';
import { BoxPanel } from '@/components/Panel';
import QuestionHelper, { QuestionWrapper } from '@/components/QuestionHelper';
import SearchInput from '@/components/SearchInput';
import Skeleton from '@/components/Skeleton';
import Sparkline from '@/components/Sparkline';
import { CurrencyLogoFromURI } from '@/components/shared/CurrencyLogo';
import useSort from '@/hooks/useSort';
import useTimestampRounded from '@/hooks/useTimestampRounded';
import { LoaderComponent } from '@/pages/PerformanceDetails/utils';
import { useAssetManagerTokens } from '@/queries/assetManager';
import { Typography } from '@/theme';
import { formatPriceChange, getFormattedNumber } from '@/utils/formatter';
import { isMobile } from 'react-device-detect';

export const COMPACT_ITEM_COUNT = 8;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 840px;
  overflow: hidden;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 24fr 16fr 15fr 14fr 14fr;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 6fr 4fr 6fr 6fr 6fr;
  `}

  > * {
    justify-content: flex-end;
    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }
`;

const DataText = styled(Flex)`
  display: flex;
  font-size: 16px;
  color: #ffffff;
  align-items: center;
  line-height: 1.4;
`;

export const HeaderText = styled(Flex)<{ className?: string }>`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all ease 200ms;
  white-space: nowrap;

  &:before,
  &:after,
  span:after,
  span:before {
    content: '';
    position: absolute;
    width: 8px;
    height: 2px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.primary};
    display: inline-block;
    top: 50%;
    transition: all ease 200ms;
    right: 0;
    transform-origin: center;
    opacity: 0;
    transform: rotate(0) translate3d(0, 0, 0);
  }

  ${props =>
    props.className === 'ASC' &&
    css`
      padding-right: 15px;
      padding-left: 0;
      &:before,
      &:after,
      span:after,
      span:before {
        opacity: 1;
      }

      &:before,
      span:before {
        transform: rotate(-45deg) translate3d(-2px, -3px, 0);
      }

      &:after,
      span:after {
        transform: rotate(45deg) translate3d(0px, -1px, 0);
      }
    `};

  ${props =>
    props.className === 'DESC' &&
    css`
      padding-right: 15px;
      &:before,
      &:after,
      span:after,
      span:before {
        opacity: 1;
      }

      &:before,
      span:before {
        transform: rotate(45deg) translate3d(-3px, 2px, 0);
      }

      &:after,
      span:after {
        transform: rotate(-45deg) translate3d(1px, 0, 0);
      }
    `};

  &:first-of-type {
    padding-left: 0;
    &::before,
    &::after {
      display: none;
    }

    span {
      position: relative;

      &::before,
      &:after {
        margin-right: -15px;
      }
    }
  }
`;

export const StyledSkeleton = styled(Skeleton)`
  background-color: rgba(44, 169, 183, 0.2) !important;
`;

const SkeletonTokenPlaceholder = () => {
  return (
    <DashGrid my={4}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <StyledSkeleton variant="circle" width={40} height={40} />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <StyledSkeleton width={130} />
            <StyledSkeleton width={70} />
          </Box>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column">
          <Typography variant="p">
            <StyledSkeleton width={80} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={80} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">
            <StyledSkeleton width={120} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={160} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <StyledSkeleton width={110} />
      </DataText>
      <DataText>
        <StyledSkeleton width={90} />
      </DataText>
    </DashGrid>
  );
};

type TokenItemProps = {
  token: MetaToken;
  isLast: boolean;
};

const TokenItem = ({ token, isLast }: TokenItemProps) => {
  const tsStart = useTimestampRounded(1000 * 60, 7);
  const tsEnd = useTimestampRounded(1000 * 60);
  const start = Math.floor(tsStart / 1000);
  const end = Math.floor(tsEnd / 1000);
  const { data: trendData } = useTokenTrendData(token.symbol, start, end);
  const { data: assetManagerTokensBreakdown } = useAssetManagerTokens();
  const tokenBreakdown = assetManagerTokensBreakdown && assetManagerTokensBreakdown[token.address];

  return (
    <>
      <DashGrid my={4}>
        <DataText>
          <Flex alignItems="center">
            <Box sx={{ minWidth: '50px' }}>
              <CurrencyLogoFromURI address={token.address} size="40px" />
            </Box>
            <Box ml={2} sx={{ minWidth: '160px' }}>
              <Flex>
                <Text>{token.name.replace(' TOKEN', ' Token')}</Text>
              </Flex>
              <Text color="text1">{token.symbol}</Text>
            </Box>
          </Flex>
        </DataText>
        <DataText>
          <Flex alignItems="flex-end" flexDirection="column">
            <Typography variant="p">{getFormattedNumber(token.price, 'price')}</Typography>
            <Typography variant="p" color={token.price >= token.price_24h ? 'primary' : 'alert'}>
              {formatPriceChange(token.price_24h_change)}
            </Typography>
          </Flex>
        </DataText>
        <DataText>
          <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
            <Typography variant="p">{getFormattedNumber(token.market_cap, 'currency0')}</Typography>
            <Flex>
              {!isMobile && tokenBreakdown && tokenBreakdown.length > 1 && (
                <Box mr={1}>
                  <AssetManagerTokenBreakdown breakdown={tokenBreakdown} spacing={{ x: 0, y: 1 }} />
                </Box>
              )}
              <Typography variant="p" color="text1">
                {getFormattedNumber(token.total_supply, token.price > 1000 ? 'number2' : 'number')} {token.symbol}
              </Typography>
            </Flex>
          </Flex>
        </DataText>
        <Flex alignItems="flex-end" flexDirection="column" pl={2}>
          <Typography variant="p">{`$${getFormattedNumber(token.liquidity, 'number')}`}</Typography>
          {token.price > 0 && (
            <Typography variant="p" color="text1">
              {getFormattedNumber(token.liquidity / token.price, token.price > 1000 ? 'number2' : 'number')}{' '}
              {token.symbol}
            </Typography>
          )}
        </Flex>
        <DataText>{trendData ? <Sparkline data={trendData} /> : <LoaderComponent />}</DataText>
      </DashGrid>
      {!isLast && <Divider />}
    </>
  );
};

export default React.memo(function TokenSection() {
  const { data: allTokens } = useAllTokensByAddress();
  const { sortBy, handleSortSelect, sortData } = useSort({ key: 'market_cap', order: 'DESC' });
  const [showingExpanded, setShowingExpanded] = useState(false);
  const [searched, setSearched] = useState('');

  const tokens = useMemo(() => {
    if (!allTokens) return [];
    const filteredTokens = Object.values(allTokens).filter(token => {
      const tokenName = token.name.toLowerCase();
      const tokenSymbol = token.symbol.toLowerCase();
      const search = searched.toLowerCase();
      return tokenName.includes(search) || tokenSymbol.includes(search);
    });
    return sortData(filteredTokens);
  }, [allTokens, searched, sortData]);

  const noTokensFound = searched && tokens.length === 0;
  const isSmallScreen = useMedia('(max-width: 800px)');

  return (
    <BoxPanel bg="bg2" id="tokens">
      <Flex justifyContent="space-between" flexWrap="wrap">
        <Typography variant="h2" mb={5} mr="20px">
          Tokens
        </Typography>
        <Box width={isSmallScreen ? '100%' : '295px'} mb={isSmallScreen ? '25px' : 0}>
          <SearchInput value={searched} onChange={e => setSearched(e.target.value)} />
        </Box>
      </Flex>
      <Box overflow="auto">
        <List>
          {!noTokensFound && (
            <DashGrid>
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
              <Flex>
                {!isMobile && (
                  <QuestionWrapper style={{ transform: 'translate3d(-5px, 1px, 0)' }}>
                    <QuestionHelper
                      width={280}
                      text={
                        <>
                          <Typography color="text1">
                            Based on the amount of tokens that have interacted with Balanced and/or the ICON blockchain.
                          </Typography>
                          <Typography color="text1" mt={2}>
                            It does not reflect the total market cap for multi-chain assets.
                          </Typography>
                        </>
                      }
                    />
                  </QuestionWrapper>
                )}

                <HeaderText
                  role="button"
                  className={sortBy.key === 'market_cap' ? sortBy.order : ''}
                  onClick={() =>
                    handleSortSelect({
                      key: 'market_cap',
                    })
                  }
                >
                  MARKET CAP
                </HeaderText>
              </Flex>
              <HeaderText
                role="button"
                className={sortBy.key === 'liquidity' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'liquidity',
                  })
                }
              >
                Available
              </HeaderText>
              <HeaderText
                style={{ cursor: 'default' }}
                // role="button"
                // className={sortBy.key === 'holders' ? sortBy.order : ''}
                // onClick={() =>
                //   handleSortSelect({
                //     key: 'holders',
                //   })
                // }
              >
                7d trend
              </HeaderText>
            </DashGrid>
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
                  Couldn't find any listings for <strong>{searched}</strong>.
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
    </BoxPanel>
  );
});
