import MetaData from '../Layout/MetaData'
import UserSalesChart from './UserSalesChart'
import ProductSalesChart from './ProductSalesChart'

const Reports = () => (
    <div>
        <MetaData title="Reports" />
        <h2 className="mb-4">Reports</h2>

        <div className="row g-4">
            <div className="col-xl-7">
                <UserSalesChart />
            </div>
            <div className="col-xl-5">
                <ProductSalesChart />
            </div>
        </div>
    </div>
)

export default Reports
