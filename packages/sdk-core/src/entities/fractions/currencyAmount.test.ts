import { MaxUint256 } from '../../constants';
import { ICX } from '../icx';
import { Token } from '../token';
import { CurrencyAmount } from './currencyAmount';
import { Percent } from './percent';

describe('CurrencyAmount', () => {
  const ADDRESS_ONE = '0x0000000000000000000000000000000000000001';

  describe('constructor', () => {
    it('works', () => {
      const token = new Token(1, ADDRESS_ONE, 18);
      const amount = CurrencyAmount.fromRawAmount(token, 100);
      expect(amount.quotient).toEqual(100n);
    });
  });

  describe('#quotient', () => {
    it('returns the amount after multiplication', () => {
      const token = new Token(1, ADDRESS_ONE, 18);
      const amount = CurrencyAmount.fromRawAmount(token, 100).multiply(new Percent(15, 100));
      expect(amount.quotient).toEqual(15n);
    });
  });

  describe('#icx', () => {
    it('produces icx amount', () => {
      const amount = CurrencyAmount.fromRawAmount(ICX.onChain(1), 100);
      expect(amount.quotient).toEqual(100n);
      expect(amount.currency).toEqual(ICX.onChain(1));
    });
  });

  it('token amount can be max uint256', () => {
    const amount = CurrencyAmount.fromRawAmount(new Token(1, ADDRESS_ONE, 18), MaxUint256);
    expect(amount.quotient).toEqual(MaxUint256);
  });
  it('token amount cannot exceed max uint256', () => {
    expect(() => CurrencyAmount.fromRawAmount(new Token(1, ADDRESS_ONE, 18), MaxUint256 + 1n)).toThrow('AMOUNT');
  });
  it('token amount quotient cannot exceed max uint256', () => {
    expect(() => CurrencyAmount.fromFractionalAmount(new Token(1, ADDRESS_ONE, 18), MaxUint256 * 2n + 2n, 2n)).toThrow(
      'AMOUNT',
    );
  });
  it('token amount numerator can be gt. uint256 if denominator is gt. 1', () => {
    const amount = CurrencyAmount.fromFractionalAmount(new Token(1, ADDRESS_ONE, 18), MaxUint256 + 2n, 2);
    expect(amount.numerator).toEqual(2n + MaxUint256);
  });

  describe('#toFixed', () => {
    it('throws for decimals > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 1000);
      expect(() => amount.toFixed(3)).toThrow('DECIMALS');
    });
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 123456);
      expect(amount.toFixed(0)).toEqual('123456');
    });
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18);
      const amount = CurrencyAmount.fromRawAmount(token, 1e15);
      expect(amount.toFixed(9)).toEqual('0.001000000');
    });
  });

  describe('#toSignificant', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 1000);
      expect(amount.toSignificant(3)).toEqual('1000');
    });
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 123456);
      expect(amount.toSignificant(4)).toEqual('123400');
    });
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18);
      const amount = CurrencyAmount.fromRawAmount(token, 1e15);
      expect(amount.toSignificant(9)).toEqual('0.001');
    });
  });

  describe('#toExact', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 1000);
      expect(amount.toExact()).toEqual('1000');
    });
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0);
      const amount = CurrencyAmount.fromRawAmount(token, 123456);
      expect(amount.toExact()).toEqual('123456');
    });
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18);
      const amount = CurrencyAmount.fromRawAmount(token, 123e13);
      expect(amount.toExact()).toEqual('0.00123');
    });
  });
});
