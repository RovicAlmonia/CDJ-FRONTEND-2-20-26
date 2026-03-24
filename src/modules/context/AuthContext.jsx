import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types'; 
import {http} from '../../api/http';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [updatePassMessage, setUpdatePassMessage] = useState(null);
  const [error, setError] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(false);

  // ============ CLIENTS STATE ============
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsSummary, setClientsSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    soleProprietor: 0,
    corporation: 0,
    coop: 0,
    others: 0
  });

  // ============ SERVICES STATE ============
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      const decoded = jwtDecode(storedToken);
      setAccessToken(decoded);
      setIsAuthenticated(true);
      checkTokenExpiration(decoded);
    }
  }, []);

  useEffect(() => { 
    let interval;
    if (accessToken) {
      interval = setInterval(() => {
        checkTokenExpiration(accessToken);
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [accessToken]);

  const checkTokenExpiration = (token) => {
    const currentTime = Date.now() / 1000;
    if (token.exp < currentTime) {
      tokenexpirationLogout(); 
    }
  };

  const login = async (username, password) => {
    setLoadingBtn(true);
    try {
      const response = await http.post('/login', { username, password });
      const decoded = jwtDecode(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      setAccessToken(decoded);
      setIsAuthenticated(true);    
      checkTokenExpiration(decoded);
      setLoadingBtn(false);
    } catch (error) {
      console.log(error.response.data.error);
      if (error.response.data.error === "Invalid username or password") {
        setError("Invalid username or password.");
        setLoadingBtn(false);
      } else if (error.response.data.error === "Invalid password!") {
        setError("Invalid password!");
        setLoadingBtn(false);
      } else {
        setError("Server Error");
        setLoadingBtn(false);
      }
    } finally {
      setLoadingBtn(false);
    }
  };

  const logout = async () => {
    try {
      const response = await http.delete('/logout');
      console.log(response)
      if (response.status === 204) {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError("Logout successful");
      } else {
        setError("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setError("An error occurred during logout. Please try again.");
    }
  };

  const passwordChanged = async () => {
    try {
      const response = await http.delete('/logout');
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError("Password has been changed.");
      } else {
        setError("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setError("An error occurred during logout. Please try again.");
    }
  };

  const userUpdatePassword = async (OTP, password) => {
    await http.get(`/update-password?OTP=${OTP}&newPassword=${password}`);
    setUpdatePassMessage('Password updated, please login your new password.');   
  }

  const tokenexpirationLogout = async () => {
    await http.delete('/logout');
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError("Session expired. For security, inactive accounts auto-logout after 1 day. Please log in again. Thank you.");
  }

  const idleLogout = async () => {
    await http.delete('/logout');
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError("Your session has expired due to 15 minutes of inactivity; you have been automatically logged out.");
  }

  // ============ CLIENTS CRUD FUNCTIONS ============
  
  // GET - Clients Summary for Dashboard
  const getClientsSummary = async () => {
    setClientsLoading(true);
    try {
      const response = await http.get('/clients-summary');
      if (response.data.success) {
        setClientsSummary(response.data.data);
      }
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Fetch clients summary error:", error);
      setError("Failed to fetch clients summary");
      setClientsLoading(false);
      throw error;
    }
  };

  // GET - All Clients
  const getClients = async () => {
    setClientsLoading(true);
    try {
      const response = await http.get('/clients');
      if (response.data.success) {
        setClients(response.data.data);
      }
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Fetch clients error:", error);
      setError("Failed to fetch clients");
      setClientsLoading(false);
      throw error;
    }
  };

  // CREATE - Add new client
  const createClient = async (clientData) => {
    setClientsLoading(true);
    try {
      const response = await http.post('/clients', clientData);
      await getClients(); // Refresh the list
      await getClientsSummary(); // Refresh summary
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Create client error:", error);
      setError("Failed to create client");
      setClientsLoading(false);
      throw error;
    }
  };

  // UPDATE - Update client
  const updateClient = async (id, clientData) => {
    setClientsLoading(true);
    try {
      const response = await http.put('/clients', { id, ...clientData });
      await getClients(); // Refresh the list
      await getClientsSummary(); // Refresh summary
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Update client error:", error);
      setError("Failed to update client");
      setClientsLoading(false);
      throw error;
    }
  };

  // DELETE - Delete client
  const deleteClient = async (id) => {
    setClientsLoading(true);
    try {
      const response = await http.delete(`/clients?id=${id}`);
      await getClients(); // Refresh the list
      await getClientsSummary(); // Refresh summary
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Delete client error:", error);
      setError("Failed to delete client");
      setClientsLoading(false);
      throw error;
    }
  };

  // GET - Client by ID
  const getClientById = async (id) => {
    setClientsLoading(true);
    try {
      const response = await http.get(`/client?id=${id}`);
      setClientsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Fetch client error:", error);
      setError("Failed to fetch client");
      setClientsLoading(false);
      throw error;
    }
  };

  // GET - Expiring Tax Clearances
  const getExpiringTaxClearances = async (days = 30) => {
    try {
      const response = await http.get(`/clients-expiring-clearances?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Fetch expiring clearances error:", error);
      throw error;
    }
  };

  // ============ SERVICES CRUD FUNCTIONS ============
  
  // GET - Fetch all services
  const getServices = async () => {
    setServicesLoading(true);
    try {
      const response = await http.get('/students'); // Using your existing endpoint
      setServices(response.data.data);
      setServicesLoading(false);
      return response.data;
    } catch (error) {
      console.error("Fetch services error:", error);
      setError("Failed to fetch services");
      setServicesLoading(false);
      throw error;
    }
  };

  // CREATE - Add new service
  const createService = async (servicesId, particulars, price) => {
    setServicesLoading(true);
    try {
      const response = await http.post('/students', {
        firstname: servicesId,    // Map to your backend fields
        lastname: particulars,
        school: price
      });
      await getServices(); // Refresh the list
      setServicesLoading(false);
      return response.data;
    } catch (error) {
      console.error("Create service error:", error);
      setError("Failed to create service");
      setServicesLoading(false);
      throw error;
    }
  };

  // UPDATE - Update service
  const updateService = async (id, servicesId, particulars, price) => {
    setServicesLoading(true);
    try {
      const response = await http.put('/students', {
        id,
        firstname: servicesId,
        lastname: particulars,
        school: price
      });
      await getServices(); // Refresh the list
      setServicesLoading(false);
      return response.data;
    } catch (error) {
      console.error("Update service error:", error);
      setError("Failed to update service");
      setServicesLoading(false);
      throw error;
    }
  };

  // DELETE - Delete service
  const deleteService = async (id) => {
    setServicesLoading(true);
    try {
      const response = await http.delete(`/students?id=${id}`);
      await getServices(); // Refresh the list
      setServicesLoading(false);
      return response.data;
    } catch (error) {
      console.error("Delete service error:", error);
      setError("Failed to delete service");
      setServicesLoading(false);
      throw error;
    }
  };

  const value = {
    // Auth
    isAuthenticated,
    user,
    accessToken,
    login,
    logout,
    idleLogout,
    userUpdatePassword,
    updatePassMessage,
    error,
    loadingBtn,
    passwordChanged,
    
    // Clients
    clients,
    clientsLoading,
    clientsSummary,
    getClients,
    getClientsSummary,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getExpiringTaxClearances,
    
    // Services
    services,
    servicesLoading,
    getServices,
    createService,
    updateService,
    deleteService
  };
    
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  return useContext(AuthContext)
}