const { prop, LazyBox, Left, Right } = require('../funcs');

describe('prop', () => {
  test('getting prop from object x', () => {
    const obj = { name: 'teoeo' };
    const getName = prop('name');
    expect(getName(obj)).toBe('teoeo');
  });
});

describe('LazyBox', () => {
  test('creating a LazyBox will not trigger the function', () => {
    const fn = jest.fn();
    LazyBox(fn)
      .map(fx => fx());

    expect(fn).not.toBeCalled();
  });

  test('executing a value on lazyBox using fold', () => {
    const obj = { message: null };

    const b = LazyBox(() => 'hello world')
      .map(message => message.toUpperCase())
      .fold((x) => { obj.message = x; })

    expect(obj.message).toBe('HELLO WORLD');
  });
});

describe('Left', () => {
  test('setting anything on Left will not execute anything on map methods', () => {
    let finalValue;

    Left(1)
      .map(x => x + 1)
      .map(x => x * 2)
      .fold(
        leftCase => finalValue = leftCase,
        rightCase => finalValue = rightCase
      );

    expect(finalValue).toBe(1);
  });
});

describe('Right', () => {
  test('setting anything on Right will execute map methods', () => {
    let finalValue;

    Right(2)
      .map(x => x * 3)
      .map(x => `your number is ${x}`)
      .fold(
        leftCase => finalValue = leftCase,
        rightCase => finalValue = rightCase
      );

    expect(finalValue).toBe('your number is 6');
  });
});
