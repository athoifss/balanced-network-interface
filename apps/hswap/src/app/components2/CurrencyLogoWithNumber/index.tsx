import React from 'react';

import { xChainMap } from '@/xwagmi/constants/xChains';
import { XToken } from '@balancednetwork/sdk-core';

import { cn } from '@/lib/utils';
import { ChainLogo } from '../ChainLogo';
import CurrencyLogo from '../CurrencyLogo';

const CurrencyLogoWithNumber = ({
  currency,
  size,
  className,
}: {
  currency: XToken;
  size: string;
  className?: string;
}) => {
  return (
    <div className={cn('relative bg-[#d4c5f9] rounded-full p-1')}>
      <CurrencyLogo currency={currency} size={size} />
      <div className={cn('absolute w-[50%] h-[50%] rounded-full bg-[#E6E0F7] p-[2px] right-0 bottom-0', className)}>
        <ChainLogo chain={xChainMap[currency.xChainId]} className="w-full h-full" />
      </div>
    </div>
  );
};

export default CurrencyLogoWithNumber;
