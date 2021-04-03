import React, {useContext, useEffect, useState} from 'react';
import {Button, Form, FormControl, FormFile} from 'react-bootstrap';
import 'pages/verifier/verifier.scss'
import ApiService from 'utils/apiService';
import {GetSavedCredentialsOutput, UnsignedW3cCredential, W3cCredential} from 'utils/apis';
import {TokenSigner} from 'jwt-js';
import config from 'utils/config';
import {useAuthentication} from 'utils/Authentication';

interface State {
  currentUnsignedVC: UnsignedW3cCredential | null,
  currentSignedVC: W3cCredential | null,
  isCurrentVCVerified: boolean,
  storedVCs: GetSavedCredentialsOutput,
  isLoadingStoredVCs: boolean
}

interface ICredResToken {
  credentialShareRequestToken: string;
  credentialShareResponseToken: string;
  isHolderMustBeSubject: boolean;
}

/**
 * Stateful component responsible for rendering the showcase of this app.
 * The basic parts of SSI cycle are covered with this component.
 * */
const Verifier = () => {
  const [state, setState] = useState<State>({
    currentUnsignedVC: null,
    currentSignedVC: null,
    isCurrentVCVerified: false,
    storedVCs: [],
    isLoadingStoredVCs: true
  });
  const { sdk } = useAuthentication();
  const [requestToken, setRequestToken] = useState<string>('');
  const [resToken, setResToken] = useState<string>('');


  const generateShareCredReqToken = async () => {
    console.log('Generating Share Credential Request Token');
    const input = {
      "credentialRequirements": [
        {
          "type": [
            "IDDocumentCredentialPersonV1"
          ]
        }
      ]
    }
    try {
      // const result = await ApiService.generateShareCredReqJWT(input);
      // console.log(result);

      // const token = new TokenSigner(result.credentialShareRequest.header.alg, config.jwtPrivateKey).sign(result.credentialShareRequest.payload)
      // console.log(token);
      // setRequestToken(token);

      const shareRequestToken = await sdk!.generateCredentialShareRequestToken(
        [{ type: 'IDDocumentCredentialPersonV1'}]
      );
      console.log(shareRequestToken)

    } catch(error){
      console.log(error);
    }
  }

  const sendShareCredReqToken = async () => {
    console.log('Sending Share Credential Request Token');
  }

  const verifyShareCredResToken = async () => {
    console.log('Verifying Share Credential Request Token');
    const input: ICredResToken = {
      credentialShareRequestToken: requestToken,
      credentialShareResponseToken: resToken,
      isHolderMustBeSubject: true
    }
    
    try {
      const result = await ApiService.verifyShareCredResJWT(input);
      console.log(result)
    } catch(error){
      console.log(error)
    }
    
  }

  return (
    <div className='tutorial-verifier'>
      <span className='tutorial__step-text'>
        <strong>Step 1:</strong> Generate Share Credential Request Token
      </span>
      <Button onClick={generateShareCredReqToken}>Generate Share Credential Request Token</Button>

      <span className='tutorial__step-text'>
        <strong>Step 2:</strong> Send generated Request Token
      </span>
      <Button onClick={sendShareCredReqToken}>Send Share Credential Request Token</Button>

      <span className='tutorial__step-text'>
        <strong>Step 3:</strong> Verify Share Credential Response Token
      </span>
      <Form.Label>Share Response Token</Form.Label>
        <Form.Control
          type="text"
          value={resToken}
          autoComplete="off"
          onChange={(e) => setResToken(e.target.value)}
        />
      <Button onClick={verifyShareCredResToken}>Verify Share Credential Response Token</Button>


    </div>
  )
}

export default Verifier;
