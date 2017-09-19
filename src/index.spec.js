/* global jest, describe, expect, it */
import walker from '.';

describe('walker', () => {
  it('throws an error if no callback is supplied', () => {
    expect(() => walker('<html />')).toThrowErrorMatchingSnapshot();
  });

  it('calls the callback for each given HTML token', () => {
    const callback = jest.fn(
      (...args) => {
        expect(args).toMatchSnapshot();
        return args[0];
      }
    );

    const output = walker(
      '<html><head></head><body><img /></body></html>',
      callback
    );

    expect(callback.mock.calls.length).toMatchSnapshot();
    expect(output).toMatchSnapshot();
  });

  it('gives correct coordinates when the HTML is changed', () => {
    const callback = jest.fn(
      (...args) => {
        expect(args).toMatchSnapshot();
        return `${args[0]} autocomplete="off"`;
      }
    );

    const output = walker(
      '<html><head></head><body><img /></body></html>',
      callback
    );

    expect(callback.mock.calls.length).toMatchSnapshot();
    expect(output).toMatchSnapshot();
  });
});
