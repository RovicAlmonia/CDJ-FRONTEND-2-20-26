import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../modules/context/AuthContext';

export default function GuestLayout() {
    const { accessToken } = useAuth();
    if (accessToken) {
        if(accessToken.UserLevel == "COA User") return <Navigate to="/dashboard/inquiry" />; // default page upon login of COA Users
        else return <Navigate to="/dashboard" />;
    }
    return (
        <>
            <Outlet />
        </>
    );
}