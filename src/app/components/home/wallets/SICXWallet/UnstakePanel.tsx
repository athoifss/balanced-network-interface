import React from 'react';

import Nouislider from 'nouislider-react';
import { BalancedJs } from 'packages/BalancedJs';
import { useIconReact } from 'packages/icon-react';
import { Box, Flex } from 'rebass/styled-components';

import { Button, TextButton } from 'app/components/Button';
import ShouldLedgerConfirmMessage from 'app/components/DepositStakeMessage';
import Modal from 'app/components/Modal';
import { Typography } from 'app/theme';
import bnJs from 'bnJs';
import { SLIDER_RANGE_MAX_BOTTOM_THRESHOLD, ZERO } from 'constants/index';
import { useChangeShouldLedgerSign, useShouldLedgerSign } from 'store/application/hooks';
import { useRatio } from 'store/ratio/hooks';
import { useTransactionAdder } from 'store/transactions/hooks';
import { useWalletBalances } from 'store/wallet/hooks';

export default function UnstakePanel() {
  const [value, setValue] = React.useState(ZERO);

  const shouldLedgerSign = useShouldLedgerSign();
  const changeShouldLedgerSign = useChangeShouldLedgerSign();

  const handleSlider = (values: string[], handle: number) => {
    setValue(maxAmount.multipliedBy(values[handle]).div(100));
  };

  const { account } = useIconReact();

  const wallet = useWalletBalances();

  const ratio = useRatio();

  const maxAmount = wallet['sICX'];

  // modal logic
  const [open, setOpen] = React.useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const beforeAmount = wallet['sICX'];

  const differenceAmount = value;

  const afterAmount = beforeAmount.minus(differenceAmount);

  const addTransaction = useTransactionAdder();

  const handleUnstake = () => {
    if (bnJs.contractSettings.ledgerSettings.actived) {
      changeShouldLedgerSign(true);
    }

    bnJs
      .inject({ account })
      .sICX.unstake(BalancedJs.utils.toLoop(differenceAmount))
      .then(res => {
        if (res.result) {
          addTransaction(
            { hash: res.result },
            {
              pending: `Preparing to unstake sICX...`,
              summary: `Unstaking ${differenceAmount.dp(2).toFormat()} sICX. Check ICX in your wallet for details.`,
            },
          );
          toggleOpen();
          setValue(ZERO);
        } else {
          // to do
          // need to handle error case
          // for example: out of balance
          console.error(res);
        }
      })
      .finally(() => {
        changeShouldLedgerSign(false);
      });
  };

  const differenceAmountByICX = differenceAmount.multipliedBy(ratio.sICXICXratio);

  return (
    <>
      <Typography variant="h3">Unstake sICX</Typography>

      <Box my={3}>
        <Nouislider
          disabled={maxAmount.dp(2).isZero()}
          start={[0]}
          padding={[0]}
          connect={[true, false]}
          range={{
            min: [0],
            max: [maxAmount.dp(2).isZero() ? SLIDER_RANGE_MAX_BOTTOM_THRESHOLD : 100],
          }}
          onSlide={handleSlider}
        />
      </Box>

      <Flex my={1} alignItems="center" justifyContent="space-between">
        <Typography>
          {value.dp(2).toFormat()} / {maxAmount.dp(2).toFormat()} sICX
        </Typography>
        <Typography>~ {differenceAmountByICX.dp(2).toFormat()} ICX</Typography>
      </Flex>

      <Flex alignItems="center" justifyContent="center" mt={5}>
        <Button onClick={toggleOpen}>Unstake sICX</Button>
      </Flex>

      <Modal isOpen={open} onDismiss={toggleOpen}>
        <Flex flexDirection="column" alignItems="stretch" m={5} width="100%">
          <Typography textAlign="center" mb="5px">
            Unstake sICX?
          </Typography>

          <Typography variant="p" fontWeight="bold" textAlign="center" fontSize={20}>
            {differenceAmount.dp(2).toFormat() + ' sICX'}
          </Typography>

          <Typography textAlign="center" mb="5px">
            {differenceAmountByICX.dp(2).toFormat()} ICX
          </Typography>

          <Flex my={5}>
            <Box width={1 / 2} className="border-right">
              <Typography textAlign="center">Before</Typography>
              <Typography variant="p" textAlign="center">
                {beforeAmount.dp(2).toFormat() + ' sICX'}
              </Typography>
            </Box>

            <Box width={1 / 2}>
              <Typography textAlign="center">After</Typography>
              <Typography variant="p" textAlign="center">
                {afterAmount.dp(2).toFormat() + ' sICX'}
              </Typography>
            </Box>
          </Flex>

          <Typography textAlign="center">
            You'll receive ICX as soon as it becomes available.
            <br />
            Track the unstaking progress from the ICX tab.
          </Typography>

          <Flex justifyContent="center" mt={4} pt={4} className="border-top">
            <TextButton onClick={toggleOpen} fontSize={14}>
              Cancel
            </TextButton>
            <Button onClick={handleUnstake} fontSize={14}>
              Unstake
            </Button>
          </Flex>
          {shouldLedgerSign && <ShouldLedgerConfirmMessage />}
        </Flex>
      </Modal>
    </>
  );
}
