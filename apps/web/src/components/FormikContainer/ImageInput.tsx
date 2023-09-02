import React, { useEffect } from 'react';
import { Box, FormHelperText, InputLabel, Stack } from '@mui/material';
import { Field } from 'formik';

const ImageInput = (props) => {
  const { label, name, photos, formik, ...others } = props;

  // TODO: insert multiple images
  useEffect(() => {
    if (photos.length > 0) {
      formik.setFieldValue(name, photos[0]);
    }
  }, [photos]);

  // hide the value
  return (
    <Stack spacing={1}>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <Field
        type="text"
        id={label}
        name={name}
        value={formik.values[name]}
        style={{ display: 'none' }}
      />
      {photos && photos.length > 0 && (
        <Box
          component="img"
          src={photos}
          sx={{
            maxHeight: { xs: 200, md: 200 },
            maxWidth: { xs: 200, md: 200 },
          }}
        ></Box>
      )}
      {formik.errors[name] && (
        <FormHelperText error id={label}>
          {formik.errors[name]}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default ImageInput;
