import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TurfForm from '../components/TurfForm';
import { addTurf, updateTurf } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TurfFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const turfToEdit = location.state?.turf; // Get the turf data if editing

    // Initial form state
    const initialFormData = {
        _id: turfToEdit?._id || null,
        name: turfToEdit?.name || '',
        address: turfToEdit?.address || {
            streetAddress1: '',
            streetAddress2: '',
            city: '',
            state: '',
            country: '',
            pinCode: '',
        },
        price: turfToEdit?.price || [
            {
                dayType: 'weekday',
                startTime: '09:00 AM',
                endTime: '05:00 PM',
                price: 500,
            },
            {
                dayType: 'weekend',
                startTime: '09:00 AM',
                endTime: '10:00 PM',
                price: 1000,
            },
        ], // Default pricing rules
        size: turfToEdit?.size || '',
        sports: turfToEdit?.sports || [],
        images: turfToEdit?.images || [],
        number: turfToEdit?.number || '',
        amenities: turfToEdit?.amenities || [],
        rating: turfToEdit?.rating || { score: 0, votes: 0 },
        timing: turfToEdit?.timing || { open: '', close: '' },
        unavailableDates: turfToEdit?.unavailableDates || [],
        slotDuration: turfToEdit?.slotDuration || 15,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target || {};

        if (name === 'open' || name === 'close') {
            setFormData((prev) => ({
                ...prev,
                timing: { ...prev.timing, [name]: value },
            }));
        } else if (name.startsWith('address.')) {
            const [field, subField] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [field]: { ...prev[field], [subField]: value },
            }));
        } else if (name.startsWith('rating.')) {
            const [field, subField] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [field]: { ...prev[field], [subField]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle changes for array fields (e.g., sports, amenities, images, unavailableDates)
    const handleArrayChange = (e, field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== ''), // Remove empty strings
        }));
    };

    // Handle changes for dynamic pricing
    const handlePriceChange = (index, field, value) => {
        const updatedPrice = [...formData.price];
        updatedPrice[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            price: updatedPrice,
        }));
    };

    // Add a new pricing rule
    const addPriceRule = () => {
        setFormData((prev) => ({
            ...prev,
            price: [
                ...prev.price,
                {
                    dayType: 'weekday',
                    startTime: '09:00 AM',
                    endTime: '05:00 PM',
                    price: 500,
                },
            ],
        }));
    };

    // Remove a pricing rule
    const removePriceRule = (index) => {
        const updatedPrice = formData.price.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            price: updatedPrice,
        }));
    };

    // Validate the form
    const validateForm = () => {
        const newErrors = {};

        // Validate required fields
        if (!formData.name.trim()) newErrors.name = '*Name is required';
        if (!formData.address.streetAddress1.trim())
            newErrors.streetAddress1 = '*Street Address 1 is required';
        if (!formData.address.city.trim()) newErrors.city = '*City is required';
        if (!formData.address.state.trim()) newErrors.state = '*State is required';
        if (!formData.address.country.trim()) newErrors.country = '*Country is required';
        if (!formData.address.pinCode.trim()) newErrors.pinCode = '*Pin Code is required';
        if (!formData.price || formData.price.length === 0) newErrors.price = '*At least one pricing rule is required';
        if (!formData.size.trim()) newErrors.size = '*Size is required';
        if (!formData.sports.length) newErrors.sports = '*At least one sport is required';
        if (!formData.images.length) newErrors.images = '*At least one image URL is required';
        if (!formData.number.trim()) newErrors.number = '*Contact number is required';
        if (!formData.amenities.length) newErrors.amenities = '*At least one amenity is required';
        if (!formData.rating.score || formData.rating.score < 0 || formData.rating.score > 10)
            newErrors.ratingScore = '*Rating score must be between 0 and 10';
        if (!formData.rating.votes || formData.rating.votes < 0)
            newErrors.ratingVotes = '*Rating votes must be a positive number';
        if (!formData.timing.open) newErrors.openTime = '*Opening time is required';
        if (!formData.timing.close) newErrors.closeTime = '*Closing time is required';
        if (!formData.slotDuration || formData.slotDuration < 15 || formData.slotDuration > 60)
            newErrors.slotDuration = '*Slot duration must be between 15 and 60 minutes';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Convert unavailableDates strings to Date objects
        const formattedData = {
            ...formData,
            unavailableDates: formData.unavailableDates
                .map((date) => new Date(date))
                .filter((date) => !isNaN(date.getTime())), // Filter out invalid dates
        };

        console.log("Formatted Data:", formattedData); // Debugging line

        setIsLoading(true);
        try {
            const action = turfToEdit ? updateTurf : addTurf;
            const result = await action(formattedData); // Send the formatted data directly
            toast.success(`Turf ${turfToEdit ? 'updated' : 'added'} successfully!`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting form:', error.response?.data || error.message);
            toast.error(`Failed to ${turfToEdit ? 'update' : 'add'} turf.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset the form to its initial state
    const resetForm = () => {
        setFormData(initialFormData);
        setErrors({});
    };

    return (
        <div className="turf-form-page">
            <h1>{turfToEdit ? 'Edit Turf' : 'Add New Turf'}</h1>
            <TurfForm
                formData={formData}
                handleChange={handleChange}
                handleArrayChange={handleArrayChange}
                handlePriceChange={handlePriceChange}
                addPriceRule={addPriceRule}
                removePriceRule={removePriceRule}
                handleSubmit={handleSubmit}
                isEditing={!!turfToEdit}
                isLoading={isLoading}
                resetForm={resetForm}
                errors={errors}
            />
        </div>
    );
};

export default TurfFormPage;