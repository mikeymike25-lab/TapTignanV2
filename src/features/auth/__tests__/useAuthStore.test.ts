import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { useAuthStore, DEFAULT_USER } from '../useAuthStore';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      registeredMpin: '1234',
      inputMpin: '',
      attemptsRemaining: 5,
      isLocked: false,
      user: DEFAULT_USER,
      biometricsEnabled: true,
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.registeredMpin).toBe('1234');
    expect(state.inputMpin).toBe('');
    expect(state.attemptsRemaining).toBe(5);
    expect(state.isLocked).toBe(false);
    expect(state.user.name).toBe('Juan Dela Cruz');
  });

  it('appends digits up to 4 characters and stops', () => {
    const store = useAuthStore.getState();
    store.appendDigit('1');
    store.appendDigit('2');
    store.appendDigit('3');
    store.appendDigit('4');
    expect(useAuthStore.getState().inputMpin).toBe('1234');

    // Trying to append a 5th digit should be ignored
    store.appendDigit('5');
    expect(useAuthStore.getState().inputMpin).toBe('1234');
  });

  it('deletes digits with backspace', () => {
    const store = useAuthStore.getState();
    store.appendDigit('1');
    store.appendDigit('2');
    expect(useAuthStore.getState().inputMpin).toBe('12');

    store.deleteDigit();
    expect(useAuthStore.getState().inputMpin).toBe('1');

    store.deleteDigit();
    expect(useAuthStore.getState().inputMpin).toBe('');

    // Extra backspace does not crash
    store.deleteDigit();
    expect(useAuthStore.getState().inputMpin).toBe('');
  });

  it('authenticates successfully with correct MPIN (1234)', () => {
    const store = useAuthStore.getState();
    store.appendDigit('1');
    store.appendDigit('2');
    store.appendDigit('3');
    store.appendDigit('4');

    const result = store.verifyMpin('1234');
    expect(result.success).toBe(true);
    expect(result.attemptsLeft).toBe(5);
    expect(result.isLocked).toBe(false);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.inputMpin).toBe('');
  });

  it('handles incorrect MPIN and decrements attempts', () => {
    const store = useAuthStore.getState();
    const result = store.verifyMpin('0000');

    expect(result.success).toBe(false);
    expect(result.attemptsLeft).toBe(4);
    expect(result.isLocked).toBe(false);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.attemptsRemaining).toBe(4);
  });

  it('authenticates with Bantay-Pera duress MPIN (9999) into decoy mode', () => {
    const store = useAuthStore.getState();
    const result = store.verifyMpin('9999');

    expect(result.success).toBe(true);
    expect(result.isDuress).toBe(true);
    expect(result.attemptsLeft).toBe(5);
    expect(result.isLocked).toBe(false);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isDuressMode).toBe(true);
  });

  it('locks account after 5 consecutive failed attempts', () => {
    const store = useAuthStore.getState();
    store.verifyMpin('0001'); // 4 left
    store.verifyMpin('0002'); // 3 left
    store.verifyMpin('0003'); // 2 left
    store.verifyMpin('0004'); // 1 left
    const result = store.verifyMpin('0005'); // 0 left -> locked

    expect(result.success).toBe(false);
    expect(result.attemptsLeft).toBe(0);
    expect(result.isLocked).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isLocked).toBe(true);
    expect(state.attemptsRemaining).toBe(0);
  });

  it('allows biometric unlock when not locked', () => {
    const store = useAuthStore.getState();
    const success = store.authenticateWithBiometrics();

    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('prevents biometric unlock when locked', () => {
    useAuthStore.setState({ isLocked: true });
    const store = useAuthStore.getState();
    const success = store.authenticateWithBiometrics();

    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logs out and resets input buffer', () => {
    useAuthStore.setState({ isAuthenticated: true, inputMpin: '12' });
    const store = useAuthStore.getState();
    store.logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.inputMpin).toBe('');
  });

  it('resets lockout state and restores 5 attempts', () => {
    useAuthStore.setState({ isLocked: true, attemptsRemaining: 0 });
    const store = useAuthStore.getState();
    store.resetLockout();

    const state = useAuthStore.getState();
    expect(state.isLocked).toBe(false);
    expect(state.attemptsRemaining).toBe(5);
  });
});
