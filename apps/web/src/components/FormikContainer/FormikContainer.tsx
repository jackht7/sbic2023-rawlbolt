import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import FormikControl from './FormikControl';
import { Button, Grid } from '@mui/material';

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
  description: Yup.string().required('Required'),
});
const onSubmit = (values, { resetForm }) => {
  console.log('Form data', values);
  resetForm();
};

const FormikContainer = (props) => {
  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
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
                  control="textarea"
                  label="Description"
                  name="description"
                  placeholder="Overall Progress..."
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
    </>
  );
};

export default FormikContainer;
