import Draft from '../models/Draft.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';

export const createDraft = async (req, res) => {
  try {
    const { 
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail, country,
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      restaurantName, mealType, attendees, perPersonCost,
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      itemName, quantity, vendorName, invoiceNumber,
      customNotes
    } = req.body;
    
    let imageFileNames = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = await uploadToS3(file, req.user._id);
        imageFileNames.push(fileName);
      }
    }
    
    const draft = await Draft.create({
      userId: req.user._id,
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail, country,
      images: imageFileNames,
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      restaurantName, mealType, attendees, perPersonCost,
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      itemName, quantity, vendorName, invoiceNumber,
      customNotes
    });

    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDraftById = async (req, res) => {
  try {
    const draft = await Draft.findOne({ _id: req.params.id, userId: req.user._id });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDraft = async (req, res) => {
  try {
    const { 
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail, country,
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      restaurantName, mealType, attendees, perPersonCost,
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      itemName, quantity, vendorName, invoiceNumber,
      customNotes
    } = req.body;
    
    let imageFileNames = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = await uploadToS3(file, req.user._id);
        imageFileNames.push(fileName);
      }
    }
    
    const updateData = {
      title, expenseType, expenseDate, amount, description, receipt, facultyEmail, country,
      originState, originCity, destinationState, destinationCity, travelMode, distance, startDate, endDate,
      restaurantName, mealType, attendees, perPersonCost,
      hotelName, accommodationState, accommodationCity, checkinDate, checkoutDate, nightsStayed,
      itemName, quantity, vendorName, invoiceNumber,
      customNotes
    };
    
    if (imageFileNames.length > 0) {
      updateData.images = imageFileNames;
    }
    
    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};