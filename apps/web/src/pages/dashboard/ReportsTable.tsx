import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
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

import Dot from '~/components/@extended/Dot';
import { TicketFormatted } from '../dashboard';

function createData(trackingNo, name, order, status, amount) {
  return { trackingNo, name, order, status, amount };
}

let rows = [
  createData(84564564, 'Site-A Column-11', 40, 2, 40570),
  createData(98764564, 'Site-B Slab-45', 300, 0, 180139),
  createData(98756325, 'Block-12', 355, 1, 90989),
  createData(98652366, 'Retaining Wall-12', 50, 1, 10239),
];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// type HeadCell = {
//   align: React.CSSProperties;
//   [key: string]: any;
// };

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
    id: 'order',
    align: 'right' as const,
    disablePadding: false,
    label: 'Total Order',
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

const OrderStatus = ({ status }) => {
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
    </Stack>
  );
};

OrderStatus.propTypes = {
  status: PropTypes.number,
};

export default function ReportTable(props: { collection: TicketFormatted[] }) {
  const [order] = useState('asc');
  const [orderBy] = useState('trackingNo');
  const [selected] = useState([]);
  const [reports, setReports] = useState([]);

  // TODO: create entries via form
  useEffect(() => {
    const arr = Array.from(props.collection);
    const list = [];
    arr.forEach((nft: { tokenId: string }) => {
      list.push(
        createData(
          Number(nft.tokenId),
          `Site-A Column-${getRandomInt(1, 50)}`,
          40,
          Number(`${getRandomInt(0, 2)}`),
          `${getRandomInt(1, 10000)}`
        )
      );
    });
    setReports((oldArray) => [...oldArray, ...list]);
  }, [props.collection]);

  const isSelected = (trackingNo) => selected.indexOf(trackingNo) !== -1;

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
                  <TableCell align="right">{row.order}</TableCell>
                  <TableCell align="left">
                    <OrderStatus status={row.status} />
                  </TableCell>
                  <TableCell align="right">{row.amount}</TableCell>
                </TableRow>
              );
            })}
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
                    <TableCell align="right">{row.order}</TableCell>
                    <TableCell align="left">
                      <OrderStatus status={row.status} />
                    </TableCell>
                    <TableCell align="right">{row.amount}</TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
