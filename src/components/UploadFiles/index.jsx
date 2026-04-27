import  { useState, useEffect } from 'react';

import {
  Box,
  Button,
  LinearProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import uploadFilesService from './uploadFilesService';

const UploadFiles = () => {
  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [currentFile, setCurrentFile] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => {
    uploadFilesService.getFiles().then((response) => {
      setFileInfos(response.data);
    });
  }, []);

  const selectFile = (event) => {
    setSelectedFiles(event.target.files);
  };

  const upload = () => {
    let currentFile = selectedFiles[0];
    setProgress(0);
    setCurrentFile(currentFile);

    uploadFilesService.upload(currentFile, (event) => {
      setProgress(Math.round((100 * event.loaded) / event.total));
    })
      .then((response) => {
        setMessage(response.data.message);
        return uploadFilesService.getFiles();
      })
      .then((files) => {
        setFileInfos(files.data);
      })
      .catch(() => {
        setProgress(0);
        setMessage('Could not upload the file!');
        setCurrentFile(undefined);
      });

    setSelectedFiles(undefined);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        File Upload
      </Typography>

      <input
        type="file"
        onChange={selectFile}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span">
          Choose File
        </Button>
      </label>

      {selectedFiles && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body1">
            {selectedFiles[0].name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={upload}
            sx={{ marginTop: 1 }}
          >
            Upload
          </Button>
        </Box>
      )}

      {currentFile && (
        <Box sx={{ marginTop: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="textSecondary">
            {progress}%
          </Typography>
        </Box>
      )}

      {message && (
        <Typography variant="body1" color="error" sx={{ marginTop: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default UploadFiles;
