import React, { useMemo } from 'react';

import { Currency, CurrencyAmount, TradeType } from '@balancednetwork/sdk-core';
import { Trade } from '@balancednetwork/v1-sdk';
import { t, Trans } from '@lingui/macro';
import BigNumber from 'bignumber.js';
import { Box, Flex } from 'rebass';
import styled from 'styled-components';

import { useARCH } from 'app/pages/trade/bridge-v2/_config/tokens';
import { XChainId, XToken } from 'app/pages/trade/bridge-v2/types';
import { getNetworkDisplayName } from 'app/pages/trade/bridge-v2/utils';
import { Typography } from 'app/theme';
import { useChangeShouldLedgerSign, useShouldLedgerSign, useSwapSlippageTolerance } from 'store/application/hooks';
import { Field } from 'store/swap/reducer';
import { formatBigNumber, shortenAddress } from 'utils';

import { Button, TextButton } from 'app/components/Button';
import Modal from 'app/components/Modal';
import Spinner from 'app/components/Spinner';
import ModalContent from 'app/components/ModalContent';
import useXCallFee from 'app/pages/trade/bridge-v2/_hooks/useXCallFee';
import useXCallGasChecker from 'app/pages/trade/bridge-v2/_hooks/useXCallGasChecker';
import { XCallSwapStatusUpdater, useXCallSwapStore, xCallSwapActions } from '../_zustand/useXCallSwapStore';
import { showMessageOnBeforeUnload } from 'utils/messages';
import { ApprovalState, useApproveCallback } from 'app/pages/trade/bridge-v2/_hooks/useApproveCallback';
import XCallSwapState from './XCallSwapState';
import { xChainMap } from '../bridge-v2/_config/xChains';

type XCallSwapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  account: string | undefined;
  currencies: { [field in Field]?: Currency };
  executionTrade?: Trade<Currency, Currency, TradeType>;
  clearInputs: () => void;
  direction: {
    from: XChainId;
    to: XChainId;
  };
  destinationAddress?: string | null;
};

export const StyledButton = styled(Button)`
  position: relative;

  &:after,
  &:before {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    left: 0;
    border-radius: 5px;
    background: ${({ theme }) => theme.colors.primaryBright};
  }

  &:after {
    bottom: 0;
  }

  &:before {
    top: 0;
  }

  @keyframes expand {
    0% {
      width: 0;
      left: 50%;
      opacity: 0;
    }
    50% {
      width: 28%;
      left: 36%;
      opacity: 1;
    }
    100% {
      width: 100%;
      left: 0%;
      opacity: 0;
    }
  }

  &:disabled {
    &:after {
      animation: expand 2s infinite;
    }
  }
`;

export const presenceVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
};

const XCallSwapModal = ({
  isOpen,
  account,
  currencies,
  executionTrade,
  direction,
  destinationAddress,
  clearInputs,
  onClose,
}: XCallSwapModalProps) => {
  const { isProcessing } = useXCallSwapStore();

  const shouldLedgerSign = useShouldLedgerSign();
  const changeShouldLedgerSign = useChangeShouldLedgerSign();
  const slippageTolerance = useSwapSlippageTolerance();

  const { xCallFee, formattedXCallFee } = useXCallFee(direction.from, direction.to);
  const { data: gasChecker } = useXCallGasChecker(direction.from, direction.to);

  const xChain = xChainMap[direction.from];
  const _inputAmount = useMemo(() => {
    return executionTrade?.inputAmount && currencies[Field.INPUT]
      ? CurrencyAmount.fromFractionalAmount(
          XToken.getXToken(direction.from, currencies[Field.INPUT].wrapped),
          executionTrade.inputAmount.numerator,
          executionTrade.inputAmount.denominator,
        )
      : undefined;
  }, [executionTrade, direction.from, currencies]);
  const { approvalState, approveCallback } = useApproveCallback(_inputAmount, xChain.contracts.assetManager);

  const cleanupSwap = () => {
    clearInputs();
    window.removeEventListener('beforeunload', showMessageOnBeforeUnload);
    changeShouldLedgerSign(false);
  };

  const handleDismiss = () => {
    onClose();
    setTimeout(() => {
      xCallSwapActions.reset();
    }, 500);
  };

  const handleXCallSwap = async () => {
    if (!executionTrade) {
      return;
    }

    if (!account) return;

    const swapInfo = {
      direction,
      executionTrade,
      cleanupSwap,
      account,
      slippageTolerance,
      xCallFee,
    };
    await xCallSwapActions.executeSwap(swapInfo);
  };

  return (
    <>
      <XCallSwapStatusUpdater />
      <Modal isOpen={isOpen} onDismiss={handleDismiss}>
        <ModalContent noMessages={isProcessing}>
          <Typography textAlign="center" mb="5px" as="h3" fontWeight="normal">
            <Trans>
              Swap {currencies[Field.INPUT]?.symbol} for {currencies[Field.OUTPUT]?.symbol}?
            </Trans>
          </Typography>

          <Typography variant="p" fontWeight="bold" textAlign="center">
            <Trans>
              {`${formatBigNumber(new BigNumber(executionTrade?.executionPrice.toFixed() || 0), 'ratio')} ${
                executionTrade?.executionPrice.quoteCurrency.symbol
              } 
              per ${executionTrade?.executionPrice.baseCurrency.symbol}`}
            </Trans>
          </Typography>

          <Flex my={4}>
            <Box width={1 / 2} className="border-right">
              <Typography textAlign="center">
                <Trans>Pay</Trans>
              </Typography>
              <Typography variant="p" textAlign="center" py="5px">
                {formatBigNumber(new BigNumber(executionTrade?.inputAmount.toFixed() || 0), 'currency')}{' '}
                {currencies[Field.INPUT]?.symbol}
              </Typography>
              <Typography textAlign="center">
                <Trans>{getNetworkDisplayName(direction.from)}</Trans>
              </Typography>
              <Typography textAlign="center">
                <Trans>{destinationAddress && account && shortenAddress(account, 5)}</Trans>
              </Typography>
            </Box>

            <Box width={1 / 2}>
              <Typography textAlign="center">
                <Trans>Receive</Trans>
              </Typography>
              <Typography variant="p" textAlign="center" py="5px">
                {formatBigNumber(new BigNumber(executionTrade?.outputAmount.toFixed() || 0), 'currency')}{' '}
                {currencies[Field.OUTPUT]?.symbol}
              </Typography>
              <Typography textAlign="center">
                <Trans>{getNetworkDisplayName(direction.to)}</Trans>
              </Typography>
              <Typography textAlign="center">
                <Trans>{destinationAddress && shortenAddress(destinationAddress, 5)}</Trans>
              </Typography>
            </Box>
          </Flex>

          <Typography
            textAlign="center"
            hidden={currencies[Field.INPUT]?.symbol === 'ICX' && currencies[Field.OUTPUT]?.symbol === 'sICX'}
          >
            <Trans>Includes a fee of</Trans>{' '}
            <strong>
              {formatBigNumber(new BigNumber(executionTrade?.fee.toFixed() || 0), 'currency')}{' '}
              {currencies[Field.INPUT]?.symbol}
            </strong>
            .
          </Typography>

          <Typography textAlign="center">
            <Trans>You'll also pay</Trans> <strong>{formattedXCallFee}</strong> <Trans>to transfer cross-chain.</Trans>
          </Typography>

          {isProcessing && <XCallSwapState />}

          {gasChecker && !gasChecker.hasEnoughGas && (
            <Typography mt={4} mb={-1} textAlign="center" color="alert">
              {gasChecker.errorMessage || t`Not enough gas to complete the swap.`}
            </Typography>
          )}

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            {shouldLedgerSign && <Spinner></Spinner>}
            {!shouldLedgerSign && (
              <>
                <TextButton onClick={handleDismiss}>
                  <Trans>Cancel</Trans>
                </TextButton>
                {approvalState !== ApprovalState.APPROVED && !isProcessing && (
                  <>
                    <Button onClick={approveCallback} disabled={approvalState === ApprovalState.PENDING}>
                      {approvalState === ApprovalState.PENDING ? 'Approving' : 'Approve'}
                    </Button>
                  </>
                )}
                {approvalState === ApprovalState.APPROVED && (
                  <>
                    <StyledButton onClick={handleXCallSwap} disabled={isProcessing}>
                      {!isProcessing ? <Trans>Swap</Trans> : <Trans>xCall in progress</Trans>}
                    </StyledButton>
                  </>
                )}
                {/* {allowanceIncreaseNeeded && !isProcessing ? (
                <Button disabled={true}>Swap</Button>
              ) : gasChecker && !gasChecker.hasEnoughGas ? (
                <Button disabled={true}>Swap</Button>
              ) : (
                <StyledButton onClick={handleXCallSwap} disabled={isProcessing}>
                  {!isProcessing ? <Trans>Swap</Trans> : <Trans>xCall in progress</Trans>}
                </StyledButton>
              )} */}
              </>
            )}
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

export default XCallSwapModal;
