import { toast } from "sonner";
import {http} from "../api/http";
import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/context/AuthContext";

const AccessRightsRoutes = ({ element, requiredFormID }) => {
  const { accessToken } = useAuth();
  const [getAllData, setGetAllData] = useState([]);
  const navigate = useNavigate();
  const fetchedDataRef = useRef(false);

  useEffect(() => {
    const getUserClientData = async () => {
      if (!accessToken || fetchedDataRef.current) return; 
      fetchedDataRef.current = true;
      try {
        const response = await http.get(`/access-rights?user_id=${accessToken.userID}`);
        const formIDs = response.data.map(item => Number(item.form_id)) || [];
        setGetAllData(prevData => {
          if (JSON.stringify(prevData) !== JSON.stringify(formIDs)) {
            return formIDs;
          }
          return prevData;
        });
      } catch (error) {
        console.error('API Error:', error);
        toast.error('Connection failed!');
      }
    };

    getUserClientData();
  }, [accessToken]);

  useEffect(() => {
    if (getAllData.length > 0 && !getAllData.includes(Number(requiredFormID))) {
      navigate('/access-denied', { replace: true }); 
    }
  }, [getAllData, requiredFormID, navigate]);

  if (getAllData.includes(Number(requiredFormID))) {
    return element;
  }
  return null;
};

AccessRightsRoutes.propTypes = {
  requiredFormID: PropTypes.number.isRequired,
  element: PropTypes.element.isRequired,
};

export default AccessRightsRoutes;
