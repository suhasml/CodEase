'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// HashConnect and Hedera SDK are optional at runtime. We lazy-load to avoid SSR issues.
type HashConnectType = any;
type HashConnectProviderType = any;
type HashConnectSignerType = any;

export function useHashConnect() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [associating, setAssociating] = useState<boolean>(false);
  const network = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();

  const hcRef = useRef<HashConnectType | null>(null);
  const providerRef = useRef<HashConnectProviderType | null>(null);
  const signerRef = useRef<HashConnectSignerType | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const mod: any = await import('hashconnect');
        const hcMod = (mod && (mod.HashConnect ? mod : mod.default)) as any;
        if (hcMod && hcMod.HashConnect) setIsAvailable(true);
      } catch (_) {
        setIsAvailable(false);
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    // Allow attempting a connection even if availability probe hasn't completed
    // or failed previously. Only gate on an active in-flight connection.
    if (connecting) return null;
    setConnecting(true);
    try {
      const imported: any = await import('hashconnect');
      const hcMod = (imported && (imported.HashConnect ? imported : imported.default)) as any;
      if (!hcMod || !hcMod.HashConnect) {
        throw new Error('HashConnect library not available. Ensure HashPack is installed and refresh the page.');
      }
      // Mark available after a successful import so callers can reflect state
      if (!isAvailable) setIsAvailable(true);
      const { HashConnect, HashConnectProvider, HashConnectSigner } = hcMod;

      const appMetadata = {
        name: 'CodEase DEX',
        description: 'Buy and sell HTS tokens',
        icon: 'https://hashpack.app/assets/hashpack-icon.png',
      };

      const hc = new HashConnect();
      hcRef.current = hc;

      // Initialize, then establish a connect state and generate a pairing string
      await hc.init(appMetadata, network, true);
      const state: any = await hc.connect();
      const pairingString: string = hc.generatePairingString(state, network, true);

      // Prompt the HashPack extension with the pairing string
      // Some versions emit pairing data via an event rather than as a return value
      const waitForPairing = new Promise<any>((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error('HashPack pairing timed out'));
          }
        }, 60000);
        try {
          // Prefer once if available, fallback to on
          const handler = (data: any) => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(data);
            }
          };
          if (hc.pairingEvent && typeof hc.pairingEvent.once === 'function') {
            hc.pairingEvent.once(handler);
          } else if (hc.pairingEvent && typeof hc.pairingEvent.on === 'function') {
            hc.pairingEvent.on(handler);
          }
        } catch (_) {
          // If event wiring fails, allow connectToLocalWallet return value below to be used
        }
      });

      const directResult: any = await hc.connectToLocalWallet(pairingString);
      const pairingData: any = directResult || (await Promise.race([waitForPairing.catch(() => null), Promise.resolve(null)]));

      const _topic = pairingData?.topic || state?.topic || hc?.hcData?.topic || null;
      const _accountId = pairingData?.accountIds?.[0] || pairingData?.accountIdsForTopic?.[_topic]?.[0] || state?.pairingData?.accountIds?.[0] || null;

      if (!_topic || !_accountId) {
        throw new Error('Wallet pairing failed');
      }

      setTopic(_topic);
      setAccountId(_accountId);
      setIsPaired(true);

      // provider/signer for transactions
      const provider = new HashConnectProvider(hc, network, _topic, _accountId);
      providerRef.current = provider;
      const signer = new HashConnectSigner(provider);
      signerRef.current = signer;

      return { accountId: _accountId, topic: _topic };
    } finally {
      setConnecting(false);
    }
  }, [connecting, network, isAvailable]);

  const associateToken = useCallback(async (tokenId: string) => {
    if (!signerRef.current || !accountId) {
      await connect();
    }
    if (!signerRef.current || !accountId) throw new Error('Wallet not connected');

    setAssociating(true);
    try {
      const { TokenAssociateTransaction, AccountId } = await import('@hashgraph/sdk');

      const tx = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([tokenId])
        .freezeWithSigner(signerRef.current);

      const res: any = await tx.executeWithSigner(signerRef.current);
      // Hedera JS SDK returns receipt via client normally; with signer, result includes transactionId, etc.
      return res;
    } finally {
      setAssociating(false);
    }
  }, [accountId, connect]);

  return {
    isAvailable,
    isPaired,
    accountId,
    topic,
    connecting,
    associating,
    connect,
    associateToken,
  } as const;
}


