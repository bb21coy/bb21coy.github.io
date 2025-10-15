import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";
import Loading from "../general/Loading";
import NotFound from "../general/NotFound"; // it's lazy in your code; you can import lazily too

function UserPermissions({ allowedAccountTypes = [], apptAllowed = false, children }) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.account_name !== null) setLoading(false);
    }, [user]);

    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;

    const ok = allowedAccountTypes.includes(user.account_type) || (apptAllowed && user.appointment !== null);
    return ok ? children : <NotFound />;
}

export default UserPermissions;