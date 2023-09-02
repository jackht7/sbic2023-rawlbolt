import React from 'react';
import {
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
} from '@mui/material';

const Input = (props) => {
  const { label, name, formik, placeholder, ...others } = props;

  return (
    <Stack spacing={1}>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <OutlinedInput
        id={label}
        name={name}
        value={formik.values[name]}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        placeholder={placeholder}
        fullWidth
      />
      {formik.touched[name] && formik.errors[name] && (
        <FormHelperText error id={label}>
          {formik.errors[name]}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default Input;
