import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../shared/services/axios';

const EditReimbursementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    expenseType: '',
    expenseDate: '',
    amount: '',
    description: '',
    receipt: '',
    // Travel fields
    origin: '',
    destination: '',
    travelMode: '',
    distance: '',
    startDate: '',
    endDate: '',
    // Meal fields
    restaurantName: '',
    mealType: '',
    attendees: '',
    perPersonCost: '',
    // Accommodation fields
    hotelName: '',
    location: '',
    checkinDate: '',
    checkoutDate: '',
    nightsStayed: '',
    // Office Supplies fields
    itemName: '',
    quantity: '',
    vendorName: '',
    invoiceNumber: '',
    // Misc fields
    customNotes: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseTypes = ['Travel', 'Meal', 'Accommodation', 'Office Supplies', 'Misc'];
  const travelModes = ['Flight', 'Train', 'Taxi', 'Personal Car', 'Bus', 'Other'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    };
  }, [images]);

  const fetchRequest = async () => {
    try {
      const { data } = await API.get('/reimbursements');
      const request = data.find(r => r._id === id);
      if (request) {
        setFormData({
          title: request.title || '',
          expenseType: request.expenseType || '',
          expenseDate: request.expenseDate ? request.expenseDate.split('T')[0] : '',
          amount: request.amount || '',
          description: request.description || '',
          receipt: request.receipt || '',
          // Travel fields
          origin: request.origin || '',
          destination: request.destination || '',
          travelMode: request.travelMode || '',
          distance: request.distance || '',
          startDate: request.startDate ? request.startDate.split('T')[0] : '',
          endDate: request.endDate ? request.endDate.split('T')[0] : '',
          // Meal fields
          restaurantName: request.restaurantName || '',
          mealType: request.mealType || '',
          attendees: request.attendees || '',
          perPersonCost: request.perPersonCost || '',
          // Accommodation fields
          hotelName: request.hotelName || '',
          location: request.location || '',
          checkinDate: request.checkinDate ? request.checkinDate.split('T')[0] : '',
          checkoutDate: request.checkoutDate ? request.checkoutDate.split('T')[0] : '',
          nightsStayed: request.nightsStayed || '',
          // Office Supplies fields
          itemName: request.itemName || '',
          quantity: request.quantity || '',
          vendorName: request.vendorName || '',
          invoiceNumber: request.invoiceNumber || '',
          // Misc fields
          customNotes: request.customNotes || ''
        });
        setExistingImages(request.images || []);
      } else {
        setError('Request not found');
      }
    } catch (error) {
      setError('Failed to fetch request details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate dates for Travel expense type
    if (formData.expenseType === 'Travel' && formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError('End date must be after start date');
        return;
      }
    }
    
    // Validate dates for Accommodation expense type
    if (formData.expenseType === 'Accommodation' && formData.checkinDate && formData.checkoutDate) {
      if (new Date(formData.checkoutDate) < new Date(formData.checkinDate)) {
        setError('Check-out date must be after check-in date');
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await API.put(`/reimbursements/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update request');
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per Person Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.perPersonCost}
                  onChange={(e) => setFormData({ ...formData, perPersonCost: e.target.value })}
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.checkinDate}
                  onChange={(e) => setFormData({ ...formData, checkinDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.checkoutDate}
                  onChange={(e) => setFormData({ ...formData, checkoutDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nights Stayed</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.nightsStayed}
                  onChange={(e) => setFormData({ ...formData, nightsStayed: e.target.value })}
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
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
              placeholder="Please provide detailed information about this miscellaneous expense..."
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Request</h1>
        <p className="mt-1 text-gray-600">Update your reimbursement request details</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief title for your reimbursement request"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        {renderDynamicFields()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description / Notes
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receipt URL (optional)
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.receipt}
            onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
          />
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images
            </label>
            <div className="flex gap-2 flex-wrap mb-3">
              {existingImages.map((image, index) => (
                <div key={`existing-${image}-${index}`} className="relative">
                  <img
                    src={`http://localhost:5000/api/images/${image}`}
                    alt={`Current ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newExistingImages = [...existingImages];
                      newExistingImages.splice(index, 1);
                      setExistingImages(newExistingImages);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add New Images (Optional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setImages(Array.from(e.target.files))}
          />
          {images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">
                {images.length} new image(s) selected
              </p>
              <div className="flex gap-2 flex-wrap">
                {images.map((image, index) => (
                  <div key={`new-${image.name}-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update & Resubmit'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReimbursementForm;
