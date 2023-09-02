import { useState } from 'react';
import { FormHelperText, InputLabel, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { isValid } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import dayjs from 'dayjs';

const DateInput = (props) => {
  const { label, name, formik, placeholder, ...others } = props;
  const [value, setValue] = useState(dayjs('2023-01-01'));
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Stack spacing={1}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel htmlFor={name}>{label}</InputLabel>
        <DateField
          id={label}
          name={name}
          value={value}
          onBlur={() => {
            formik.setFieldTouched(name, true);
            if (!formik.values[name]) {
              formik.setFieldError(name, 'Invalid Date');
            }
          }}
          onChange={(newValue) => {
            if (isValid(newValue['$d'])) {
              const localDate = utcToZonedTime(newValue['$d'], userTimeZone);
              const array = localDate.toString().split(' ');
              const date = array.slice(1, 4).join('-');
              const dateString = `${array[0]} ${date}`;
              formik.setFieldValue(name, dateString);
              formik.setFieldError(name, '');
              setValue(newValue);
            } else {
              formik.setFieldError(name, 'Invalid Date');
              formik.setFieldValue(name, '');
            }
          }}
          onError={formik.handleError}
          format="LL"
          fullWidth
        />
      </LocalizationProvider>
      {formik.touched[name] && formik.errors[name] && (
        <FormHelperText error id={label}>
          {formik.errors[name]}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default DateInput;
