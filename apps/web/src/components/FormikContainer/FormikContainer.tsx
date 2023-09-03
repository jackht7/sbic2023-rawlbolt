import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Grid, Snackbar, Alert } from '@mui/material';
import { ExportSdkClient } from '@exportsdk/client';
import { saveAs } from 'file-saver';

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
const client = new ExportSdkClient(accessToken);
const savePdfToFile = (pdfArrayBuffer, fileName) => {
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  saveAs(blob, fileName);
};

const FormikContainer = (props) => {
  const { photos, description } = props;
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await client.renderPdf(templateId, values);
      savePdfToFile(response.data, `${values.projectName}- ${values.location}`);

      setSuccessAlertOpen(true);
      resetForm();
    } catch {
      setFailureAlertOpen(true);
    }
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
                  disabled={!formik.isValid}
                  variant="contained"
                >
                  Generate
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
          Report generated successfully!
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
          severity="success"
        >
          Error when generating report!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormikContainer;
