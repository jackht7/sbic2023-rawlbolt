export const pollMessage = async (setUpdateId, offset = undefined) => {
  const filePaths = [];

  try {
    const res = (await (await fetch(`/api/getUpdates?offset=${offset}`)).json())
      .result;

    const messagesWithPhoto = res.filter((obj) => obj.message.photo);
    return messagesWithPhoto;
  } catch (e) {
    console.error('Unable to fetch getUpdates from Telegram Bot');
  }
};

export const getFile = async (fileId) => {
  try {
    const filePath = (
      await (await fetch(`/api/getFile?file_id=${fileId}`)).json()
    ).result.file_path;

    return fetch(`/api/downloadFile/${filePath}`)
      .then((res) => res.blob())
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  } catch (e) {
    console.error('Unable to fetch getFile from Telegram Bot');
  }
};
