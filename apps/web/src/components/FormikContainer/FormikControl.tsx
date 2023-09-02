import React from 'react';
import Input from './Input';
import TextAreaInput from './TextAreaInput';
import DateInput from './DateInput';
import ImageInput from './ImageInput';

function FormikControl(props) {
  const { control, ...rest } = props;
  switch (control) {
    case 'input':
      return <Input {...rest} />;
    case 'textarea':
      return <TextAreaInput {...rest} />;
    case 'date':
      return <DateInput {...rest} />;
    case 'image':
      return <ImageInput {...rest} />;
    default:
      return null;
  }
}

export default FormikControl;
