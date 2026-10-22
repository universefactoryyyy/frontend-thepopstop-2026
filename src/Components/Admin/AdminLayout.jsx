import { Outlet } from 'react-router-dom'
import Sidebar from './SideBar'

const AdminLayout = () => (
    <div className="container-fluid pop-admin">
        <div className="row g-4">
            <aside className="col-lg-2 col-md-3">
                <Sidebar />
            </aside>
            <main className="col-lg-10 col-md-9">
                <Outlet />
            </main>
        </div>
    </div>
)

export default AdminLayout
