import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import {
  Grid,
  Typography,
  Button,
  CircularProgress,
  TextareaAutosize,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/system';
import OpenAI from 'openai';
import { SiEthereum } from 'react-icons/si';

import _ReportsTable from './ReportsTable';
import { ReportTickets__factory } from '~/../../blockchain';
import { config, isSupportedNetwork } from '~/lib/networkConfig';
import { useMetaMask } from '~/hooks/useMetaMask';
import MainCard from '~/components/MainCard';
import SelectableImageList from '~/components/SelectableImageList';
import { pollMessages, getFile } from '~/telegram';
import FormikContainer from '~/components/FormikContainer';

export type TicketFormatted = {
  tokenId: string;
};
const ReportsTable = _ReportsTable as unknown as React.JSXElementConstructor<{
  collection: TicketFormatted[];
}>;

const ButtonStyled = styled(Button)({
  textTransform: 'none',
  margin: '4px 4px 0 0',
});

// OpenAI
// TODO: create server to communicate with OpenAI
// Using the openai package in a browser is discouraged
const OPEN_AI_API_KEY = import.meta.env.VITE_PUBLIC_OPEN_AI_API_KEY;
const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const DashboardDefault = () => {
  // TODO: use updateId to keep track latest message
  const [updateId, setUpdateId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [texts, setTexts] = useState([]);
  const [summary, setSummary] = useState('');
  const photoListLength = useRef(0);
  const textListLength = useRef(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [summarySuccessAlert, setSummarySuccessAlert] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Mint NFT
  const { wallet, setError, updateMints, mints, sdkConnected } = useMetaMask();
  const [isMinting, setIsMinting] = useState(false);
  const [ticketCollection, setTicketCollection] = useState<TicketFormatted[]>(
    [],
  );

  const startPolling = () => {
    // reset
    photoListLength.current = 0;
    textListLength.current = 0;

    const intervalId = setInterval(() => {
      pollMessages(setUpdateId).then((messages) => {
        // photos
        const messagesWithPhoto = messages.filter((obj) => obj.message?.photo);
        // texts
        const messagesWithText = messages.filter((obj) => obj.message?.text);

        if (photoListLength.current != messagesWithPhoto?.length) {
          const files = [];
          const promises = messagesWithPhoto?.map(async (object) => {
            const fileId = object.message.photo.pop().file_id;
            const file = await getFile(fileId);
            files.push(file);
          });

          Promise.all(promises).then(() => setPhotos(files));
          photoListLength.current = messagesWithPhoto.length;
        }

        if (textListLength.current != messagesWithText?.length) {
          const texts = [];
          const promises = messagesWithText?.map((object) => {
            texts.push(object.message.text);
          });

          Promise.all(promises).then(() => setTexts(texts));
          setSummary(texts.join(', '));
          textListLength.current = messagesWithText.length;
        }
      });
    }, 5000);
    setPollingInterval(intervalId);
  };

  const stopPolling = () => {
    clearInterval(pollingInterval);
    setPollingInterval(null);
  };

  const generateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'construction report' },
          {
            role: 'user',
            content: `generate summary in point form for the following ${summary}`,
          },
        ],
        model: 'gpt-3.5-turbo',
      });

      setSummary(completion.choices[0].message.content);
      setSummarySuccessAlert(true);
      setGeneratingSummary(false);
    } catch {
      setSummarySuccessAlert(false);
      setGeneratingSummary(false);
    }
  };

  const mintTicket = async () => {
    setIsMinting(true);

    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider,
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

  // fetch minted NFTs
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
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
            currentTicket.replace('data:application/json;base64,', ''),
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
    <Grid container rowSpacing={5} columnSpacing={3}>
      {/* row 1 */}
      <Grid item xs={12}>
        <Typography variant="h5">Dashboard</Typography>
        <Grid item xs={12}>
          <ButtonStyled
            variant="outlined"
            size="small"
            onClick={startPolling}
            disabled={Boolean(pollingInterval)}
          >
            {pollingInterval ? (
              <>
                <CircularProgress size={15} color="info" />
                &nbsp;&nbsp;&nbsp;&nbsp;polling...
              </>
            ) : (
              'poll messages'
            )}
          </ButtonStyled>
          {pollingInterval && (
            <ButtonStyled
              color="error"
              variant="outlined"
              size="small"
              onClick={stopPolling}
            >
              stop
            </ButtonStyled>
          )}
        </Grid>
        {photos && photos.length > 0 && (
          <SelectableImageList
            photos={[...photos]}
            onImagesSelected={setSelectedPhotos}
          />
        )}

        {texts && texts.length > 0 && (
          <>
            <Typography variant="subtitle1">
              ----- Work Summary -----
            </Typography>
            <TextareaAutosize
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              minRows={2}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px 8px 0 8px',
                border: '1px solid #d9d9d9',
              }}
            ></TextareaAutosize>
            <ButtonStyled
              variant="contained"
              size="small"
              onClick={generateSummary}
              disabled={generatingSummary}
            >
              {generatingSummary ? (
                <>
                  <CircularProgress size={15} color="info" />
                  &nbsp;&nbsp;&nbsp;&nbsp;generating...
                </>
              ) : (
                'generate'
              )}
            </ButtonStyled>
          </>
        )}
      </Grid>

      {/* Success Alert */}
      <Snackbar
        open={summarySuccessAlert}
        autoHideDuration={4000}
        onClose={() => setSummarySuccessAlert(false)}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setSummarySuccessAlert(false)}
          severity="success"
        >
          Summary generated successfully!
        </Alert>
      </Snackbar>

      <Grid item xs={12}>
        <Typography variant="h5">Report Template</Typography>
        <MainCard sx={{ mt: 2 }}>
          <FormikContainer photos={selectedPhotos} description={summary} />
        </MainCard>
      </Grid>

      {/* <Button
        variant="contained"
        sx={{ marginTop: '5px' }}
        disabled={disableMint}
        onClick={mintTicket}
      >
        <SiEthereum /> {isMinting ? 'Minting...' : 'Mint'} NFT
      </Button> */}

      <Grid
        item
        md={8}
        sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }}
      />

      {/* row 2 */}
      <Grid item xs={12} md={10} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Draft Reports</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}></MainCard>
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={10} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Recent Submission</Typography>
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
