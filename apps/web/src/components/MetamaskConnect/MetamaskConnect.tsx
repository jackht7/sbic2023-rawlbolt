import { useEffect } from 'react';
import Alert from '@mui/material/Alert';

import { useMetaMask } from '~/hooks/useMetaMask';
import { formatAddress, formatChainAsNum } from '~/utils';
import { config, isSupportedNetwork } from '~/lib/networkConfig';
import { Button } from '~/components/styled/styled';
import styles from './MetamaskConnect.module.css';

export const MetamaskButton = () => {
  const { wallet, isConnecting, connectMetaMask, sdk, sdkConnected } =
    useMetaMask();
  const networkId = import.meta.env.VITE_PUBLIC_NETWORK_ID;
  const walletChainSupported = isSupportedNetwork(wallet.chainId);

  // now chainInfo is strongly typed or fallback to linea if not a valid chain
  const chainInfo = isSupportedNetwork(networkId)
    ? config[networkId]
    : config['0xe704'];

  const switchNetwork = async () => {
    if (walletChainSupported) return;

    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkId }],
    });
  };

  useEffect(() => {
    switchNetwork().catch(console.error);
  }, [wallet.chainId]);

  return (
    // <div className={styles.flexContainer}>
    <>
      {!walletChainSupported && (
        <Alert severity="info">Switch to LineaGoerli</Alert>
      )}

      <div className={styles.rightNav}>
        {wallet.accounts.length < 1 && (
          <Button onClick={connectMetaMask}>Login</Button>
        )}
        <>
          {wallet && wallet.accounts.length > 0 && (
            <>
              {walletChainSupported && (
                <a
                  href={`${chainInfo?.blockExplorer}/address/${chainInfo?.contractAddress}`}
                  target="_blank"
                  title="Open in Block Explorer"
                >
                  {chainInfo.name}
                </a>
              )}
              &nbsp;|&nbsp;
              <a
                href={`https://etherscan.io/address/${wallet}`}
                target="_blank"
                title="Open in Block Explorer"
              >
                {formatAddress(wallet.address)}
              </a>
              <div className={styles.balance}>{wallet.balance} ETH</div>
            </>
          )}
        </>
      </div>
    </>
    // </div>
  );
};
