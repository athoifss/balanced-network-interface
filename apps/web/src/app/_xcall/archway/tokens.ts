import { SupportedChainId as ChainId } from '@balancednetwork/balanced-js';
import { Token } from '@balancednetwork/sdk-core';

import { NETWORK_ID } from 'constants/config';
import { TokenMap } from 'constants/tokens';
import { XToken, XTokenMap } from '../types';

// disable prettier printWidth rule
// prettier-ignore
export const sARCH: TokenMap = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'cxfe94530ee0d159db3e5b7dcffbcd0dfb360075c0',
    18,
    'sARCH',
    'Staked Archway',
  ),
  [ChainId.BERLIN]: new Token(
    ChainId.BERLIN,
    'cx4761756e11195947dd27d765ac01e931b836065c',
    18,
    'sARCH',
    'Staked Archway',
  ),
  [ChainId.LISBON]: new Token(
    ChainId.LISBON,
    'cx1f94585b61e47db9d5e036307f96a3251a0486a1',
    18,
    'sARCH',
    'Staked Archway',
  ),
};

export const sARCHOnArchway: XTokenMap = {
  ['archway-1']: new XToken(
    'archway-1',
    'archway-1',
    'archway1t2llqsvwwunf98v692nqd5juudcmmlu3zk55utx7xtfvznel030saclvq6',
    18,
    'sARCH',
    'Staked Archway',
  ),
  ['archway']: new XToken(
    'archway',
    'archway',
    'archway1erqguqc3hmfajgu7e2dvgaccx6feu5ru3gyatdxu94p66j9hp7msn2kcqp',
    18,
    'sARCH',
    'Staked Archway',
  ),
};

export const ArchwayToken: TokenMap = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, 'NativeArchFakeAddrress', 18, 'ARCH', 'Archway'),
  [ChainId.BERLIN]: new Token(ChainId.BERLIN, 'NativeArchFakeAddrress', 18, 'ARCH', 'Archway'),
  [ChainId.LISBON]: new Token(ChainId.LISBON, 'NativeArchFakeAddrress', 18, 'ARCH', 'Archway'),
};

export const useARCH = () => {
  return ArchwayToken[NETWORK_ID];
};
