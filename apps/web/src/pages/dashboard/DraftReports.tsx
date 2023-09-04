import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { SiEthereum } from 'react-icons/si';
import { ethers } from 'ethers';

import { formatIpfsHash } from '~/utils';
import { ReportTickets__factory } from '~/../../blockchain';
import { useMetaMask } from '~/hooks/useMetaMask';
import { config, isSupportedNetwork } from '~/lib/networkConfig';

const headCells = [
  {
    id: 'ipfsHash',
    align: 'left' as const,
    disablePadding: false,
    label: 'IPFS Hash#',
  },
  {
    id: 'reportName',
    align: 'left' as const,
    disablePadding: true,
    label: 'Report Name',
  },
  {
    id: 'action',
    align: 'right' as const,
    disablePadding: false,
    label: 'Action',
  },
];

function ReportTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

ReportTableHead.propTypes = {
  order: PropTypes.string,
  orderBy: PropTypes.string,
};

export default function DraftReports(props) {
  const { collection } = props;

  const [order] = useState('asc');
  const [orderBy] = useState('ipfsHash');
  const [selected] = useState([]);
  const [isMinting, setIsMinting] = useState(false);

  const { wallet, setError, updateMints, mints, sdkConnected } = useMetaMask();

  const isSelected = (ipfsHash) => selected.indexOf(ipfsHash) !== -1;

  const mintTicket = async () => {
    setIsMinting(true);

    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider,
    );
    const signer = provider.getSigner();

    const factory = new ReportTickets__factory(signer);
    const networkId = import.meta.env.VITE_PUBLIC_NETWORK_ID;

    if (!isSupportedNetwork(networkId)) {
      throw new Error('Deafult Linea Goerli');
    }

    const nftTickets = factory.attach(config[networkId].contractAddress);

    if (wallet.accounts.length > 0) {
      nftTickets
        .mintNFT({
          from: wallet.address,
          value: ethers.utils.parseEther('0.01')._hex,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(async (tx: any) => {
          console.log('minting accepted');
          await tx.wait(1);
          console.log(`Minting complete, mined: ${tx}`);
          updateMints();
          setIsMinting(false);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.log(error);
          setError(error?.code);
          setIsMinting(false);
        });
    }
  };

  // TODO: disable for the minted NFTs
  const disableMint = !wallet.address || isMinting;

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' },
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          sx={{
            '& .MuiTableCell-root:first-of-type': {
              pl: 2,
            },
            '& .MuiTableCell-root:last-of-type': {
              pr: 3,
            },
          }}
        >
          <ReportTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {collection.map((row, index) => {
              const isItemSelected = isSelected(row.ipfsHash);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.ipfsHash}
                  selected={isItemSelected}
                >
                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    align="left"
                  >
                    <Link
                      color="secondary"
                      component={RouterLink}
                      to={row.ipfsFullAddress}
                    >
                      {formatIpfsHash(row.ipfsHash)}
                    </Link>
                  </TableCell>
                  <TableCell align="left">{row.reportName}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={disableMint}
                      onClick={mintTicket}
                    >
                      <SiEthereum /> {isMinting ? 'Minting...' : 'Mint'} NFT
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
