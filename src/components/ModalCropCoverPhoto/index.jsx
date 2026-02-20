import PropTypes from 'prop-types';
import { Box, Button, Modal, Slider } from "@mui/material";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

const ModalCropCoverPhoto = ({ src, modalOpen, setModalOpen, setPreview, setFile  }) => {
    const [slideValue, setSlideValue] = useState(10);
    const cropRef = useRef(null);
    const handleSave = async () => {
      if (cropRef) {
        const dataUrl = cropRef.current.getImage().toDataURL();
        const result = await fetch(dataUrl);
        const blob = await result.blob();
        const file = new File([blob], "croppedImage.png", { type: "image/png" });
        setPreview(URL.createObjectURL(blob));
        setModalOpen(false);
        setFile(file);
      }
    };

    const boxStyle = {
        width: "400px",
        height: "300px",
        display: "flex",
        flexFlow: "column",
        justifyContent: "center",
        alignItems: "center"
      };
      const modalStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      };
  
    return (
      <Modal sx={modalStyle} open={modalOpen}>
        <Box sx={boxStyle}>
          <AvatarEditor
            ref={cropRef}
            image={src}
            style={{ width: "100%", height: "100%" }}
            color={[0, 0, 0, 0.72]}
            scale={slideValue / 10}
            rotate={0}
          />
          <Slider
            min={10}
            max={50}
            sx={{
              margin: "0 auto",
              width: "80%",
              color: "cyan"
            }}
            size="medium"
            defaultValue={slideValue}
            value={slideValue}
            onChange={(e) => setSlideValue(e.target.value)}
          />
          <Box
            sx={{
              display: "flex",
              padding: "10px",
            }}
          >
            <Button
              color="error"
              size="small"
              sx={{ marginRight: "10px"}}
              variant="contained"
              onClick={() => setModalOpen(false)}
            >
              cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    );
};

ModalCropCoverPhoto.propTypes = {
    src: PropTypes.object,
    modalOpen: PropTypes.bool.isRequired,
    setModalOpen: PropTypes.func.isRequired,
    setPreview: PropTypes.func.isRequired,
    setFile: PropTypes.func.isRequired,
};

export default ModalCropCoverPhoto