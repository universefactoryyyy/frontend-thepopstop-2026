import { useState } from 'react'
import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

const reviewSchema = Yup.object({
    rating: Yup.number().min(1, 'Please select a rating').max(5).required('Please select a rating'),
    comment: Yup.string().trim().max(1000, 'Review cannot exceed 1000 characters'),
    anonymous: Yup.boolean(),
})

const StarPicker = ({ value, onChange }) => {
    const [hover, setHover] = useState(0)
    const shown = hover || value || 0

    return (
        <div
            className="pop-star-picker"
            role="radiogroup"
            aria-label="Your rating"
            onMouseLeave={() => setHover(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= shown
                return (
                    <button
                        type="button"
                        key={star}
                        className={filled ? 'active' : ''}
                        onMouseEnter={() => setHover(star)}
                        onFocus={() => setHover(star)}
                        onClick={() => onChange(star)}
                        aria-checked={value === star}
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                        role="radio"
                    >
                        {filled ? <StarIcon fontSize="inherit" /> : <StarBorderIcon fontSize="inherit" />}
                    </button>
                )
            })}
        </div>
    )
}

// Create a review - or edit the customer's existing one (initialReview)
const ReviewForm = ({ initialReview, onSubmit, submitting }) => {
    const isEdit = Boolean(initialReview)

    return (
        <Formik
            enableReinitialize
            initialValues={{
                rating: initialReview ? initialReview.rating : 0,
                comment: initialReview ? initialReview.comment : '',
                anonymous: initialReview ? Boolean(initialReview.anonymous) : false,
            }}
            validationSchema={reviewSchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
                <FormikForm noValidate className="card pop-review-form mb-4" id="write-review">
                    <div className="card-body">
                        <h5 className="mb-3">{isEdit ? 'Edit your review' : 'Write a review'}</h5>

                        <div className="mb-3">
                            <p className="form-label mb-1" id="rating-label">Your rating</p>
                            <StarPicker
                                value={values.rating}
                                onChange={(next) => {
                                    setFieldValue('rating', next)
                                    setFieldTouched('rating', true, false)
                                }}
                            />
                            {touched.rating && errors.rating && <div className="text-danger small mt-1">{errors.rating}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="comment" className="form-label">Your comment</label>
                            <textarea
                                id="comment"
                                name="comment"
                                rows={3}
                                className={`form-control ${touched.comment && errors.comment ? 'is-invalid' : ''}`}
                                value={values.comment}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Tell other collectors what you think..."
                            />
                            {touched.comment && errors.comment && <div className="invalid-feedback">{errors.comment}</div>}
                            <div className="form-text">Inappropriate words are automatically masked.</div>
                        </div>

                        <div className="form-check mb-3">
                            <input
                                id="anonymous"
                                name="anonymous"
                                type="checkbox"
                                className="form-check-input"
                                checked={values.anonymous}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <label htmlFor="anonymous" className="form-check-label">Post anonymously</label>
                            <div className="form-text">Other shoppers will see Anonymous instead of your name.</div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : isEdit ? 'Update review' : 'Submit review'}
                        </button>
                    </div>
                </FormikForm>
            )}
        </Formik>
    )
}

export default ReviewForm
