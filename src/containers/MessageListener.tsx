/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import JwtService from "@affinidi/tools-common/dist/services/JwtService";
import React, { useEffect, useState } from "react";
import { format } from "timeago.js";
import { useAuthentication } from "./Authentication";
import { createGlobalState } from "react-use";
import { Toast } from "react-bootstrap";

export const useGlobalTokenValue = createGlobalState<string | undefined>();

const KNOWN_TOKEN_TYPS = ["credentialResponse"];
const INTERVAL_MS = 10 * 1000;

const handleError = (
  func: () => Promise<void>
): (() => Promise<void>) => async () => {
  try {
    await func();
  } catch (err) {
    console.error(err);
  }
};

function parseTokenTyp(token: string) {
  try {
    const { payload } = JwtService.fromJWT(token);

    return payload.typ;
  } catch (err) {
    return undefined;
  }
}

type Props = {
  messageList: any[];
  onClick(msg: any): void;
  onClose(msg: any): void;
};

const MessageList = ({ messageList, onClick, onClose }: Props) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        right: 200,
        zIndex: 999,
      }}
    >
      {messageList.map((msg) => (
        <Toast key={msg.id} onClose={() => onClose(msg)}>
          <Toast.Header>
            <strong className="mr-auto">Message</strong>
            <small>{format(msg.createdAt, "en_US")}</small>
          </Toast.Header>
          <a
            href="javascript:void(0);"
            onClick={() => onClick(msg)}
            style={{ textDecoration: "inherit", color: "inherit" }}
            data-testid='ee'
          >
            <Toast.Body data-testid="toast-body">
              You have a message of type <b>{msg.typ}</b>. Click to process.
            </Toast.Body>
          </a>
        </Toast>
      ))}
    </div>
  );
};

const MessageListener = () => {
  // eslint-disable-next-line no-unused-vars
  const [_, setGlobalToken] = useGlobalTokenValue();
  const { message } = useAuthentication();

  const [messageList, setMessageList] = useState<any[]>([]);
  const [removedMessages, setRemovedMessages] = useState<string[]>([]);

  useEffect(() => {
    const handle = window.setInterval(
      handleError(async () => {
        const messages = await message!.getAll();
        if (!Array.isArray(messages) || messages.length <= 0) {
          setMessageList([]);
          return;
        }

        setMessageList(
          messages
            .map((msg) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
              typ: parseTokenTyp(msg.message.token),
            }))
            .filter(({ typ }) => KNOWN_TOKEN_TYPS.includes(typ))
            .sort(({ createdAt: a }, { createdAt: b }) => b - a)
        );
      }),
      INTERVAL_MS
    );

    return () => {
      window.clearInterval(handle);
    };
  }, [message]);

  return (
    <MessageList
      messageList={messageList.filter(
        ({ id }) => !removedMessages.includes(id)
      )}
      onClick={async (msg) => {
        setRemovedMessages([
          ...removedMessages.filter((id) => msg.id !== id),
          msg.id,
        ]);

        setGlobalToken(msg.message.token);

        await message!.delete(msg.id);
      }}
      onClose={async (msg) => {
        setRemovedMessages([
          ...removedMessages.filter((id) => msg.id !== id),
          msg.id,
        ]);

        await message!.delete(msg.id);
      }}
    />
  );
};

export default MessageListener;
