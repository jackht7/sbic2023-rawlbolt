import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';

import Dot from '~/components/@extended/Dot';
import { TicketFormatted } from '../dashboard';
import { useMetaMask } from '~/hooks/useMetaMask';
import { ReportTickets__factory } from '~/../../blockchain';
import { config, isSupportedNetwork } from '~/lib/networkConfig';

const createData = (trackingNo, name, status, amount) => {
  return { trackingNo, name, status, amount };
};

let rows = [
  createData(84564564, 'Site-A Column-11', 2, 40570),
  createData(98764564, 'Site-B Slab-45', 0, 180139),
  createData(98756325, 'Block-12', 1, 90989),
  createData(98652366, 'Retaining Wall-12', 1, 10239),
];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const headCells = [
  {
    id: 'trackingNo',
    align: 'left' as const,
    disablePadding: false,
    label: 'Tracking No.',
  },
  {
    id: 'name',
    align: 'left' as const,
    disablePadding: true,
    label: 'Report Name',
  },
  {
    id: 'status',
    align: 'left' as const,
    disablePadding: false,

    label: 'Status',
  },
  {
    id: 'amount',
    align: 'right' as const,
    disablePadding: false,
    label: 'Total Amount',
  },
];

const ReportTableHead = ({ order, orderBy }) => {
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
};

ReportTableHead.propTypes = {
  order: PropTypes.string,
  orderBy: PropTypes.string,
};

const OrderStatus = ({ status, tokenId, handleApprove, handleReject }) => {
  let color;
  let title;

  switch (status) {
    case 0:
      color = 'warning';
      title = 'Pending';
      break;
    case 1:
      color = 'success';
      title = 'Approved';
      break;
    case 2:
      color = 'error';
      title = 'Rejected';
      break;
    default:
      color = 'primary';
      title = 'None';
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Dot color={color} />
      <Typography>{title}</Typography>
      {title == 'Pending' && (
        <>
          <Button
            variant="outlined"
            size="small"
            color="success"
            onClick={() => handleApprove(tokenId)}
          >
            approve
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleReject(tokenId)}
          >
            reject
          </Button>
        </>
      )}
    </Stack>
  );
};

OrderStatus.propTypes = {
  status: PropTypes.number,
};

// TODO: refactor for the checking of provider
export default function ReportTable(props) {
  const [order] = useState('asc');
  const [orderBy] = useState('trackingNo');
  const [selected] = useState([]);
  const [reports, setReports] = useState([]);
  const [mintingRequests, setMintingRequests] = useState([]);

  const { wallet, mints, sdkConnected } = useMetaMask();
  const [ticketCollection, setTicketCollection] = useState<TicketFormatted[]>(
    [],
  );

  // fetch minted NFTs
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      );
      const signer = provider.getSigner();
      const factory = new ReportTickets__factory(signer);

      if (!isSupportedNetwork(wallet.chainId)) {
        return;
      }

      const nftTickets = factory.attach(config[wallet.chainId].contractAddress);
      const ticketsRetrieved = [];

      nftTickets.walletOfOwner(wallet.address).then((ownedTickets) => {
        const promises = ownedTickets.map(async (token) => {
          const currentTokenId = token.toString();
          const currentTicket = await nftTickets.tokenURI(currentTokenId);

          const base64ToString = window.atob(
            currentTicket.replace('data:application/json;base64,', ''),
          );
          // const nftData = JSON.parse(base64ToString);

          ticketsRetrieved.push({
            tokenId: currentTokenId,
          });
        });
        Promise.all(promises).then(() => setTicketCollection(ticketsRetrieved));
      });
    }
  }, [wallet.address, mints, wallet.chainId, sdkConnected]);

  // fetch minting requests
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      );
      const signer = provider.getSigner();
      const factory = new ReportTickets__factory(signer);

      if (!isSupportedNetwork(wallet.chainId)) {
        return;
      }

      const nftTickets = factory.attach(config[wallet.chainId].contractAddress);

      const getMintingRequests = async () => {
        const totalSupplyInHex = await nftTickets.totalSupply();
        const totalSupply = parseInt(totalSupplyInHex._hex, 16);
        const mintingRequests = [];

        for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
          const request = await nftTickets.mintingRequests(tokenId);
          mintingRequests.push({ tokenId, ...request });
        }

        return mintingRequests;
      };

      getMintingRequests().then((res) => setMintingRequests(res));

      const intervalId = setInterval(() => {
        getMintingRequests().then((res) => setMintingRequests(res));
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  useEffect(() => {
    const arr = Array.from(ticketCollection);
    const list = [];
    let status = 0;
    arr.forEach((nft: { tokenId: string }) => {
      const request = mintingRequests.find(
        (item) => item.tokenId == nft.tokenId,
      );

      if (request) {
        status = request.approved ? 1 : request.status == 'rejected' ? 2 : 1;
      }

      list.push(
        createData(
          Number(nft.tokenId),
          `Site-A Column-${getRandomInt(1, 50)}`,
          status,
          `${getRandomInt(1, 10000)}`,
        ),
      );
    });

    setReports(list);
  }, [mintingRequests, ticketCollection]);

  const isSelected = (trackingNo) => selected.indexOf(trackingNo) !== -1;

  const handleApprove = (tokenId) => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      );
      const signer = provider.getSigner();
      const factory = new ReportTickets__factory(signer);

      if (!isSupportedNetwork(wallet.chainId)) {
        return;
      }

      const nftTickets = factory.attach(config[wallet.chainId].contractAddress);
      nftTickets.approveMinting(tokenId);
    }
  };

  const handleReject = (tokenId) => {
    if (
      typeof window !== 'undefined' &&
      wallet.address !== null &&
      window.ethereum
    ) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      );
      const signer = provider.getSigner();
      const factory = new ReportTickets__factory(signer);

      if (!isSupportedNetwork(wallet.chainId)) {
        return;
      }

      const nftTickets = factory.attach(config[wallet.chainId].contractAddress);
      nftTickets.approveMinting(tokenId);
    }
  };

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
            {reports.map((row, index) => {
              const isItemSelected = isSelected(row.trackingNo);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.trackingNo}
                  selected={isItemSelected}
                >
                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    align="left"
                  >
                    <Link color="secondary" component={RouterLink} to="">
                      {row.trackingNo}
                    </Link>
                  </TableCell>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">
                    <OrderStatus
                      status={row.status}
                      tokenId={row.trackingNo}
                      handleApprove={handleApprove}
                      handleReject={handleReject}
                    />
                  </TableCell>
                  <TableCell align="right">{row.amount}</TableCell>
                </TableRow>
              );
            })}

            {/* example */}
            {stableSort(rows, getComparator(order, orderBy)).map(
              (row, index) => {
                const isItemSelected = isSelected(row.trackingNo);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.trackingNo}
                    selected={isItemSelected}
                  >
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align="left"
                    >
                      <Link color="secondary" component={RouterLink} to="">
                        {row.trackingNo}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">
                      <OrderStatus
                        status={row.status}
                        tokenId={row.trackingNo}
                        handleApprove={() => {}}
                        handleReject={() => {}}
                      />
                    </TableCell>
                    <TableCell align="right">{row.amount}</TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
