import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { convertCurrency, getSupportedCurrencies } from '../../../utils/countryStateData.js';
import { UPLOAD_URL } from '../../../config/api.js';

const ExpenseItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    currency: 'INR',
    paymentMethod: '',

    country: 'IN',
    state: '',
    city: '',
    fromCountry: 'IN',
    fromState: '',
    fromCity: '',
    toCountry: 'IN',
    toState: '',
    toCity: '',
    receiptImage: '',
    ...item
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.receiptImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [amountInINR, setAmountInINR] = useState('');

  const [countries] = useState(Country.getAllCountries());

  const [fromStates, setFromStates] = useState([]);
  const [fromCities, setFromCities] = useState([]);
  const [toStates, setToStates] = useState([]);
  const [toCities, setToCities] = useState([]);
  const [currencies] = useState(getSupportedCurrencies());


  useEffect(() => {
    if (formData.fromCountry) {
      setFromStates(State.getStatesOfCountry(formData.fromCountry));
    }
  }, [formData.fromCountry]);

  // Update INR amount whenever amount or currency changes
  useEffect(() => {
    const updateConvertedAmount = async () => {
      if (formData.amount) {
        if (formData.currency !== 'INR') {
          try {
            const converted = await convertCurrency(parseFloat(formData.amount), formData.currency, 'INR');
            setAmountInINR(converted);
          } catch (error) {
            console.error('Failed to convert currency:', error);
            setAmountInINR(parseFloat(formData.amount));
          }
        } else {
          // If currency is already INR, just use the amount as is
          setAmountInINR(parseFloat(formData.amount));
        }
      } else {
        setAmountInINR('');
      }
    };
    updateConvertedAmount();
  }, [formData.amount, formData.currency]);

  useEffect(() => {
    if (formData.fromState) {
      setFromCities(City.getCitiesOfState(formData.fromCountry, formData.fromState));
    }
  }, [formData.fromState, formData.fromCountry]);

  useEffect(() => {
    if (formData.toCountry) {
      setToStates(State.getStatesOfCountry(formData.toCountry));
    }
  }, [formData.toCountry]);

  useEffect(() => {
    if (formData.toState) {
      setToCities(City.getCitiesOfState(formData.toCountry, formData.toState));
    }
  }, [formData.toState, formData.toCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Auto-calculate nights for accommodation
    if (formData.category.startsWith('Accommodation') && (name === 'checkInDate' || name === 'checkOutDate')) {
      if (newFormData.checkInDate && newFormData.checkOutDate) {
        const checkIn = new Date(newFormData.checkInDate);
        const checkOut = new Date(newFormData.checkOutDate);
        if (checkOut >= checkIn) {
          const timeDiff = checkOut.getTime() - checkIn.getTime();
          const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
          newFormData.numberOfNights = nights;
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!receiptFile && !formData.receiptImage) {
      alert('Receipt image is required');
      return;
    }

    setIsUploading(true);
    let receiptImageUrl = formData.receiptImage;

    try {
      if (receiptFile) {
        const imageFormData = new FormData();
        imageFormData.append('receiptImage', receiptFile);
        
        const response = await fetch(`${UPLOAD_URL}/expense-receipt`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: imageFormData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }
        
        const result = await response.json();
        receiptImageUrl = result.imageUrl;
      }

      onSave({ 
        ...formData, 
        amountInINR: parseFloat(amountInINR) || parseFloat(formData.amount) || 0, 
        amount: parseFloat(formData.amount),
        receiptImage: receiptImageUrl
      });
    } catch (error) {
      alert('Failed to upload receipt image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderCategorySpecificFields = () => {
    const category = formData.category;

    if (category.startsWith('Travel - Air')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Airline</label>
              <input type="text" name="airline" value={formData.airline || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Flight Number</label>
              <input type="text" name="flightNumber" value={formData.flightNumber || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ticket Class</label>
            <select name="ticketClass" value={formData.ticketClass || ''} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Select Class</option>
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>
        </>
      );
    }

    if (category.startsWith('Travel - Train')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Train Name</label>
              <input type="text" name="trainName" value={formData.trainName || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Train Number</label>
              <input type="text" name="trainNumber" value={formData.trainNumber || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ticket Type</label>
            <select name="ticketType" value={formData.ticketType || ''} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Select Type</option>
              <option value="Sleeper">Sleeper</option>
              <option value="AC 3 Tier">AC 3 Tier</option>
              <option value="AC 2 Tier">AC 2 Tier</option>
              <option value="AC 1 Tier">AC 1 Tier</option>
              <option value="General">General</option>
            </select>
          </div>
        </>
      );
    }

    if (category.startsWith('Accommodation')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in Date</label>
              <input type="date" name="checkInDate" value={formData.checkInDate || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out Date</label>
              <input 
                type="date" 
                name="checkOutDate" 
                value={formData.checkOutDate || ''} 
                onChange={handleChange} 
                min={formData.checkInDate || ''}
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{category.includes('Hotel') ? 'Hotel Name' : 'Facility Name'}</label>
              <input type="text" name={category.includes('Hotel') ? 'hotelName' : 'facilityName'} 
                     value={formData.hotelName || formData.facilityName || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Nights (Auto-calculated)</label>
              <input type="number" name="numberOfNights" value={formData.numberOfNights || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Auto-calculated from dates" />
            </div>
          </div>
        </>
      );
    }

    if (category.startsWith('Meals')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Restaurant/Vendor</label>
              <input type="text" name="restaurantName" value={formData.restaurantName || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Attendees</label>
              <input type="number" name="numberOfAttendees" value={formData.numberOfAttendees || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
        </>
      );
    }

    if (category.startsWith('Conference')) {
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">{category.includes('Registration') ? 'Conference/Event Name' : 'Workshop/Seminar Title'}</label>
            <input type="text" name="eventName" value={formData.eventName || ''} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{category.includes('Registration') ? 'Location' : 'Hosting Institution'}</label>
              <input type="text" name={category.includes('Registration') ? 'eventLocation' : 'hostingInstitution'} 
                     value={formData.eventLocation || formData.hostingInstitution || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Dates</label>
              <input type="text" name="eventDates" value={formData.eventDates || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g., Jan 15-17, 2024" />
            </div>
          </div>
          {/* {category.includes('Registration') && (
            <div>
              <label className="block text-sm font-medium mb-1">Registration Type</label>
              <select name="registrationType" value={formData.registrationType || ''} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select Type</option>
                <option value="Full">Full</option>
                <option value="Student">Student</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
          )} */}
        </>
      );
    }

    if (category.startsWith('Supplies')) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor/Supplier</label>
              <input type="text" name="vendor" value={formData.vendor || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input type="text" name="itemDescription" value={formData.itemDescription || ''} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          {category.includes('Lab') && (
            <div>
              <label className="block text-sm font-medium mb-1">Project/Research Grant</label>
              <input type="text" name="projectGrant" value={formData.projectGrant || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          )}
        </>
      );
    }

    return null;
  };

  const needsRoute = formData.category.startsWith('Travel');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Add Expense Item</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Select Category</option>
              <optgroup label="Travel">
                <option value="Travel - Air">Air (Flight)</option>
                <option value="Travel - Train">Train</option>
                <option value="Travel - Bus">Bus</option>
                <option value="Travel - Ground Transport">Ground Transport</option>
              </optgroup>
              <optgroup label="Accommodation">
                <option value="Accommodation - Hotel">Hotel</option>
                <option value="Accommodation - Guest House">Guest House/Dormitory</option>
              </optgroup>
              <optgroup label="Meals">
                <option value="Meals - Breakfast">Breakfast</option>
                <option value="Meals - Lunch">Lunch</option>
                <option value="Meals - Dinner">Dinner</option>
              </optgroup>
              <optgroup label="Conference & Training">
                <option value="Conference - Registration">Registration Fees</option>
                <option value="Conference - Workshop">Workshop/Seminar</option>
              </optgroup>
              <optgroup label="Supplies">
                <option value="Supplies - Lab">Lab Supplies</option>
                <option value="Supplies - Office">Office/Stationery</option>
              </optgroup>
              <optgroup label="Miscellaneous">
                <option value="Miscellaneous - Other">Other (Specify)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>

          {renderCategorySpecificFields()}

          {needsRoute && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Route Information</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium mb-2">From</h5>
                  <div className="space-y-2">
                    <select name="fromCountry" value={formData.fromCountry} onChange={handleChange} className="w-full p-2 border rounded">
                      {countries.map(country => (
                        <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                      ))}
                    </select>
                    <select name="fromState" value={formData.fromState} onChange={handleChange} className="w-full p-2 border rounded">
                      <option value="">Select State</option>
                      {fromStates.map(state => (
                        <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                      ))}
                    </select>
                    <select name="fromCity" value={formData.fromCity} onChange={handleChange} className="w-full p-2 border rounded">
                      <option value="">Select City</option>
                      {fromCities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">To</h5>
                  <div className="space-y-2">
                    <select name="toCountry" value={formData.toCountry} onChange={handleChange} className="w-full p-2 border rounded">
                      {countries.map(country => (
                        <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                      ))}
                    </select>
                    <select name="toState" value={formData.toState} onChange={handleChange} className="w-full p-2 border rounded">
                      <option value="">Select State</option>
                      {toStates.map(state => (
                        <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                      ))}
                    </select>
                    <select name="toCity" value={formData.toCity} onChange={handleChange} className="w-full p-2 border rounded">
                      <option value="">Select City</option>
                      {toCities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="2" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-2 border rounded">
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount in INR</label>
              <input type="text" value={amountInINR && typeof amountInINR === 'number' ? `₹${amountInINR.toFixed(2)}` : ''} 
                     className="w-full p-2 border rounded bg-gray-100" readOnly />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method *</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Select Payment Method</option>
              <option value="University Credit Card">University Credit Card</option>
              <option value="Personal Funds (Reimbursement)">Personal Funds (Reimbursement)</option>
              <option value="Direct Invoice to University">Direct Invoice to University</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receipt Image *</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full p-2 border rounded" 
              required={!formData.receiptImage}
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Receipt preview" className="max-w-xs max-h-48 object-contain border rounded" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Save Item'}
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseItemForm;