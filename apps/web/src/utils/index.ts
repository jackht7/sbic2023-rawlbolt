export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  return `${addr.substring(0, 5)}...${addr.substring(39)}`;
};

export const timeDiff = (date: Date) => {
  var delta = Math.abs(date.valueOf() - new Date().valueOf()) / 1000;
  var result = {};
  var structure = {
    // year: 31536000,
    // month: 2592000,
    // week: 604800,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
  };

  Object.keys(structure).forEach(function (key) {
    result[key] = Math.floor(delta / structure[key]);
    delta -= result[key] * structure[key];
  });
};
