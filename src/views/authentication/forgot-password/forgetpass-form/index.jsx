import { Box, Chip, FormHelperText, Grow, TextField, Typography } from "@mui/material"
import { Formik } from "formik";
import * as Yup from 'yup';
import useScriptRef from "../../../../hooks/useScriptRef";
import { useState } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { http } from "../../../../api/http";
import { useNavigate } from "react-router-dom";
import CustomLoadingButton from "../../../../components/CustomLoadingButton";
import XSDotFlash from "../../../../components/DotFlash/xsDotFlash";

const ForgetpassForm = ({ ...others }) => {
  const scriptedRef = useScriptRef();
  const [ error, setError ] = useState('');
  const [ loadingBtn, setLoadingBtn ]  = useState(false);
  const navigate = useNavigate();

  const backToLogin = () => {
    navigate('/')
  }
  
  const handleSubmit = async (values) => {
    setError(null);
    setLoadingBtn(true);
    try {
        const response = await http.get(`/find-user?id_number=${values.id_number}`);
        const data = response.data;
        if (response.status === 200) {
            setLoadingBtn(false);
            navigate('/new-password/initiate', {state: { data }})
        } else {
          throw new Error(response.data.error)
        }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (error.response.data.error === "Invalid Id Number") {
            setError("ID Number or password is incorrect.");
            setLoadingBtn(false);
        } else if (error.response.data.error === "Account locked. Please contact support.") {
          setError("Account locked. Please contact support.");
          setLoadingBtn(false);
        } 
      } else {
          setError("Server Error");
          setLoadingBtn(false);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <Grow in={true}><Chip label={<Typography >{error}</Typography>} color="error" sx={{ borderRadius: 1 }} /></Grow>}
      <Formik
        initialValues={{
          id_number: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          id_number: Yup.number().typeError('ID Number must be a number').required('ID Number is required'),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          handleSubmit(values);
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                fullWidth
                label="ID Number"
                variant="outlined"
                type="id_number" 
                value={values.id_number}
                name="id_number"
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.id_number && Boolean(errors.id_number)}
                helperText={touched.id_number && errors.id_number}
              />
            </Box>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <CustomLoadingButton 
                  btnClick={handleSubmit}
                  isDisabled={loadingBtn}
                  btnVariant="contained"
                  label={loadingBtn ? <>Sending Request <Box sx={{ml:1}}><XSDotFlash /></Box></> : 'Send Request'}
                  type="submit"
                  fullWidth={true}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <ArrowBackIosIcon sx={{ fontSize: '12px' }} /><Typography onClick={backToLogin} fontSize="14px" sx={{ '&:hover': { textDecoration: 'underline', cursor: 'pointer' } }}>Return to sign in</Typography>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  )
}

export default ForgetpassForm