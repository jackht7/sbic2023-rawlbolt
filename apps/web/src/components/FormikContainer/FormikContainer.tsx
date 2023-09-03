import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { ExportSdkClient } from '@exportsdk/client';
import { saveAs } from 'file-saver';
import { Web3Storage } from 'web3.storage';

import FormikControl from './FormikControl';

const initialValues = {
  projectName: '',
  currentDate: '',
  location: '',
  contractor: '',
  imageUrl: '',
  description: '',
};
const validationSchema = Yup.object({
  projectName: Yup.string().required('Required'),
  currentDate: Yup.string().required('Invalid Date'),
  location: Yup.string().required('Required'),
  contractor: Yup.string().required('Required'),
  imageUrl: Yup.string().required('Please select images'),
  description: Yup.string().required('Required'),
});

const accessToken = import.meta.env.VITE_PUBLIC_EXPORTSDK_API_KEY;
const templateId = import.meta.env.VITE_PUBLIC_EXPORTSDK_TEMPLATE_ID;
const exportSdkClient = new ExportSdkClient(accessToken);
const savePdfToFile = (pdfArrayBuffer, fileName) => {
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  saveAs(blob, fileName);
};

const WEB3_STORAGE_API_KEY = import.meta.env.VITE_PUBLIC_WEB3_STORAGE_API_KEY;
const web3StorageClient = new Web3Storage({ token: WEB3_STORAGE_API_KEY });

const FormikContainer = (props) => {
  const { photos, description, onCreated } = props;
  const [creating, setCreating] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    // TODO: put under same folder path?
    const imageFileName = `${values.projectName}-${values.location}.png`;
    const pdfFileName = `${values.projectName}-${values.location}.pdf`;
    setCreating(true);

    fetch(values.imageUrl)
      .then((response) => response.blob())
      .then(async (blob) => {
        const imageCid = await web3StorageClient.put([
          new File([blob], imageFileName),
        ]);

        // overwrite the imageUrl
        values.imageUrl = `https://ipfs.io/ipfs/${imageCid}/${imageFileName}`;

        // store the pdf to ipfs
        const response = await exportSdkClient.renderPdf(templateId, values);
        const pdfCid = await web3StorageClient.put([
          new File([response.data], pdfFileName),
        ]);

        // store the pdf locally
        savePdfToFile(response.data, pdfFileName);

        // pass IPFS hash to parent
        onCreated({
          ipfsHash: pdfCid,
          ipfsFullAddress: `https://ipfs.io/ipfs/${pdfCid}/${pdfFileName}`,
          reportName: pdfFileName,
        });

        setSuccessAlertOpen(true);
        resetForm();
        setCreating(false);
      })
      .catch((error) => {
        setFailureAlertOpen(true);
        setCreating(false);
      });
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikControl
                  control="input"
                  label="Project Name"
                  name="projectName"
                  placeholder="Improvement to AMK Road"
                  formik={formik}
                />
              </Grid>
              <Grid item xs={6}>
                <FormikControl
                  control="input"
                  label="Contractor"
                  name="contractor"
                  placeholder="Builder Pte Ltd"
                  formik={formik}
                />
              </Grid>
              <Grid item xs={6}>
                <FormikControl
                  control="input"
                  label="Location"
                  name="location"
                  placeholder="Site A- Building 10 North"
                  formik={formik}
                />
              </Grid>
              <Grid item xs={6}>
                <FormikControl
                  control="date"
                  label="Date"
                  name="currentDate"
                  formik={formik}
                />
              </Grid>
              <Grid item xs={12}>
                <FormikControl
                  control="image"
                  label="Images"
                  name="imageUrl"
                  formik={formik}
                  photos={photos}
                />
              </Grid>
              <Grid item xs={12}>
                <FormikControl
                  control="textarea"
                  label="Description"
                  name="description"
                  placeholder="Overall Progress..."
                  description={description}
                  formik={formik}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  size="small"
                  disabled={!formik.isValid || creating}
                  variant="contained"
                >
                  {creating ? (
                    <>
                      <CircularProgress size={15} color="info" />
                      &nbsp;&nbsp;&nbsp;&nbsp;creating...
                    </>
                  ) : (
                    'create'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      {/* Success Alert */}
      <Snackbar
        open={successAlertOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessAlertOpen(false)}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setSuccessAlertOpen(false)}
          severity="success"
        >
          Report generated and stored in IPFS successfully!
        </Alert>
      </Snackbar>

      {/* Failure Alert */}
      <Snackbar
        open={failureAlertOpen}
        autoHideDuration={4000}
        onClose={() => setFailureAlertOpen(false)}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setFailureAlertOpen(false)}
          severity="error"
        >
          Error when generating report!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormikContainer;
