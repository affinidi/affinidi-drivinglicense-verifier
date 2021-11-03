import React, { FC } from "react";
import { Button, Form } from "react-bootstrap";

import { act, render, waitFor } from '@testing-library/react';
import { useAuthentication, AuthenticationProvider } from './Authentication';
import { AffinidiWallet as Wallet } from '@affinidi/wallet-browser-sdk';
import SdkService from "../services/SdkService";
import userEvent from "@testing-library/user-event";


// Mock component
const TestComponent: FC = () => {
  const { loading, login, signOut } = useAuthentication();

  async function onLogin() {
    try {
      await login.fromLoginAndPassword('someUsername', 'somePassword');
    } catch (err) {
      alert(err.message);
    }
  }

  async function onSignOut() {
    try {
      await signOut();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className='Login'>
      <div className='Form'>
        <Form style={{ width: 280 }}>

          <Button block disabled={loading} onClick={onSignOut}>Sign Out</Button>:
          <Button block disabled={loading} onClick={onLogin}>Login</Button>

        </Form>
      </div>
    </div>

  );
};

// Mock modules
jest.mock('../services/SdkService');
jest.mock('../services/MessageService');
jest.mock("@affinidi/wallet-browser-sdk", () => ({
  AffinidiWallet: jest.fn()
}));
jest.mock("@affinidi/wallet-core-sdk", () => ({
  __dangerous: {}
}));
jest.mock("@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService", () => { });

const mockAlert = jest.spyOn(window, 'alert');
jest.spyOn(console, 'error');

const MockSdkService = SdkService as jest.Mocked<typeof SdkService>;

const networkMember: Wallet = new Wallet('testPassword', 'testEncryptedSeed');
const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = "affinidi:accessToken";

describe('Test Authentication context', () => {

  test('signOut', async () => {
    const sdk = new MockSdkService(await networkMember) as any
    sdk.accessToken = 'someAccessToken'
    MockSdkService.fromLoginAndPassword.mockReturnValue(sdk)
    sdk.signOut.mockImplementation()

    const { getByRole } = render(
      <AuthenticationProvider>
        <TestComponent />
      </AuthenticationProvider>
    )
    const loginButton = getByRole('button', { name: 'Login' });



    await act(async () => {
      await userEvent.click(loginButton)
    })

    const signOutButton = getByRole('button', { name: 'Sign Out' })

    await act(async () => {
      await userEvent.click(signOutButton)
    })

    await waitFor(() => expect(sdk.signOut).toBeCalled());

    expect(localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)).toBeNull();
  })

  test('signOut error', async () => {
    const sdk = new MockSdkService(await networkMember) as any
    sdk.accessToken = 'someAccessToken'
    MockSdkService.fromLoginAndPassword.mockReturnValue(sdk)

    const error = new Error("Some Error");
    sdk.signOut.mockImplementation(() => {
      throw error;
    })

    const { getByRole } = render(
      <AuthenticationProvider>
        <TestComponent />
      </AuthenticationProvider>
    )

    const loginButton = getByRole('button', { name: 'Login' });

    await act(async () => {
      await userEvent.click(loginButton)
    })

    const signOutButton = getByRole('button', { name: 'Sign Out' })

    await act(async () => {
      await userEvent.click(signOutButton)
    })

    await waitFor(() => expect(sdk.signOut).toBeCalled());
    expect(mockAlert).toBeCalledWith(error.message);
  })

  afterEach(() => {
    localStorage.clear();
  })
})
