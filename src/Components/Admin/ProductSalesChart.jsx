import { useEffect, useState } from 'react'
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { fetchBrandSales } from '../../actions/dashboardActions'
import { errMsg, formatPeso, getErrorMessage } from '../../Utils/helpers'
import { chartColors } from '../../theme'

const ProductSalesChart = () => {
    const [brands, setBrands] = useState(null)

    useEffect(() => {
        fetchBrandSales()
            .then(setBrands)
            .catch(e => { errMsg(getErrorMessage(e)); setBrands([]) })
    }, [])

    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="mb-3">Revenue by brand</h5>
                {brands === null ? <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
                    : brands.length === 0 ? <p className="text-muted">No sales yet.</p>
                    : (
                        <ResponsiveContainer width="100%" height={360}>
                            <PieChart>
                                <Pie data={brands} dataKey="total" nameKey="brand" outerRadius={110} label={(entry) => entry.brand}>
                                    {brands.map((entry, index) => <Cell key={entry.brand} fill={chartColors[index % chartColors.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => formatPeso(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
            </div>
        </div>
    )
}

export default ProductSalesChart
