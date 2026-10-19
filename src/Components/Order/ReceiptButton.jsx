import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { downloadReceipt, fetchReceiptBlob } from '../../actions/orderActions'
import { errMsg, getErrorMessage, orderNumber } from '../../Utils/helpers'

// Choose a receipt preview, or save the same PDF.
const ReceiptButton = ({ order, size = 'sm', variant = 'outline-secondary', label = 'Receipt' }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState('')

    useEffect(() => () => {
        if (url) window.URL.revokeObjectURL(url)
    }, [url])

    const close = () => {
        setOpen(false)
        setLoading(false)
        if (url) {
            window.URL.revokeObjectURL(url)
            setUrl('')
        }
    }

    const preview = async () => {
        if (url) return
        setLoading(true)
        try {
            const blobUrl = window.URL.createObjectURL(await fetchReceiptBlob(order))
            setUrl(blobUrl)
        } catch (error) {
            errMsg(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const download = async () => {
        try {
            await downloadReceipt(order)
        } catch (error) {
            errMsg(getErrorMessage(error))
        }
    }

    const buttonClass = `btn btn-${variant}${size ? ` btn-${size}` : ''}`

    return (
        <>
            <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
                {label}
            </button>

            <Modal show={open} onHide={close} size={url ? 'lg' : undefined} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Receipt #{orderNumber(order)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {url ? (
                        <iframe title={`Receipt ${orderNumber(order)}`} src={url} className="pop-receipt-frame" />
                    ) : (
                        <p className="text-muted mb-0">Preview the receipt here, or save it as a PDF.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {!url && (
                        <button type="button" className="btn btn-outline-primary" onClick={preview} disabled={loading}>
                            {loading ? 'Loading...' : 'Preview'}
                        </button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={download} disabled={loading}>Download PDF</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ReceiptButton
