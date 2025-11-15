import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../shared/services/axios';
import { useAuthStore } from '../../../features/authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';
import { countries, getCountryByCode, getStatesByCountry, getCitiesByState, convertCurrency, calculateDistance } from '../../../utils/countryStateData';
import { getImageUrl } from '../../../config/api';

const EditDraftForm = ({ onSuccess }) => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { role } = useUserRole();
  
  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;
  const [formData, setFormData] = useState({
    title: '',
    expenseType: '',
    expenseDate: '',
    amount: '',
    description: '',
    receipt: '',
    facultyEmail: '',
    country: 'IN',
    originState: '', originCity: '', destinationState: '', destinationCity: '', travelMode: '', distance: '', startDate: '', endDate: '',
    restaurantName: '', mealType: '', attendees: '', perPersonCost: '',
    hotelName: '', accommodationState: '', accommodationCity: '', checkinDate: '', checkoutDate: '', nightsStayed: '',
    itemName: '', quantity: '', vendorName: '', invoiceNumber: '',
    customNotes: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [convertedAmountINR, setConvertedAmountINR] = useState(0);

  const expenseTypes = ['Travel', 'Meal', 'Accommodation', 'Office Supplies', 'Misc'];
  const travelModes = ['Flight', 'Train', 'Taxi', 'Personal Car', 'Bus', 'Other'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  
  const selectedCountry = getCountryByCode(formData.country);
  const availableStates = getStatesByCountry(formData.country);
  const originCities = getCitiesByState(formData.country, formData.originState);
  const destinationCities = getCitiesByState(formData.country, formData.destinationState);
  const accommodationCities = getCitiesByState(formData.country, formData.accommodationState);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const { data } = await API.get(`/drafts/${id}`);
        setFormData(data);
        setExistingImages(data.images || []);
      } catch {
        setError('Failed to load draft');
      }
    };
    fetchDraft();
  }, [id]);
  
  // Update converted amount whenever amount or country changes
  useEffect(() => {
    const updateConvertedAmount = async () => {
      if (formData.amount && selectedCountry?.currency && selectedCountry.currency !== 'INR') {
        try {
          const converted = await convertCurrency(parseFloat(formData.amount), selectedCountry.currency, 'INR');
          setConvertedAmountINR(converted);
        } catch (error) {
          console.error('Failed to convert currency:', error);
          setConvertedAmountINR(parseFloat(formData.amount));
        }
      } else {
        setConvertedAmountINR(parseFloat(formData.amount) || 0);
      }
    };
    updateConvertedAmount();
  }, [formData.amount, selectedCountry?.currency]);
  
  // Auto-calculate distance when origin and destination cities change
  useEffect(() => {
    if (formData.originCity && formData.destinationCity && formData.expenseType === 'Travel') {
      const distance = calculateDistance(formData.originCity, formData.destinationCity);
      setFormData(prev => ({ ...prev, distance: distance.toString() }));
    }
  }, [formData.originCity, formData.destinationCity, formData.expenseType]);
  
  // Reset location fields when country changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      originState: '',
      originCity: '',
      destinationState: '',
      destinationCity: '',
      accommodationState: '',
      accommodationCity: ''
    }));
  }, [formData.country]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== '_id' && key !== 'userId' && key !== 'status' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await API.put(`/drafts/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update draft');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDynamicFields = () => {
    switch (formData.expenseType) {
      case 'Travel':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin State</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.originState}
                  onChange={(e) => setFormData({ ...formData, originState: e.target.value, originCity: '' })}
                >
                  <option value="">Select state</option>
                  {availableStates.map((state) => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.originCity}
                  onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                  disabled={!formData.originState}
                >
                  <option value="">Select city</option>
                  {originCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination State</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.destinationState}
                  onChange={(e) => setFormData({ ...formData, destinationState: e.target.value, destinationCity: '' })}
                >
                  <option value="">Select state</option>
                  {availableStates.map((state) => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  disabled={!formData.destinationState}
                >
                  <option value="">Select city</option>
                  {destinationCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.travelMode}
                  onChange={(e) => setFormData({ ...formData, travelMode: e.target.value })}
                >
                  <option value="">Select mode</option>
                  {travelModes.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </>
        );
      case 'Meal':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                >
                  <option value="">Select type</option>
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case 'Accommodation':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.accommodationState}
                  onChange={(e) => setFormData({ ...formData, accommodationState: e.target.value, accommodationCity: '' })}
                >
                  <option value="">Select state</option>
                  {availableStates.map((state) => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.accommodationCity}
                onChange={(e) => setFormData({ ...formData, accommodationCity: e.target.value })}
                disabled={!formData.accommodationState}
              >
                <option value="">Select city</option>
                {accommodationCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'Office Supplies':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      case 'Misc':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Notes</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.customNotes}
              onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Edit Draft</h1>
        <p className="mt-1 text-gray-600">Update your expense draft</p>
      </div>
      
      <div className="max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.expenseType}
                  onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                >
                  <option value="">Select expense type</option>
                  {expenseTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.expenseDate ? formData.expenseDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({selectedCountry?.symbol || '$'}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                {formData.amount && selectedCountry && selectedCountry.currency !== 'INR' && (
                  <div className="mt-1 text-sm text-gray-600">
                    ≈ ₹{convertedAmountINR.toFixed(2)} INR
                  </div>
                )}
              </div>
            </div>

            {renderDynamicFields()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                <div className="flex gap-2 flex-wrap mb-4">
                  {existingImages.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`Current ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Images (optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setImages(Array.from(e.target.files))}
              />
            </div>

            {userRole === 'Student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.facultyEmail}
                  onChange={(e) => setFormData({ ...formData, facultyEmail: e.target.value })}
                />
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Draft'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDraftForm;
