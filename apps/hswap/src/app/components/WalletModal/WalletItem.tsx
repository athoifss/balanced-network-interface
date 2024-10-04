import React from 'react';

import { Typography } from '@/app/components2/Typography';

import { ChainLogo } from '@/app/components2/ChainLogo';
import { MODAL_ID, modalActions } from '@/hooks/useModalStore';
import { XConnector } from '@/xwagmi/core';
import { useXAccount, useXConnect, useXConnectors, useXDisconnect } from '@/xwagmi/hooks';
import { XChain } from '@/xwagmi/types';
import { XChainType } from '@balancednetwork/sdk-core';
import { t } from '@lingui/macro';
import { CopyableAddress } from '../Header';
import { ActionDivider, MainLogo, WalletActions, WalletItemGrid, XChainsWrap } from './styled';
import { Button } from '@/components/ui/button';

export type WalletItemProps = {
  name: string;
  xChainType: XChainType;
  logo: JSX.Element;
  description: string;
  border: boolean;
  keyWords: string[];
  xChains?: XChain[];
  switchChain?: (any) => void;
};

export const handleConnectWallet = (
  xChainType: XChainType | undefined,
  xConnectors: XConnector[],
  xConnect: (xConnector: XConnector) => Promise<void>,
) => {
  if (!xChainType) return;
  if (!xConnectors || xConnectors.length === 0) return;

  if (xChainType === 'EVM') {
    modalActions.openModal(MODAL_ID.EVM_WALLET_OPTIONS_MODAL);
  } else if (xChainType === 'INJECTIVE') {
    modalActions.openModal(MODAL_ID.INJECTIVE_WALLET_OPTIONS_MODAL);
  } else if (xChainType === 'SUI') {
    modalActions.openModal(MODAL_ID.SUI_WALLET_OPTIONS_MODAL);
  } else {
    xConnect(xConnectors[0]);
  }
};

const WalletItem = ({ name, xChainType, logo, description, border, xChains, switchChain }: WalletItemProps) => {
  const { address } = useXAccount(xChainType);

  const handleSwitchChain = (chain: XChain): void => {
    switchChain && switchChain({ chainId: chain.id });
  };

  const xConnectors = useXConnectors(xChainType);
  const xConnect = useXConnect();
  const xDisconnect = useXDisconnect();

  const handleConnect = () => {
    handleConnectWallet(xChainType, xConnectors, xConnect);
  };

  const handleDisconnect = () => {
    xDisconnect(xChainType);
  };

  return (
    <WalletItemGrid className={border ? 'border-bottom' : ''}>
      <MainLogo>{logo}</MainLogo>
      <div>
        <Typography className="pl-7 sm:pl-0 font-bold text-base mb-1">{name}</Typography>
        <div className="flex">
          <Typography color="text1">
            {address ? <CopyableAddress account={address} copyIcon placement="right" /> : description}
          </Typography>
        </div>
        {xChains && (
          <XChainsWrap signedIn={!!address}>
            {xChains.map(chain => (
              <div className="cursor-pointer" key={chain.xChainId} onClick={() => handleSwitchChain(chain)}>
                <ChainLogo chain={chain} size="24px" key={chain.xChainId} />
              </div>
            ))}
          </XChainsWrap>
        )}
      </div>
      <WalletActions>
        {address ? (
          <div className="flex wallet-options">
            <Button onClick={handleConnect} variant={'link'}>
              <Typography color="primaryBright">Change wallet</Typography>
            </Button>
            <ActionDivider text={t`or`} />
            <Typography color="alert" onClick={handleDisconnect} style={{ cursor: 'pointer' }}>
              Disconnect
            </Typography>
          </div>
        ) : (
          <Button onClick={handleConnect} variant={'link'}>
            <Typography color="primaryBright">Connect wallet</Typography>
          </Button>
        )}
      </WalletActions>
    </WalletItemGrid>
  );
};

export default WalletItem;
