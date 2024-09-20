import React, { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { getXPublicClient } from '@/xwagmi/actions';
import { getNetworkDisplayName } from '@/xwagmi/utils';
import { XCallEventType, XTransaction } from '../types';
import { Transaction, TransactionStatus, XCallEventMap, XMessage, XMessageStatus } from '../types';
import { useXCallEventScanner, xCallEventActions } from './useXCallEventStore';
import { xTransactionActions } from './useXTransactionStore';

const jsonStorageOptions = {
  reviver: (key, value: any) => {
    if (!value) return value;

    if (typeof value === 'string' && value.startsWith('BIGINT::')) {
      return BigInt(value.substring(8));
    }

    return value;
  },
  replacer: (key, value) => {
    if (typeof value === 'bigint') {
      return `BIGINT::${value}`;
    } else {
      return value;
    }
  },
};

// TODO: review logic
export const deriveStatus = (
  sourceTransaction: Transaction,
  events: XCallEventMap,
  destinationTransaction: Transaction | undefined = undefined,
): XMessageStatus => {
  if (!sourceTransaction) {
    return XMessageStatus.FAILED;
  }

  if (sourceTransaction.status === TransactionStatus.pending) {
    return XMessageStatus.REQUESTED;
  }

  if (sourceTransaction.status === TransactionStatus.failure) {
    return XMessageStatus.FAILED;
  }

  if (sourceTransaction.status === TransactionStatus.success) {
    if (events[XCallEventType.CallExecuted]) {
      if (
        events[XCallEventType.CallExecuted].code === 1 &&
        destinationTransaction &&
        destinationTransaction.status === TransactionStatus.success
      ) {
        return XMessageStatus.CALL_EXECUTED;
      } else {
        return XMessageStatus.FAILED; // REVERTED?
      }
    }

    if (events[XCallEventType.CallMessage]) {
      return XMessageStatus.CALL_MESSAGE;
    }

    if (events[XCallEventType.CallMessageSent]) {
      return XMessageStatus.CALL_MESSAGE_SENT;
    }

    return XMessageStatus.AWAITING_CALL_MESSAGE_SENT;
  }

  return XMessageStatus.FAILED;
};

type XMessageStore = {
  messages: Record<string, XMessage>;
  get: (id: string | null) => XMessage | undefined;
  add: (xMessage: XMessage) => void;
  updateSourceTransaction: (id: string, { rawTx }: { rawTx: any }) => void;
  updateXMessageEvents: (id: string, events: XCallEventMap) => Promise<void>;
  updateXMessageXCallScannerData: (id: string, data: any) => void;
  remove: (id: string) => void;
  refreshXMessage: (id: string) => void;
  onMessageUpdate: (xMessage: XMessage) => void;
  createSecondaryMessage: (xTransaction: XTransaction, primaryMessage: XMessage) => void;
};

export const useXMessageStore = create<XMessageStore>()(
  // devtools(
  persist(
    immer((set, get) => ({
      messages: {},
      get: (id: string | null) => {
        if (id) return get().messages[id];
      },
      add: (xMessage: XMessage) => {
        if (get().messages[xMessage.id]) return;
        set(state => {
          state.messages[xMessage.id] = xMessage;
        });
      },
      updateSourceTransaction: (id: string, { rawTx }) => {
        const xMessage = get().messages[id];
        if (!xMessage) return;

        const xPublicClient = getXPublicClient(xMessage.sourceChainId);

        const newSourceTransactionStatus = xPublicClient.deriveTxStatus(rawTx);

        const newSourceTransaction = {
          ...xMessage.sourceTransaction,
          rawEventLogs: xPublicClient.getTxEventLogs(rawTx),
          status: newSourceTransactionStatus,
        };
        const newStatus = deriveStatus(newSourceTransaction, xMessage.events, xMessage.destinationTransaction);

        set(state => {
          state.messages[id] = {
            ...xMessage,
            sourceTransaction: newSourceTransaction,
            status: newStatus,
          };
        });
      },
      updateXMessageEvents: async (id: string, events: XCallEventMap) => {
        const xMessage = get().messages[id];
        if (!xMessage) return;

        let destinationTransaction: Transaction | undefined = undefined;

        const oldStatus = xMessage.status;

        const newEvents = {
          ...xMessage.events,
          ...events,
        };

        if (newEvents[XCallEventType.CallExecuted]) {
          const dstXPublicClient = getXPublicClient(xMessage.destinationChainId);

          const destinationTransactionHash = newEvents[XCallEventType.CallExecuted].txHash;
          const rawTx = await dstXPublicClient.getTxReceipt(destinationTransactionHash);

          destinationTransaction = {
            id: destinationTransactionHash,
            hash: destinationTransactionHash,
            xChainId: xMessage.destinationChainId,
            status: dstXPublicClient.deriveTxStatus(rawTx),
            rawEventLogs: dstXPublicClient.getTxEventLogs(rawTx),
            timestamp: Date.now(),
            // timestamp: newEvents[XCallEventType.CallExecuted].timestamp,
          };
        }
        const newStatus = deriveStatus(xMessage.sourceTransaction, newEvents, destinationTransaction);

        const newXMessage = {
          ...xMessage,
          events: newEvents,
          status: newStatus,
          destinationTransaction,
        };

        set(state => {
          state.messages[id] = newXMessage;
        });

        if (newStatus !== oldStatus) {
          console.log('XMessage status changed:', id, oldStatus, '->', newStatus);
          if (newStatus === XMessageStatus.CALL_EXECUTED || newStatus === XMessageStatus.FAILED) {
            xCallEventActions.disableScanner(newXMessage.id);
            get().onMessageUpdate(newXMessage);
          }
        }
      },
      remove: (id: string) => {
        set(state => {
          delete state.messages[id];
        });
      },

      // TODO: is it necessary?
      refreshXMessage: (id: string) => {
        const xMessage = get().messages[id];
        if (!xMessage) return;

        const { sourceTransaction, events, destinationTransaction, status: oldStatus } = xMessage;

        const newStatus = deriveStatus(sourceTransaction, events, destinationTransaction);

        set(state => {
          state.messages[id]['status'] = newStatus;
        });

        get().onMessageUpdate(xMessage);
      },

      updateXMessageXCallScannerData: (id: string, data: any) => {
        const xMessage = get().messages[id];
        const oldStatus = xMessage.status;

        let newStatus;
        switch (data.status) {
          case 'pending':
            newStatus = XMessageStatus.CALL_MESSAGE_SENT;
            break;
          case 'delivered':
            newStatus = XMessageStatus.CALL_MESSAGE;
            break;
          case 'executed':
            newStatus = XMessageStatus.CALL_EXECUTED;
            break;
          case 'rollbacked':
            newStatus = XMessageStatus.ROLLBACKED;
            break;
          default:
            break;
        }

        const newXMessage: XMessage = {
          ...xMessage,
          status: newStatus,
          destinationTransactionHash: data.dest_tx_hash,
          xCallScannerData: data,
        };

        set(state => {
          state.messages[id] = newXMessage;
        });

        if (newStatus !== oldStatus) {
          console.log('XMessage status changed:', id, oldStatus, '->', newStatus);
          if (
            newStatus === XMessageStatus.CALL_EXECUTED ||
            newStatus === XMessageStatus.FAILED ||
            newStatus === XMessageStatus.ROLLBACKED
          ) {
            get().onMessageUpdate(newXMessage);
          }
        }
      },

      onMessageUpdate: (xMessage: XMessage) => {
        console.log('onMessageUpdate', { xMessage });
        const xTransaction = xTransactionActions.get(xMessage.xTransactionId);
        if (!xTransaction) return;

        if (xMessage.isPrimary) {
          if (xMessage.status === XMessageStatus.CALL_EXECUTED) {
            if (xTransaction.secondaryMessageRequired) {
              get().createSecondaryMessage(xTransaction, xMessage);
            } else {
              xTransactionActions.success(xTransaction.id);
            }
          }

          if (xMessage.status === XMessageStatus.FAILED || xMessage.status === XMessageStatus.ROLLBACKED) {
            xTransactionActions.fail(xTransaction.id);
          }
        } else {
          if (xMessage.status === XMessageStatus.CALL_EXECUTED) {
            xTransactionActions.success(xTransaction.id);
          }

          if (xMessage.status === XMessageStatus.FAILED || xMessage.status === XMessageStatus.ROLLBACKED) {
            xTransactionActions.fail(xTransaction.id);
          }
        }
      },

      createSecondaryMessage: (xTransaction: XTransaction, primaryMessage: XMessage) => {
        if (primaryMessage.useXCallScanner) {
          if (!primaryMessage.destinationTransactionHash) {
            throw new Error('destinationTransaction is not found'); // it should not happen
          }

          const sourceChainId = primaryMessage.destinationChainId;
          const destinationChainId = xTransaction.finalDestinationChainId;
          const sourceTransaction = primaryMessage.destinationTransaction;

          const secondaryMessageId = `${sourceChainId}/${sourceTransaction?.hash}`;
          const secondaryMessage: XMessage = {
            id: secondaryMessageId,
            xTransactionId: xTransaction.id,
            sourceChainId,
            destinationChainId,
            sourceTransaction: primaryMessage.sourceTransaction,
            status: XMessageStatus.REQUESTED,
            events: {},
            destinationChainInitialBlockHeight: xTransaction.finalDestinationChainInitialBlockHeight,
            isPrimary: false,
            useXCallScanner: true,
            sourceTransactionHash: primaryMessage.destinationTransactionHash,
          };

          get().add(secondaryMessage);
        } else {
          if (!primaryMessage.destinationTransaction) {
            throw new Error('destinationTransaction is not found'); // it should not happen
          }

          const sourceChainId = primaryMessage.destinationChainId;
          const destinationChainId = xTransaction.finalDestinationChainId;

          const sourceTransaction = primaryMessage.destinationTransaction;

          const secondaryMessageId = `${sourceChainId}/${sourceTransaction?.hash}`;
          const secondaryMessage: XMessage = {
            id: secondaryMessageId,
            xTransactionId: xTransaction.id,
            sourceChainId,
            destinationChainId,
            sourceTransaction: sourceTransaction,
            status: XMessageStatus.REQUESTED,
            events: {},
            destinationChainInitialBlockHeight: xTransaction.finalDestinationChainInitialBlockHeight,
            isPrimary: false,
            useXCallScanner: false,
          };

          get().add(secondaryMessage);
        }
      },
    })),
    {
      name: 'xMessage-store',
      storage: createJSONStorage(() => localStorage, jsonStorageOptions),
      version: 1,
      migrate: (state, version) => {
        return { messages: {} };
      },
    },
  ),
  //   { name: 'XMessageStore' },
  // ),
);

export const xMessageActions = {
  get: (id: string | null) => {
    return useXMessageStore.getState().get(id);
  },

  getOf: (xTransactionId: string, isPrimary: boolean): XMessage | undefined => {
    return Object.values(useXMessageStore.getState().messages).find(
      message => message.isPrimary === isPrimary && message.xTransactionId === xTransactionId,
    );
  },

  add: (xMessage: XMessage) => {
    useXMessageStore.getState().add(xMessage);
  },

  updateSourceTransaction: (id: string, { rawTx }) => {
    useXMessageStore.getState().updateSourceTransaction(id, { rawTx });
  },
  updateXMessageEvents: async (id: string, events: XCallEventMap) => {
    await useXMessageStore.getState().updateXMessageEvents(id, events);
  },
  updateXMessageXCallScannerData: (id: string, data: any) => {
    useXMessageStore.getState().updateXMessageXCallScannerData(id, data);
  },

  remove: (id: string) => {
    useXMessageStore.getState().remove(id);
  },

  getXMessageStatusDescription: (xMessageId: string) => {
    const xMessage = useXMessageStore.getState().get(xMessageId);
    if (!xMessage) {
      return 'xMessage not found.';
    }
    switch (xMessage.status) {
      case XMessageStatus.REQUESTED:
        return `Awaiting confirmation on ${getNetworkDisplayName(xMessage.sourceChainId)}...`;
      case XMessageStatus.FAILED:
        return `Transfer failed.`;
      case XMessageStatus.AWAITING_CALL_MESSAGE_SENT:
        return `Awaiting confirmation on ${getNetworkDisplayName(xMessage.sourceChainId)}...`;
      case XMessageStatus.CALL_MESSAGE_SENT:
        return `Finalising transaction on ${getNetworkDisplayName(xMessage.destinationChainId)}...`;
      case XMessageStatus.CALL_MESSAGE:
        return `Finalising transaction on ${getNetworkDisplayName(xMessage.destinationChainId)}...`;
      case XMessageStatus.CALL_EXECUTED:
        return `Complete.`;
      default:
        return `Unknown state.`;
    }
  },
};

export const useFetchXMessageEvents = (xMessage?: XMessage) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['xMessage-events', xMessage?.id],
    queryFn: async () => {
      if (!xMessage) {
        return null;
      }

      const { sourceChainId, destinationChainId, sourceTransaction } = xMessage;

      let events: XCallEventMap = {};
      if (xMessage.status === XMessageStatus.AWAITING_CALL_MESSAGE_SENT) {
        const srcXPublicClient = getXPublicClient(sourceChainId);
        const callMessageSentEvent = srcXPublicClient.getCallMessageSentEvent(sourceTransaction);
        if (callMessageSentEvent) {
          return {
            [XCallEventType.CallMessageSent]: callMessageSentEvent,
          };
        }
      } else if (
        xMessage.status === XMessageStatus.CALL_MESSAGE_SENT ||
        xMessage.status === XMessageStatus.CALL_MESSAGE
        // || xMessage.status === XMessageStatus.CALL_EXECUTED
      ) {
        const callMessageSentEvent = xMessage.events[XCallEventType.CallMessageSent];
        if (callMessageSentEvent) {
          events = xCallEventActions.getDestinationEvents(destinationChainId, callMessageSentEvent.sn);
        }
      }

      return events;
    },
    refetchInterval: 2000,
    enabled:
      !!xMessage?.id && xMessage?.status !== XMessageStatus.CALL_EXECUTED && xMessage?.status !== XMessageStatus.FAILED,
  });

  return {
    events,
    isLoading,
  };
};

const useFetchTransaction = (transaction: Transaction | undefined) => {
  const { xChainId, hash, status } = transaction || {};
  const { data: rawTx, isLoading } = useQuery({
    queryKey: ['transaction', xChainId, hash],
    queryFn: async () => {
      if (!xChainId) return;

      const xPublicClient = getXPublicClient(xChainId);
      try {
        const rawTx = await xPublicClient.getTxReceipt(hash);
        return rawTx;
      } catch (err: any) {
        console.error(`failed to check transaction hash: ${hash}`, err);
        throw new Error(err?.message);
      }
    },
    refetchInterval: 2000,
    enabled: Boolean(status === TransactionStatus.pending && hash && xChainId),
  });

  return { rawTx, isLoading };
};

const XMessageUpdater = ({ xMessage }: { xMessage: XMessage }) => {
  const { id, destinationChainId, destinationChainInitialBlockHeight, status } = xMessage || {};

  useXCallEventScanner(id);

  const { rawTx } = useFetchTransaction(xMessage?.sourceTransaction);
  const { events } = useFetchXMessageEvents(xMessage);

  useEffect(() => {
    if (id && rawTx) {
      xMessageActions.updateSourceTransaction(id, { rawTx });
    }
  }, [id, rawTx]);

  useEffect(() => {
    if (id && events) {
      xMessageActions.updateXMessageEvents(id, events);
    }
  }, [id, events]);

  useEffect(() => {
    if (id) {
      if (
        status !== XMessageStatus.CALL_EXECUTED &&
        status !== XMessageStatus.FAILED &&
        !xCallEventActions.isScannerEnabled(id)
      ) {
        xCallEventActions.enableScanner(id, destinationChainId, BigInt(destinationChainInitialBlockHeight));
      }
    }
  }, [id, status, destinationChainId, destinationChainInitialBlockHeight]);

  return null;
};

const XMessageUpdater2 = ({ xMessage }: { xMessage: XMessage }) => {
  const { sourceChainId, sourceTransactionHash } = xMessage;
  const { data: message, isLoading } = useQuery({
    queryKey: ['xcallscanner', sourceChainId, sourceTransactionHash],
    queryFn: async () => {
      const url = `https://xcallscan.xyz/api/search?value=${sourceTransactionHash}`;
      const response = await axios.get(url);

      console.log('xcallscanner response', response.data);

      const messages = response.data?.data || [];
      return messages.find((m: any) => m.src_tx_hash === sourceTransactionHash) || null;
    },
    refetchInterval: 2000,
    enabled: Boolean(sourceTransactionHash),
  });

  useEffect(() => {
    if (message && !isLoading) {
      xMessageActions.updateXMessageXCallScannerData(xMessage.id, message);
    }
  }, [message, isLoading, xMessage.id]);

  return null;
};

export const AllXMessagesUpdater = () => {
  const xMessages = useXMessageStore(state => Object.values(state.messages));

  return (
    <>
      {xMessages
        .filter(
          x =>
            x.status !== XMessageStatus.CALL_EXECUTED &&
            x.status !== XMessageStatus.FAILED &&
            x.status !== XMessageStatus.ROLLBACKED,
        )
        .map(xMessage => (
          <>
            {xMessage.useXCallScanner ? (
              <XMessageUpdater2 key={xMessage.id} xMessage={xMessage} />
            ) : (
              <XMessageUpdater key={xMessage.id} xMessage={xMessage} />
            )}
          </>
        ))}
    </>
  );
};
