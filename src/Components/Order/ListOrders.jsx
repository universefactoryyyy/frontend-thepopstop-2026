import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import { myOrders, clearErrors } from '../../actions/orderActions'
import { errMsg, formatDate, formatPeso, orderNumber, orderStatusClass } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import ReceiptButton from './ReceiptButton'

// One product goes straight to its review form. Several products go to the order, which lists each one.
const reviewPath = (order) => {
    const productIds = [...new Set((order.orderItems || []).map(item => item.product).filter(Boolean).map(String))]
    if (productIds.length === 1) return `/product/${productIds[0]}#reviews-heading`
    return `/order/${order._id}`
}

// My orders (customer)
const ListOrders = () => {
    const dispatch = useDispatch()
    const { loading, error, orders } = useSelector(state => state.myOrders)

    useEffect(() => {
        dispatch(myOrders())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    const columns = useMemo(() => [
        { field: 'number', headerName: 'Order #', flex: 0.9, minWidth: 110, valueGetter: (value, row) => orderNumber(row) },
        { field: 'createdAt', headerName: 'Date', flex: 1, minWidth: 130, valueFormatter: (value) => formatDate(value) },
        {
            field: 'items',
            headerName: 'Items',
            flex: 0.6,
            minWidth: 80,
            align: 'left',
            headerAlign: 'left',
            valueGetter: (value, row) => row.orderItems.reduce((n, i) => n + i.quantity, 0),
        },
        {
            field: 'totalPrice',
            headerName: 'Total',
            flex: 0.8,
            minWidth: 110,
            align: 'left',
            headerAlign: 'left',
            valueFormatter: (value) => formatPeso(value),
        },
        {
            field: 'orderStatus',
            headerName: 'Status',
            flex: 0.9,
            minWidth: 120,
            renderCell: (params) => <span className={`badge ${orderStatusClass(params.value)}`}>{params.value}</span>,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1.4,
            minWidth: 300,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="pop-grid-actions">
                    <Link to={`/order/${params.row._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    <ReceiptButton order={params.row} />
                    {params.row.orderStatus === 'Delivered' && (
                        <Link to={reviewPath(params.row)} className="btn btn-sm btn-outline-primary">Review</Link>
                    )}
                </div>
            ),
        },
    ], [])

    return (
        <div className="container-xl pop-page">
            <MetaData title="My Orders" />
            <div className="pop-page-header">
                <h2>My Orders</h2>
                <p className="text-muted mb-0">Track your purchases, preview receipts, or download them as PDF</p>
            </div>

            {!loading && orders.length === 0 ? (
                <div className="pop-empty">
                    <h4>No orders yet</h4>
                    <p className="text-muted">When you place an order it will show up here.</p>
                    <Link to="/products" className="btn btn-primary">Start shopping</Link>
                </div>
            ) : (
                <div className="pop-grid-wrap">
                    <DataGrid
                        rows={orders}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={loading}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default ListOrders
