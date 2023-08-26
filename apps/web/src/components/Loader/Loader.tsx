import { Suspense } from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

const LoaderWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 2001,
  width: '100%',
  '& > * + *': {
    marginTop: theme.spacing(2),
  },
}));

const Loader = (Component) => (props) =>
  (
    <Suspense
      fallback={
        <LoaderWrapper>
          <LinearProgress color="primary" />
        </LoaderWrapper>
      }
    >
      <Component {...props} />
    </Suspense>
  );

export default Loader;
