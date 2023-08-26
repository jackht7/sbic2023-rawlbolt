import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import {
  Grid,
  ImageList,
  ImageListItem,
  Typography,
  Button,
} from '@mui/material';
import { SiEthereum } from 'react-icons/si';

import _ReportsTable from './ReportsTable';
import { ReportTickets__factory } from '~/../../blockchain';
import { config, isSupportedNetwork } from '~/lib/networkConfig';
import { useMetaMask } from '~/hooks/useMetaMask';
import MainCard from '~/components/MainCard';
import { pollMessage, getFile } from '~/telegram';

export type TicketFormatted = {
  tokenId: string;
};
const ReportsTable = _ReportsTable as unknown as React.JSXElementConstructor<{
  collection: TicketFormatted[];
}>;

const DashboardDefault = () => {
  // TODO: use updateId to keep track latest message
  const [updateId, setUpdateId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const photoListLength = useRef(0);

  // Mint NFT
  const { wallet, setError, updateMints, mints, sdkConnected } = useMetaMask();
  const [isMinting, setIsMinting] = useState(false);
  const [ticketCollection, setTicketCollection] = useState<TicketFormatted[]>(
    []
  );

  const mintTicket = async () => {
    setIsMinting(true);

    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
    // In ethers.js, providers allow you to query data from the blockchain.
    // They represent the way you connect to the blockchain.
    // With them you can only call view methods on contracts and get data from those contract.
    // Signers are authenticated providers connected to the current address in MetaMask.
    const signer = provider.getSigner();

    const factory = new ReportTickets__factory(signer);
    const networkId = import.meta.env.VITE_PUBLIC_NETWORK_ID;

    if (!isSupportedNetwork(networkId)) {
      throw new Error('Deafult Linea Goerli');
    }

    const nftTickets = factory.attach(config[networkId].contractAddress);

    if (wallet.accounts.length > 0) {
      nftTickets
        .mintNFT({
          from: wallet.address,
          value: ethers.utils.parseEther('0.01')._hex,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(async (tx: any) => {
          console.log('minting accepted');
          await tx.wait(1);
          console.log(`Minting complete, mined: ${tx}`);
          updateMints();
          setIsMinting(false);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.log(error);
          setError(error?.code);
          setIsMinting(false);
        });
    }
  };

  const disableMint = !wallet.address || isMinting;

  // fetch photos
  useEffect(() => {
    const intervalId = setInterval(() => {
      pollMessage(setUpdateId).then((messages) => {
        if (messages.length != photoListLength.current) {
          messages.forEach(async (object) => {
            const fileId = object.message.photo.pop().file_id;
            const file = await getFile(fileId);

            while (photoListLength.current < messages.length) {
              setPhotos((oldArray) => [...oldArray, file]);
              photoListLength.current++;
            }
          });
        }
      });
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // fetch minted NFTs
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider
      );
      const signer = provider.getSigner();
      const factory = new ReportTickets__factory(signer);

      if (!isSupportedNetwork(wallet.chainId)) {
        return;
      }

      const nftTickets = factory.attach(config[wallet.chainId].contractAddress);
      const ticketsRetrieved = [];

      nftTickets.walletOfOwner(wallet.address).then((ownedTickets) => {
        const promises = ownedTickets.map(async (token) => {
          const currentTokenId = token.toString();
          const currentTicket = await nftTickets.tokenURI(currentTokenId);

          const base64ToString = window.atob(
            currentTicket.replace('data:application/json;base64,', '')
          );
          const nftData = JSON.parse(base64ToString);

          ticketsRetrieved.push({
            tokenId: currentTokenId,
          });
        });
        Promise.all(promises).then(() => setTicketCollection(ticketsRetrieved));
      });
    }
  }, [wallet.address, mints, wallet.chainId, sdkConnected]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
        {photos && photos.length > 0 && (
          <ImageList sx={{ height: 350 }} cols={3} rowHeight={1}>
            {photos.map((item, index) => (
              <ImageListItem key={index}>
                <img src={item} height={500} width={500} />
                <Button
                  variant="contained"
                  sx={{ marginTop: '5px' }}
                  disabled={disableMint}
                  onClick={mintTicket}
                >
                  <SiEthereum /> {isMinting ? 'Minting...' : 'Mint'} NFT
                </Button>
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Grid>

      <Grid
        item
        md={8}
        sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }}
      />

      {/* row 2 */}
      <Grid item xs={12} md={10} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Recent Reports</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <ReportsTable collection={ticketCollection} />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardDefault;
