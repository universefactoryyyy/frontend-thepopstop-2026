import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import Rating from '@mui/material/Rating'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import {
    getProductReviews,
    getReviewEligibility,
    newReview,
    deleteReview,
    clearErrors,
} from '../../actions/reviewActions'
import { getProductDetails } from '../../actions/productActions'
import { NEW_REVIEW_RESET, DELETE_REVIEW_RESET } from '../../constants/reviewConstants'
import { errMsg, successMsg, formatDate } from '../../Utils/helpers'
import ReviewForm from './ReviewForm'
import UserAvatar from '../Layout/UserAvatar'

// Ratings & reviews of one product:
//  - only customers with a DELIVERED order containing the product can write a review (and later edit it)
//  - the admin can delete any review
const ProductReviews = ({ product, variant = 'all' }) => {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector(state => state.auth)
    const { reviews, loading, error } = useSelector(state => state.reviews)
    const { canReview, review: myReview, loading: eligibilityLoading } = useSelector(state => state.reviewEligibility)
    const { loading: saving, success, isEdit, error: saveError } = useSelector(state => state.newReview)
    const { isDeleted, error: deleteError } = useSelector(state => state.review)

    const isAdmin = Boolean(user && user.role === 'admin')
    const checkingEligibility = Boolean(isAuthenticated && !isAdmin && eligibilityLoading)
    const [ratingFilter, setRatingFilter] = useState(0)

    const visibleReviews = useMemo(
        () => (ratingFilter ? reviews.filter(review => review.rating === ratingFilter) : reviews),
        [reviews, ratingFilter]
    )
    const ratingCounts = useMemo(() => {
        const counts = { 0: reviews.length, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviews.forEach(review => { if (counts[review.rating] !== undefined) counts[review.rating] += 1 })
        return counts
    }, [reviews])

    const refresh = () => {
        dispatch(getProductReviews(product._id))
        dispatch(getProductDetails(product._id))
        if (isAuthenticated) dispatch(getReviewEligibility(product._id))
    }

    useEffect(() => {
        setRatingFilter(0)
        if (variant !== 'form') dispatch(getProductReviews(product._id))
        if (variant !== 'list' && isAuthenticated) dispatch(getReviewEligibility(product._id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, product._id, isAuthenticated, variant])

    useEffect(() => {
        if (variant === 'list') return
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (saveError) { errMsg(saveError); dispatch(clearErrors()) }
        if (deleteError) { errMsg(deleteError); dispatch(clearErrors()) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, saveError, deleteError, variant])

    useEffect(() => {
        if (variant === 'list' || !success) return
        successMsg(isEdit ? 'Review updated' : 'Thanks for your review!')
        dispatch({ type: NEW_REVIEW_RESET })
        refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, variant])

    useEffect(() => {
        if (variant === 'form' || !isDeleted) return
        successMsg('Review deleted')
        dispatch({ type: DELETE_REVIEW_RESET })
        refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDeleted, variant])

    const submitReview = (values) => {
        dispatch(newReview({
            productId: product._id,
            rating: values.rating,
            comment: values.comment,
            anonymous: Boolean(values.anonymous),
        }))
    }

    const confirmDelete = async (review) => {
        const result = await Swal.fire({
            title: 'Delete this review?',
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteReview(review._id))
    }

    const formBlock = !isAuthenticated ? (
        <div className="alert alert-light border" id="write-review">
            <Link to="/login" state={{ from: `/product/${product._id}` }}>Login</Link> to review this product after you have received it.
        </div>
    ) : isAdmin ? null : checkingEligibility ? (
        <div className="card pop-review-form mb-4" id="write-review">
            <div className="card-body text-center py-4">
                <div className="spinner-border" role="status" />
                <p className="text-muted mb-0 mt-2">Opening the review form...</p>
            </div>
        </div>
    ) : canReview ? (
        <ReviewForm initialReview={myReview} onSubmit={submitReview} submitting={saving} />
    ) : (
        <div className="alert alert-light border" id="write-review">
            Only customers who received this product (a delivered order) can review it.
        </div>
    )

    const listBlock = loading && reviews.length === 0 ? (
        <div className="text-center py-3"><div className="spinner-border" role="status" /></div>
    ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to share your thoughts!</p>
    ) : (
        <>
            <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filter reviews by rating">
                <button
                    type="button"
                    className={`btn btn-sm ${ratingFilter === 0 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setRatingFilter(0)}
                >
                    All ({ratingCounts[0]})
                </button>
                {[5, 4, 3, 2, 1].map(stars => (
                    <button
                        type="button"
                        key={stars}
                        className={`btn btn-sm ${ratingFilter === stars ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setRatingFilter(stars)}
                    >
                        {stars} star{stars === 1 ? '' : 's'} ({ratingCounts[stars]})
                    </button>
                ))}
            </div>
            {visibleReviews.length === 0 ? (
                <p className="text-muted">No {ratingFilter}-star reviews yet.</p>
            ) : (
                <ul className="list-unstyled pop-review-list">
                    {visibleReviews.map(review => {
                        const isMine = Boolean(myReview && myReview._id === review._id)
                        const displayUser = review.anonymous ? { name: 'Anonymous' } : review.user
                        return (
                            <li key={review._id} className="card mb-3">
                                <div className="card-body d-flex gap-3">
                                    <UserAvatar user={displayUser} />
                                    <div className="flex-grow-1">
                                        <div className="d-flex flex-wrap justify-content-between align-items-start">
                                            <div>
                                                <strong>{displayUser && displayUser.name ? displayUser.name : 'Former customer'}</strong>
                                                {isMine && <span className="pop-chip ms-2">You</span>}
                                                <div><Rating value={review.rating} readOnly size="small" /></div>
                                            </div>
                                            <small className="text-muted">
                                                {formatDate(review.updatedAt || review.createdAt)}
                                                {review.updatedAt && review.createdAt && new Date(review.updatedAt) - new Date(review.createdAt) > 1000 ? ' (edited)' : ''}
                                            </small>
                                        </div>
                                        {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
                                    </div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm align-self-start"
                                            onClick={() => confirmDelete(review)}
                                            aria-label="Delete review"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </>
    )

    if (variant === 'form') return formBlock

    return (
        <section className={variant === 'list' ? 'mt-5' : 'mt-2'} aria-labelledby="reviews-heading">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h3 id="reviews-heading" className="mb-0 pop-reviews-heading">Ratings &amp; Reviews</h3>
                <span className="d-inline-flex align-items-center gap-1">
                    <Rating value={product.ratings || 0} precision={0.1} readOnly />
                    <strong>{(product.ratings || 0).toFixed(1)}</strong>
                    <span className="text-muted">({product.numOfReviews || 0} review{product.numOfReviews === 1 ? '' : 's'})</span>
                </span>
            </div>
            {variant !== 'list' && formBlock}
            {listBlock}
        </section>
    )
}

export default ProductReviews
