import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../Layout/Loader'

// <ProtectedRoute> needs a login. isAdmin limits the page to admins. allow lists the roles that may enter.
const ProtectedRoute = ({ children, isAdmin = false, allow }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth);
    const location = useLocation()
    const allowed = allow || (isAdmin ? ['admin'] : null)

    if (loading) {
        return <Loader />;
    }
    if (!isAuthenticated || !user) {
        return <Navigate to='/login' replace state={{ from: location.pathname }} />
    }
    if (allowed && !allowed.includes(user.role)) {
        return <Navigate to='/' replace />
    }
    return children
};

export default ProtectedRoute;
