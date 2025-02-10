import React, { useCallback, useEffect, useMemo } from 'react';

import { Currency, CurrencyAmount } from '@balancednetwork/sdk-core';
import { Trans, t } from '@lingui/macro';
import { Box, Flex } from 'rebass/styled-components';
import styled from 'styled-components';
import { formatUnits } from 'viem';

import { Button, TextButton } from '@/app/components/Button';
import { StyledButton } from '@/app/components/Button/StyledButton';
import Modal from '@/app/components/Modal';
import ModalContent from '@/app/components/ModalContent';
import XTransactionState from '@/app/components/XTransactionState';
import { Typography } from '@/app/theme';
import { useEvmSwitchChain } from '@/hooks/useEvmSwitchChain';
import useXCallGasChecker from '@/hooks/useXCallGasChecker';
import { useIncentivisedPairs } from '@/queries/reward';
import { useDerivedMintInfo } from '@/store/mint/hooks';
import { Field } from '@/store/mint/reducer';
import { showMessageOnBeforeUnload } from '@/utils/messages';
import {
  ICON_XCALL_NETWORK_ID,
  XToken,
  XTransactionStatus,
  convertCurrencyAmount,
  getNetworkDisplayName,
  useXAddLiquidity,
  useXCallFee,
  useXTokenDepositAmount,
  useXTransactionStore,
  xChainMap,
} from '@balancednetwork/xwagmi';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { SendRemoveXToken } from './SendRemoveXToken';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  currencies: { [field in Field]?: XToken };
  onSuccess?: () => void;
}

export default function SupplyLiquidityModal({ isOpen, onClose, parsedAmounts, currencies, onSuccess }: ModalProps) {
  const queryClient = useQueryClient();
  const { account, pair, lpXChainId } = useDerivedMintInfo();

  const { data: incentivisedPairs } = useIncentivisedPairs();

  // supply
  const [isPending, setIsPending] = React.useState(false);
  const [pendingTx, setPendingTx] = React.useState('');
  const currentXTransaction = useXTransactionStore(state => state.transactions[pendingTx]);

  // tokenA
  const [isSendingTokenA, setIsSendingTokenA] = React.useState(false);
  const [isRemovingTokenA, setIsRemovingTokenA] = React.useState(false);
  const [isSigningTokenA, setIsSigningTokenA] = React.useState(false);
  const [pendingTxTokenA, setPendingTxTokenA] = React.useState('');

  // tokenB
  const [isSendingTokenB, setIsSendingTokenB] = React.useState(false);
  const [isRemovingTokenB, setIsRemovingTokenB] = React.useState(false);
  const [isSigningTokenB, setIsSigningTokenB] = React.useState(false);
  const [pendingTxTokenB, setPendingTxTokenB] = React.useState('');

  const isExecuted = React.useMemo(
    () =>
      currentXTransaction?.status === XTransactionStatus.success ||
      currentXTransaction?.status === XTransactionStatus.failure,
    [currentXTransaction],
  );

  const handleDismiss = useCallback(() => {
    onClose();

    if (
      currentXTransaction?.status === XTransactionStatus.success &&
      pair &&
      incentivisedPairs &&
      incentivisedPairs.find(p => p.id === pair.poolId)
    ) {
      onSuccess?.();
    }

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['XTokenDepositAmount'] });
      setIsPending(false);
      setPendingTx('');
      setHasErrorMessage(false);
    }, 500);
  }, [onClose, queryClient, onSuccess, pair, incentivisedPairs, currentXTransaction]);

  const slowDismiss = useCallback(() => {
    setTimeout(() => {
      handleDismiss();
    }, 2000);
  }, [handleDismiss]);

  useEffect(() => {
    if (isExecuted) {
      slowDismiss();
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    }
  }, [isExecuted, slowDismiss, queryClient]);

  const { data: depositAmountA } = useXTokenDepositAmount(account, currencies[Field.CURRENCY_A]?.wrapped);
  const { data: depositAmountB } = useXTokenDepositAmount(account, currencies[Field.CURRENCY_B]?.wrapped);

  const xAddLiquidity = useXAddLiquidity();

  const handleSupplyConfirm = async () => {
    window.addEventListener('beforeunload', showMessageOnBeforeUnload);

    try {
      if (depositAmountA && depositAmountB) {
        setIsPending(true);

        const txHash = await xAddLiquidity(account, depositAmountA, depositAmountB);
        if (txHash) setPendingTx(txHash);
        else setIsPending(false);
      }
    } catch (error) {
      console.error('error', error);
      setIsPending(false);
    }
    window.removeEventListener('beforeunload', showMessageOnBeforeUnload);
  };

  const isEnabled = !!depositAmountA?.greaterThan(0) && !!depositAmountB?.greaterThan(0);

  const [hasErrorMessage, setHasErrorMessage] = React.useState(false);
  const handleCancelSupply = () => {
    if (!depositAmountA?.greaterThan(0) && !depositAmountB?.greaterThan(0)) {
      handleDismiss();
    } else {
      setHasErrorMessage(true);
    }
  };

  const { xCallFee } = useXCallFee(lpXChainId, ICON_XCALL_NETWORK_ID);
  const formattedXCallFee: string = useMemo(() => {
    return xCallFee
      ? formatUnits(xCallFee.rollback * 3n, xChainMap[lpXChainId].nativeCurrency.decimals) +
          ' ' +
          xChainMap[lpXChainId].nativeCurrency.symbol
      : '';
  }, [xCallFee, lpXChainId]);

  const { isWrongChain, handleSwitchChain } = useEvmSwitchChain(lpXChainId);

  const gasMultiplier = useMemo(() => {
    if (depositAmountA?.greaterThan(0) && depositAmountB?.greaterThan(0)) {
      return 1;
    } else if (depositAmountA?.greaterThan(0) || depositAmountB?.greaterThan(0)) {
      return 2;
    } else {
      return 3;
    }
  }, [depositAmountA, depositAmountB]);

  const gasChecker = useXCallGasChecker(
    lpXChainId,
    parsedAmounts[Field.CURRENCY_A] ? convertCurrencyAmount(lpXChainId, parsedAmounts[Field.CURRENCY_A]) : undefined,
    gasMultiplier,
  );

  return (
    <>
      <Modal isOpen={isOpen} onDismiss={() => undefined}>
        <ModalContent noMessages>
          <Typography textAlign="center" mb={2} as="h3" fontWeight="normal">
            {pair ? t`Supply liquidity?` : t`Create liquidity pool?`}
          </Typography>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateX(-50%)',
              }}
            />
            <Flex alignItems="center" mb={1} hidden={false}>
              <Box width={1 / 2}>
                <StyledDL>
                  <Typography textAlign="center" mb={2} as="h3" fontWeight="normal">
                    <Trans>Assets to send</Trans>
                  </Typography>
                </StyledDL>
              </Box>
              <Box width={1 / 2}>
                <StyledDL>
                  <Typography textAlign="center" mb={2} as="h3" fontWeight="normal">
                    <Trans>Assets on Balanced</Trans>
                  </Typography>
                </StyledDL>
              </Box>
            </Flex>

            <SendRemoveXToken
              field={Field.CURRENCY_A}
              currencies={currencies}
              parsedAmounts={parsedAmounts}
              onResetError={() => setHasErrorMessage(false)}
              isSending={isSendingTokenA}
              isRemoving={isRemovingTokenA}
              isSigning={isSigningTokenA}
              pendingTx={pendingTxTokenA}
              setIsSending={setIsSendingTokenA}
              setIsRemoving={setIsRemovingTokenA}
              setIsSigning={setIsSigningTokenA}
              setPendingTx={setPendingTxTokenA}
            />
            <SendRemoveXToken
              field={Field.CURRENCY_B}
              currencies={currencies}
              parsedAmounts={parsedAmounts}
              onResetError={() => setHasErrorMessage(false)}
              isSending={isSendingTokenB}
              isRemoving={isRemovingTokenB}
              isSigning={isSigningTokenB}
              pendingTx={pendingTxTokenB}
              setIsSending={setIsSendingTokenB}
              setIsRemoving={setIsRemovingTokenB}
              setIsSigning={setIsSigningTokenB}
              setPendingTx={setPendingTxTokenB}
            />
          </div>
          <Typography textAlign="center" as="h3" fontWeight="normal">
            <Trans>Send your liquidity to Balanced, then click Supply.</Trans>
          </Typography>
          {lpXChainId !== ICON_XCALL_NETWORK_ID && (
            <Flex justifyContent="center" alignItems="center" mt={2} style={{ gap: 4 }}>
              <Typography textAlign="center" as="h3" fontWeight="normal">
                <Trans>Transfer fees: </Trans>
              </Typography>
              <Typography fontWeight="bold">{formattedXCallFee}</Typography>
            </Flex>
          )}
          {hasErrorMessage && (
            <Typography textAlign="center" color="alert">
              <Trans>Remove your assets to cancel this transaction.</Trans>
            </Typography>
          )}

          {currentXTransaction && <XTransactionState xTransaction={currentXTransaction} />}

          <AnimatePresence>
            {((!isExecuted && isPending) || !isPending) && (
              <motion.div
                key={'tx-actions'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <Flex justifyContent="center" mt={4} pt={4} className="border-top">
                  <TextButton onClick={handleCancelSupply}>
                    <Trans>Cancel</Trans>
                  </TextButton>

                  {isWrongChain ? (
                    <Button onClick={handleSwitchChain} fontSize={14}>
                      <Trans>Switch to</Trans>
                      {` ${getNetworkDisplayName(lpXChainId)}`}
                    </Button>
                  ) : (
                    <StyledButton
                      disabled={!isEnabled || !gasChecker.hasEnoughGas || isPending || isWrongChain}
                      onClick={handleSupplyConfirm}
                      $loading={isPending}
                    >
                      {isPending ? (pair ? t`Supplying` : t`Creating pool`) : pair ? t`Supply` : t`Create pool`}
                    </StyledButton>
                  )}
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>

          {!isPending && !gasChecker.hasEnoughGas && (
            <Flex justifyContent="center" paddingY={2}>
              <Typography maxWidth="320px" color="alert" textAlign="center">
                {gasChecker.errorMessage}
              </Typography>
            </Flex>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const StyledDL = styled.dl`
  margin: 15px 0 15px 0;
  text-align: center;
`;
