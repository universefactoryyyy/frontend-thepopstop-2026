import { useEffect, useState } from 'react'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { fetchCustomerSales } from '../../actions/dashboardActions'
import { errMsg, formatPeso, getErrorMessage } from '../../Utils/helpers'
import { palette } from '../../theme'

const pesoTick = (value) => `\u20B1${Number(value).toLocaleString('en-PH')}`

const UserSalesChart = () => {
    const [customers, setCustomers] = useState(null)

    useEffect(() => {
        fetchCustomerSales()
            .then(setCustomers)
            .catch(e => { errMsg(getErrorMessage(e)); setCustomers([]) })
    }, [])

    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="mb-3">Top customers by sales</h5>
                {customers === null ? <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
                    : customers.length === 0 ? <p className="text-muted">No sales yet.</p>
                    : (
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={customers} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={palette.beige300} />
                                <XAxis type="number" tickFormatter={pesoTick} stroke={palette.textMuted} />
                                <YAxis type="category" dataKey="name" width={110} stroke={palette.textMuted} />
                                <Tooltip formatter={(value) => [formatPeso(value), 'Sales']} />
                                <Bar dataKey="total" name="Sales" fill={palette.green300} radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
            </div>
        </div>
    )
}

export default UserSalesChart
