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

import ReportsTable from './ReportsTable';
import DraftReports from './DraftReports';
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

const ButtonStyled = styled(Button)({
  margin: '4px 4px 0 0',
});

// TODO: create server to communicate with OpenAI
// Using the openai package in a browser is discouraged
const OPEN_AI_API_KEY = import.meta.env.VITE_PUBLIC_OPEN_AI_API_KEY;
const openai = OPEN_AI_API_KEY
  ? new OpenAI({
      apiKey: OPEN_AI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  : undefined;

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
  const [draftReports, setDraftReports] = useState([]);

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
    try {
      if (openai) {
        setGeneratingSummary(true);
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
      }
    } catch {
      setSummarySuccessAlert(false);
      setGeneratingSummary(false);
    }
  };

  const fetchDraftReports = (newItem) => {
    setDraftReports((array) => [...array, newItem]);
  };

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
          <FormikContainer
            photos={selectedPhotos}
            description={summary}
            onCreated={fetchDraftReports}
          />
        </MainCard>
      </Grid>

      {/* row 2 */}
      {draftReports && draftReports.length > 0 && (
        <Grid item xs={12} md={10} lg={10}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">Draft Reports</Typography>
            </Grid>
            <Grid item />
          </Grid>
          <MainCard sx={{ mt: 2 }} content={false}>
            <DraftReports collection={draftReports}></DraftReports>
          </MainCard>
        </Grid>
      )}

      {/* row 3 */}
      <Grid item xs={12} md={10} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Recent Submission</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <ReportsTable />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardDefault;
