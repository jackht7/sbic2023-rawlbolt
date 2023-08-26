import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { App } from './App';
import { store } from './store';
import { MetaMaskContextProvider } from './hooks/useMetaMask';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ReduxProvider store={store}>
    <MetaMaskContextProvider>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </MetaMaskContextProvider>
  </ReduxProvider>
);
