import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { changeDeposite, changeBalance, adjust, cancel, type, Field } from './actions';

export interface CollateralState {
  depositedValue: BigNumber;
  balance: BigNumber;

  // collateral panel UI state
  state: {
    isAdjusting: boolean;
    typedValue: string;
    independentField: Field;
  };
}

const initialState: CollateralState = {
  depositedValue: new BigNumber(0),
  balance: new BigNumber(0),

  // collateral panel UI state
  state: {
    isAdjusting: false,
    typedValue: '',
    independentField: Field.LEFT,
  },
};

export default createReducer(initialState, builder =>
  builder
    .addCase(adjust, (state, { payload }) => {
      state.state.isAdjusting = true;
    })
    .addCase(cancel, (state, { payload }) => {
      // reset typedValue, indepentField, isAdjusting values
      state.state.isAdjusting = false;
    })
    .addCase(type, (state, { payload: { independentField, typedValue } }) => {
      state.state.independentField = independentField || state.state.independentField;
      state.state.typedValue = typedValue || state.state.independentField;
    })
    .addCase(changeDeposite, (state, { payload: { depositedValue } }) => {
      state.depositedValue = depositedValue;
    })
    .addCase(changeBalance, (state, { payload: { balance } }) => {
      state.balance = balance;
    }),
);
