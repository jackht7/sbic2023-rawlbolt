const isProd = import.meta.env.PROD;
const accessToken = import.meta.env.VITE_PUBLIC_TELEGRAM_ACCESS_TOKEN;

// server proxy
let getUpdatesUrl;
let getFileUrl;
let downloadFileUrl;

if (isProd) {
  getUpdatesUrl = `/api/telegram/bot${accessToken}/getUpdates`;
  getFileUrl = `/api/telegram/bot${accessToken}/getFile`;
  downloadFileUrl = `/api/telegram/file/bot${accessToken}`;
} else {
  getUpdatesUrl = '/api/telegram/getUpdates';
  getFileUrl = '/api/telegram/getFile';
  downloadFileUrl = '/api/telegram/downloadFile';
}

export const pollMessage = async (setUpdateId, offset = undefined) => {
  const filePaths = [];

  try {
    const res = (
      await (await fetch(`${getUpdatesUrl}?offset=${offset}`)).json()
    ).result;

    const messagesWithPhoto = res.filter((obj) => obj.message.photo);
    return messagesWithPhoto;
  } catch (e) {
    console.error('Unable to fetch getUpdates from Telegram Bot');
  }
};

export const getFile = async (fileId) => {
  try {
    const filePath = (
      await (await fetch(`${getFileUrl}?file_id=${fileId}`)).json()
    ).result.file_path;

    return fetch(`${downloadFileUrl}/${filePath}`)
      .then((res) => res.blob())
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  } catch (e) {
    console.error('Unable to fetch getFile from Telegram Bot');
  }
};
