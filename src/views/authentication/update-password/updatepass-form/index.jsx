import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import useScriptRef from "../../../../hooks/useScriptRef";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CustomLoadingButton from "../../../../components/CustomLoadingButton";
import { useAuth } from "../../../../modules/context/AuthContext";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";
import { http } from "../../../../api/http";

const UpdateFormPass = ({ ...others }) => {
  const scriptedRef = useScriptRef();
  const { accessToken, passwordChanged } = useAuth();

  // Independent loading states
  const [loadingPasswordBtn, setLoadingPasswordBtn] = useState(false);
  const [loadingKeyBtn, setLoadingKeyBtn] = useState(false);

  // Visibility toggles
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showCodeCurrent, setShowCodeCurrent] = useState(false);
  const [showNewCode, setShowNewCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);

  // Password mutation
  const passwordMutation = useMutation({
    mutationFn: (payload) => http.post("/change-password", payload),
    onSuccess: () => {
      toast.success("Password has been updated.");
      setLoadingPasswordBtn(false);
      passwordChanged();
    },
    onError: () => {
      toast.error("Something went wrong!");
      setLoadingPasswordBtn(false);
    },
  });

 

  const handleSubmitPassword = async (values) => {
    setLoadingPasswordBtn(true);
    await passwordMutation.mutateAsync({
      LoginID: accessToken.userID,
      OldPassword: values.currentPassword,
      NewPassword: values.password,
    });
  };


  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        px: 2,
        width: "100%",
      }}
    >
      {/* Password Form */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", px: 2 }}>
        <Formik
          initialValues={{
            currentPassword: "",
            password: "",
            confirmPassword: "",
            submit: null,
          }}
          validationSchema={Yup.object().shape({
            currentPassword: Yup.string().required(
              "Current password is required"
            ),
            password: Yup.string()
              .matches(
                /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:;<>,.?/~`[\]\\=-]).{6,}$/,
                "Must contain at least 1 letter, 1 number, 1 special character, and be at least 6 characters"
              )
              .required("New password is required"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords must match")
              .required("Confirm Password is required"),
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            await handleSubmitPassword(values);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
            }
          }}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            touched,
            values,
          }) => (
            <form noValidate onSubmit={handleSubmit} {...others}>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  fullWidth
                  type={showPasswordCurrent ? "text" : "password"}
                  value={values.currentPassword}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={
                    touched.currentPassword && Boolean(errors.currentPassword)
                  }
                  helperText={touched.currentPassword && errors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswordCurrent((prev) => !prev)
                          }
                        >
                          {showPasswordCurrent ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  name="password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  value={values.confirmPassword}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={
                    touched.confirmPassword && Boolean(errors.confirmPassword)
                  }
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                  isDisabled={loadingPasswordBtn}
                  btnVariant="contained"
                  label={
                    loadingPasswordBtn
                      ? "Changing Password..."
                      : "Change Password"
                  }
                  type="submit"
                  fullWidth
                />
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default UpdateFormPass;
