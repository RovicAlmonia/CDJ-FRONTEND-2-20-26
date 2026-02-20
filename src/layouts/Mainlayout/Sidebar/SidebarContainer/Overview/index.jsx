import ListSubHeaderStyle from "../../../../../components/StyledListItemButton/ListSubHeader";
import ListItemButtonStyle from "../../../../../components/StyledListItemButton/ListItemButton";
import { useNavigate } from "react-router-dom";
import CustomList from "../../../../../components/StyledListItemButton/CustomeList";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Administrative from "./Settings";


const OverView = () => {
  const navigate = useNavigate();
  const navigateDashboard = () => {
    navigate("/dashboard");
  };

const navigateSOA = () => {       {/* ← ADD */}
    navigate("/dashboard/billing");
  };

  return (
    <>
      <CustomList>
        <ListSubHeaderStyle ListLabel="OVERVIEW" />
        <ListItemButtonStyle
          ListbtnLabel="Dashboard"
          activePath="/dashboard"
          MenuClick={navigateDashboard}
          IconChildrens={<DashboardIcon fontSize="small" />}
        />
        <ListItemButtonStyle
          ListbtnLabel="SOA Billing"
          activePath="/dashboard/billing"
          MenuClick={navigateSOA}
          IconChildrens={<DashboardIcon fontSize="small" />}
        />
        <Administrative />
        
      </CustomList>
      
    </>
  );
};

export default OverView;
