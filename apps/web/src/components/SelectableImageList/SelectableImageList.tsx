import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useState, useEffect } from 'react';

const SelectableImageList = ({ photos, onImagesSelected }) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const toggleImageSelection = (image) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(
        selectedImages.filter((selectedImage) => selectedImage !== image),
      );
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  useEffect(() => {
    onImagesSelected(selectedImages);
  }, [selectedImages]);

  return (
    <ImageList
      sx={{ height: '250px', marginTop: '20px' }}
      cols={4}
      rowHeight={100}
    >
      {photos.map((item, index) => (
        <ImageListItem key={item} sx={{ marginBottom: '30px' }}>
          <img src={item} />
          <ImageListItemBar
            position="top"
            actionIcon={
              <IconButton
                onClick={() => toggleImageSelection(item)}
                color="primary"
              >
                {selectedImages.includes(item) ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )}
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default SelectableImageList;
