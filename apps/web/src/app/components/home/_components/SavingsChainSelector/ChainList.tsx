import React, { useState } from 'react';

import { Box, Flex } from 'rebass';

import { ChainLogo } from '@/app/components/ChainLogo';
import SearchInput from '@/app/components/SearchModal/SearchInput';
import { StyledHeaderText } from '@/app/pages/trade/bridge/_components/XChainList';
import { Typography } from '@/app/theme';
import useSortXPositions from '@/hooks/useSortXPositions';
import { useHasSignedIn, useSignedInWallets } from '@/hooks/useWallets';
import { useCollateralType } from '@/store/collateral/hooks';
import { xChains, XToken } from '@balancednetwork/xwagmi';
import { XChain, XChainId } from '@balancednetwork/xwagmi';
import { Trans, t } from '@lingui/macro';
import { isMobile } from 'react-device-detect';
import { useMedia } from 'react-use';
import { ChainItemWrap, Grid, ScrollHelper, SelectorWrap } from '../LoanChainSelector/styledComponents';
import { LPRewards } from '@/queries/reward';
import { CurrencyAmount } from '@balancednetwork/sdk-core';

type ChainListProps = {
  chainId: XChainId;
  setChainId: (chain: XChainId) => void;
  chains?: XChain[];
  width: number | undefined;
  lpRewards: LPRewards;
};

type ChainItemProps = {
  chain: XChain;
  isActive: boolean;
  isLast: boolean;
  setChainId: (chain: XChainId) => void;
  rewardAmount: CurrencyAmount<XToken> | undefined;
};

const ChainItem = ({ chain, setChainId, isLast, rewardAmount }: ChainItemProps) => {
  const signedInWallets = useSignedInWallets();
  const isSignedIn = signedInWallets.some(wallet => wallet.xChainId === chain.xChainId);
  const isSmall = useMedia('(max-width: 440px)');

  return (
    <Grid $isSignedIn={isSignedIn} className={isLast ? '' : 'border-bottom'} onClick={e => setChainId(chain.xChainId)}>
      <ChainItemWrap>
        <Box pr="10px">
          <ChainLogo chain={chain} />
        </Box>
        <Flex flexDirection={isSmall ? 'column' : 'row'} alignItems={'start'}>
          <Typography fontWeight="bold" fontSize={14} color="inherit" mr={'6px'}>
            {chain.name}
            <span style={{ fontWeight: 'normal' }}></span>
          </Typography>
        </Flex>
      </ChainItemWrap>
      {rewardAmount && rewardAmount.greaterThan(0) ? (
        <Typography
          color="inherit"
          style={{ transition: 'all ease 0.3s', opacity: rewardAmount.greaterThan(0) ? 1 : 0.75 }}
          fontSize={rewardAmount.greaterThan(0) ? 14 : 12}
        >
          {rewardAmount.greaterThan(0) ? rewardAmount.toSignificant(2) : '-'}
        </Typography>
      ) : (
        <Typography>-</Typography>
      )}
    </Grid>
  );
};

const ChainList = ({ chainId, setChainId, chains, width, lpRewards }: ChainListProps) => {
  const relevantChains = chains || xChains;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const collateralType = useCollateralType();
  const hasSignedIn = useHasSignedIn();
  const { sortBy, handleSortSelect, sortData } = useSortXPositions(
    hasSignedIn ? { key: 'value', order: 'DESC' } : { key: 'symbol', order: 'ASC' },
    collateralType,
  );

  const filteredChains = React.useMemo(() => {
    if (searchQuery === '') return relevantChains;

    return relevantChains.filter(
      chain =>
        chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chain.xChainId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [relevantChains, searchQuery]);

  const sortedFilteredChains = React.useMemo(() => {
    return sortData(filteredChains, collateralType);
  }, [filteredChains, sortData, collateralType]);

  return (
    <SelectorWrap $width={width}>
      <SearchInput
        type="text"
        placeholder={t`Search blockchains...`}
        autoComplete="off"
        value={searchQuery}
        tabIndex={isMobile ? -1 : 1}
        onChange={e => {
          setSearchQuery(e.target.value);
        }}
      />
      <ScrollHelper>
        <Flex width="100%" justifyContent="space-between">
          <StyledHeaderText
            role="button"
            className={sortBy.key === 'name' ? sortBy.order : ''}
            onClick={() =>
              handleSortSelect({
                key: 'name',
              })
            }
          >
            <span>
              <Trans>Blockchain</Trans>
            </span>
          </StyledHeaderText>
          <StyledHeaderText
            role="button"
            className={sortBy.key === 'position' ? sortBy.order : ''}
            onClick={() =>
              handleSortSelect({
                key: 'position',
              })
            }
          >
            <span>
              <Trans>Rewards</Trans>
            </span>
          </StyledHeaderText>
        </Flex>
        {sortedFilteredChains.map((chainItem, index) => (
          <Box key={chainItem.xChainId}>
            <ChainItem
              chain={chainItem}
              isActive={chainId === chainItem.xChainId}
              isLast={sortedFilteredChains.length === index + 1}
              setChainId={setChainId}
              rewardAmount={lpRewards[chainItem.xChainId]}
            />
          </Box>
        ))}
        {sortedFilteredChains.length === 0 && searchQuery !== '' && (
          <Typography textAlign="center" mt="20px" pb="22px">
            No blockchains found.
          </Typography>
        )}
      </ScrollHelper>
    </SelectorWrap>
  );
};

export default ChainList;
