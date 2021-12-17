import { act, render } from '@testing-library/react';
import { useAuthentication } from './containers/Authentication';
import App from './App';
import userEvent from '@testing-library/user-event';


jest.mock('@affinidi/wallet-browser-sdk', () => ({
  AffinidiWallet: jest.fn()
}));
jest.mock('@affinidi/wallet-core-sdk', () => ({
  __dangerous: {}
}));
jest.mock('@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService', () => { });
jest.mock('./containers/Authentication')
jest.mock('./containers/Dashboard', () => () => <p>MockDashboard</p>)
jest.mock('./containers/MessageListener', () => () => <p>MockMessageListener</p>)
jest.mock('react-bootstrap', () => {
  return {
    ...jest.requireActual('react-bootstrap'),
    Spinner: () => <p>MockSpinner</p>
  }
})

const mockUseAuthentication = useAuthentication as jest.Mocked<any>;

describe('App test', () => {
  test('UI if logged in', () => {
    mockUseAuthentication.mockReturnValue({
      loading: false,
      authenticated: true,
      signOut: jest.fn()
    })
    const { queryByRole, queryByText } = render(<App />);
    expect(queryByRole('button', { name: 'Login' })).not.toBeTruthy();
    expect(queryByRole('button', { name: 'Logout' })).toBeTruthy();
    expect(queryByText('MockDashboard')).toBeTruthy();
    expect(queryByText('MockMessageListener')).toBeTruthy();
  });

  test('UI if not logged in', () => {
    mockUseAuthentication.mockReturnValue({
      loading: false,
      authenticated: false,
      signOut: jest.fn()
    })
    const { queryByRole, queryByText } = render(<App />);
    expect(queryByRole('button', { name: 'Login' })).toBeTruthy();
    expect(queryByRole('button', { name: 'Logout' })).not.toBeTruthy();
    expect(queryByText('MockDashboard')).not.toBeTruthy();
    expect(queryByText('MockMessageListener')).not.toBeTruthy();
  })

  test('UI if loading', () => {
    mockUseAuthentication.mockReturnValue({
      loading: true,
      authenticated: false,
      signOut: jest.fn()
    })
    const { queryByRole, queryByText } = render(<App />);
    expect(queryByRole('button', { name: 'Login' })).not.toBeTruthy();
    expect(queryByRole('button', { name: 'Logout' })).not.toBeTruthy();
    expect(queryByText('MockDashboard')).not.toBeTruthy();
    expect(queryByText('MockMessageListener')).not.toBeTruthy();
    expect(queryByText('MockSpinner')).toBeTruthy();
  })

  test('Signout button', async () => {

    const mockSignOut = jest.fn()
    mockUseAuthentication.mockReturnValue({
      loading: false,
      authenticated: true,
      signOut: mockSignOut
    })
    const { getByRole } = render(<App />);
    const logoutButton = getByRole('button', { name: 'Logout' });

    await act(async () => {
      await userEvent.click(logoutButton)
    })

    expect(mockSignOut).toBeCalled();
  })

  test('Signout button error', async () => {
    const error = new Error('Test Error')
    const mockSignOut = jest.fn().mockRejectedValue(error);
    mockUseAuthentication.mockReturnValue({
      loading: false,
      authenticated: true,
      signOut: mockSignOut
    })
    jest.spyOn(window, 'alert').mockReturnValue();
    const { getByRole } = render(<App />);
    const logoutButton = getByRole('button', { name: 'Logout' });

    await act(async () => {
      await userEvent.click(logoutButton)
    })

    expect(mockSignOut).toBeCalled();
    expect(window.alert).toBeCalledWith(error.message);
  })
})