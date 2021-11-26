import { SupportedChainId as NetworkId } from 'packages/BalancedJs';

import { CurrencyKey, Pool } from 'types';
import { Currency } from 'types/balanced-sdk-core';

import { PairInfo, SUPPORTED_PAIRS } from './pairs';

export const getTradePair = (
  baseKey?: CurrencyKey,
  quoteKey?: CurrencyKey,
): [PairInfo | undefined, boolean | undefined] => {
  if (baseKey && quoteKey) {
    const pair1 = SUPPORTED_PAIRS.find(pair => pair.baseCurrencyKey === baseKey && pair.quoteCurrencyKey === quoteKey);
    const pair2 = SUPPORTED_PAIRS.find(pair => pair.baseCurrencyKey === quoteKey && pair.quoteCurrencyKey === baseKey);

    if (pair1) {
      return [pair1, false];
    } else if (pair2) {
      return [pair2, true];
    }
  }
  return [undefined, undefined];
};

export const isQueue = (t: Pool | PairInfo) => {
  if (
    (t.baseCurrencyKey === 'sICX' && t.quoteCurrencyKey === 'ICX') ||
    (t.baseCurrencyKey === 'ICX' && t.quoteCurrencyKey === 'sICX')
  )
    return true;
  return false;
};

export const canBeQueue = (inputCurrency?: Currency, outputCurrency?: Currency) => {
  if (
    (inputCurrency?.symbol === 'sICX' && outputCurrency?.symbol === 'ICX') ||
    (inputCurrency?.symbol === 'ICX' && outputCurrency?.symbol === 'sICX')
  )
    return true;
  return false;
};

export const addressToCurrencyKeyMap = {
  [NetworkId.MAINNET]: {
    cx2609b924e33ef00b648a409245c7ea394c467824: 'sICX',
    cx88fd7df7ddff82f7cc735c871dc519838cb235bb: 'bnUSD',
    cxf61cd5a45dc9f91c15aa65831a30a90d59a09619: 'BALN',
    cx0000000000000000000000000000000000000000: 'ICX',
    cxae3034235540b924dfcc1b45836c293dcc82bfb7: 'IUSDC',
    cxbb2871f468a3008f80b08fdde5b8b951583acf06: 'USDS',
    cx1a29259a59f463a67bb2ef84398b30ca56b5830a: 'OMM',
    cx2e6d0fc0eca04965d06038c8406093337f085fcf: 'CFT',
    cx369a5f4ce4f4648dfc96ba0c8229be0693b4eca2: 'METX',
    cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88: 'IUSDT',
  },
  [NetworkId.YEOUIDO]: {
    cx81730290ed56a72539c531ceb8346a4f15b19d0a: 'sICX',
    cx7bd90c91db9b0be9f688442dce7569aebb1ff7fe: 'bnUSD',
    cx40b768f5834a124ea242f9741b853af804fb497f: 'BALN',
    cx0000000000000000000000000000000000000000: 'ICX',
    cx65f639254090820361da483df233f6d0e69af9b7: 'IUSDC',
    cxc0666df567a6e0b49342648e98ccbe5362b264ea: 'USDS',
    cxc58f32a437c8e5a5fcb8129626662f2252ad2678: 'OMM',
    cxf7313d7fd611c99b8db29e298699be4b1fd86661: 'CFT',
  },
  [NetworkId.SEJONG]: {
    cx70806fdfa274fe12ab61f1f98c5a7a1409a0c108: 'sICX',
    cx5838cb516d6156a060f90e9a3de92381331ff024: 'bnUSD',
    cx303470dbc10e5b4ab8831a61dbe00f75db10c38b: 'BALN',
    cxb94c0da9a8e650cc09b2f6b1bbfaa957ab47ec4c: 'OMM',
    cx0000000000000000000000000000000000000000: 'ICX',
  },
};
