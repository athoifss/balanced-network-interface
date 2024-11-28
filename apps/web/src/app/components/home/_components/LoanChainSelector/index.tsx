import { StyledArrowDownIcon } from '@/app/components/DropdownText';
import { DropdownPopper } from '@/app/components/Popover';
import { SelectorWrap } from '@/app/components/trade/CrossChainOptions';
import { Typography } from '@/app/theme';
import { NETWORK_ID } from '@/constants/config';
import { bnUSD } from '@/constants/tokens';
import { useDerivedCollateralInfo } from '@/store/collateral/hooks';
import { useLoanActionHandlers, useLoanRecipientNetwork } from '@/store/loan/hooks';
import { xChainMap } from '@/xwagmi/constants/xChains';
import { XChainId } from '@/xwagmi/types';
import { getSupportedXChainForToken } from '@/xwagmi/xcall/utils';
import { Trans } from '@lingui/macro';
import React, { useEffect } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { Flex } from 'rebass';
import ChainSelectorLogo from '../CollateralChainSelector/ChainSelectorLogo';
import ChainList from './ChainList';

const LoanChainSelector = ({
  width,
  containerRef,
}: { width: number | undefined; containerRef: HTMLDivElement | null }) => {
  const [isOpen, setOpen] = React.useState(false);
  const loanRecipientNetwork = useLoanRecipientNetwork();
  const { onAdjust: adjust, setRecipientNetwork } = useLoanActionHandlers();

  //temporarily validate stellar account
  // const xChains = getSupportedXChainForToken(bnUSD[NETWORK_ID]);
  const { sourceChain } = useDerivedCollateralInfo();
  const xChains = React.useMemo(() => {
    if (sourceChain === 'stellar') {
      return getSupportedXChainForToken(bnUSD[NETWORK_ID]);
    } else {
      return getSupportedXChainForToken(bnUSD[NETWORK_ID])?.filter(chain => chain.xChainId !== 'stellar');
    }
  }, [sourceChain]);
  //end of temporary stellar account validation

  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const arrowRef = React.useRef(null);

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const closeDropdown = () => {
    if (isOpen) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (containerRef) {
      setAnchor(containerRef);
    }
  }, [containerRef]);

  const handleChainIdChange = React.useCallback(
    (chainId: XChainId) => {
      adjust(false);
      setRecipientNetwork(chainId);
      setOpen(false);
    },
    [setRecipientNetwork, adjust],
  );

  return (
    <Flex>
      <Typography mr={1} lineHeight="1.7">
        <Trans>Receive / repay on:</Trans>
      </Typography>
      <ClickAwayListener onClickAway={closeDropdown}>
        <div>
          <SelectorWrap onClick={handleToggle} style={{ position: 'relative' }}>
            <Typography fontSize={14} pr="1px" variant="span">
              <ChainSelectorLogo chain={xChainMap[loanRecipientNetwork]} />
              {xChainMap[loanRecipientNetwork].name}
            </Typography>
            <div ref={arrowRef} style={{ display: 'inline-block' }}>
              <StyledArrowDownIcon style={{ transform: 'translate3d(-2px, -4px, 0)' }} />
            </div>
          </SelectorWrap>

          <DropdownPopper
            show={isOpen}
            anchorEl={anchor}
            arrowEl={arrowRef.current}
            placement="bottom"
            offset={[0, 9]}
            strategy="absolute"
            containerOffset={containerRef ? containerRef.getBoundingClientRect().x + 2 : 0}
          >
            <ChainList
              onChainIdChange={handleChainIdChange}
              chainId={loanRecipientNetwork}
              chains={xChains}
              width={width}
            />
          </DropdownPopper>
        </div>
      </ClickAwayListener>
    </Flex>
  );
};
export default LoanChainSelector;
