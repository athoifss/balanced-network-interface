import { StyledArrowDownIcon, UnderlineText } from 'app/components/DropdownText';
import { DropdownPopper } from 'app/components/Popover';
import { SelectorWrap } from 'app/components/trade/CrossChainOptions';
import { xChainMap } from 'app/pages/trade/bridge/_config/xChains';
import { XChainId } from 'app/pages/trade/bridge/types';
import { getAvailableXChains } from 'app/pages/trade/bridge/utils';
import { Typography } from 'app/theme';
import { NETWORK_ID } from 'constants/config';
import { bnUSD } from 'constants/tokens';
import React, { useEffect, useMemo } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { Flex } from 'rebass';
import { useLoanActionHandlers, useLoanRecipientNetwork, useSetLoanRecipientNetwork } from 'store/loan/hooks';
import ChainSelectorLogo from '../CollateralChainSelector/ChainSelectorLogo';
import ChainList from './ChainList';
import { Trans } from '@lingui/macro';

const LoanChainSelector = () => {
  const [isOpen, setOpen] = React.useState(false);
  const loanRecipientNetwork = useLoanRecipientNetwork();
  const setRecipientNetwork = useSetLoanRecipientNetwork();
  const { onAdjust: adjust } = useLoanActionHandlers();

  const xChains = getAvailableXChains(bnUSD[NETWORK_ID])?.filter(chain => chain.xChainId !== 'archway-1');

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

  const isCrossChain: boolean = useMemo(() => {
    return (xChains?.length ?? 0) > 1;
  }, [xChains]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (arrowRef.current) {
      setAnchor(arrowRef.current);
    }
  }, [isCrossChain]);

  const setChainWrap = React.useCallback(
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
      {isCrossChain ? (
        <ClickAwayListener onClickAway={closeDropdown}>
          <div>
            <SelectorWrap onClick={handleToggle} style={{ position: 'relative' }}>
              <UnderlineText style={{ paddingRight: '1px', fontSize: '14px' }}>
                <ChainSelectorLogo chain={xChainMap[loanRecipientNetwork]} />
                {xChainMap[loanRecipientNetwork].name}
              </UnderlineText>
              <div ref={arrowRef} style={{ display: 'inline-block' }}>
                <StyledArrowDownIcon style={{ transform: 'translate3d(-2px, -4px, 0)' }} />
              </div>
            </SelectorWrap>

            <DropdownPopper
              show={isOpen}
              anchorEl={anchor}
              arrowEl={arrowRef.current}
              placement="bottom"
              offset={[0, 10]}
            >
              <ChainList setChainId={setChainWrap} chainId={loanRecipientNetwork} chains={xChains} />
            </DropdownPopper>
          </div>
        </ClickAwayListener>
      ) : (
        <Flex>
          <Typography mr={1} lineHeight="1.7">
            <ChainSelectorLogo chain={xChainMap[loanRecipientNetwork]} />
            {xChainMap[loanRecipientNetwork].name}
          </Typography>
        </Flex>
      )}
    </Flex>
  );
};
export default LoanChainSelector;
