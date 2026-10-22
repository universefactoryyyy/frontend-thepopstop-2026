import { useEffect, useState } from 'react'
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { fetchSalesPerMonth } from '../../actions/dashboardActions'
import { errMsg, formatPeso, getErrorMessage } from '../../Utils/helpers'
import { palette } from '../../theme'

const pesoTick = (value) => `\u20B1${Number(value).toLocaleString('en-PH')}`
const tooltipPeso = (value) => [formatPeso(value), 'Sales']

const MonthlySalesChart = () => {
    const [year, setYear] = useState(new Date().getFullYear())
    const [years, setYears] = useState([new Date().getFullYear()])
    const [monthly, setMonthly] = useState(null)

    useEffect(() => {
        let ignore = false
        fetchSalesPerMonth(year)
            .then(data => {
                if (ignore) return
                setMonthly(data.salesPerMonth)
                setYears(data.years)
            })
            .catch(e => errMsg(getErrorMessage(e)))
        return () => { ignore = true }
    }, [year])

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h5 className="mb-0">Monthly sales</h5>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        aria-label="Year"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                {monthly ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={palette.beige300} />
                            <XAxis dataKey="month" interval={0} stroke={palette.textMuted} />
                            <YAxis tickFormatter={pesoTick} stroke={palette.textMuted} width={80} />
                            <Tooltip formatter={tooltipPeso} />
                            <Line type="monotone" dataKey="total" name="Sales" stroke={palette.green500} strokeWidth={3} dot={{ r: 4, fill: palette.green500 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <div className="text-center py-5"><div className="spinner-border" role="status" /></div>}
            </div>
        </div>
    )
}

export default MonthlySalesChart
