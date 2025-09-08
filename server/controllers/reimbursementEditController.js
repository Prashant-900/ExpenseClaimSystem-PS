import Reimbursement from '../models/Reimbursement.js';
import { uploadToMinio } from '../middleware/fileUploadMiddleware.js';

export const editReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, expenseType, expenseDate, amount, description, receipt, existingImages,
      // Travel fields
      origin, destination, travelMode, distance, startDate, endDate,
      // Meal fields
      restaurantName, mealType, attendees, perPersonCost,
      // Accommodation fields
      hotelName, location, checkinDate, checkoutDate, nightsStayed,
      // Office Supplies fields
      itemName, quantity, vendorName, invoiceNumber,
      // Misc fields
      customNotes
    } = req.body;
    
    const reimbursement = await Reimbursement.findById(id);
    if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });
    
    // Only allow editing if sent back or user owns it
    const isOwner = (reimbursement.studentId && reimbursement.studentId.toString() === req.user._id.toString()) || 
                   (reimbursement.facultySubmitterId && reimbursement.facultySubmitterId.toString() === req.user._id.toString());
    
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (!['Sent Back - Faculty', 'Sent Back - Audit', 'Sent Back - Finance'].includes(reimbursement.status)) {
      return res.status(400).json({ message: 'Cannot edit this request' });
    }
    
    // Handle existing images - overwrite with new list
    let parsedExisting = [];
    try {
      parsedExisting = JSON.parse(existingImages);
    } catch (e) {}
    
    reimbursement.images = parsedExisting;
    
    // Handle new image uploads
    if (req.files?.length) {
      for (const file of req.files) {
        const fileName = await uploadToMinio(file, req.user._id);
        reimbursement.images.push(fileName);
      }
    }
    
    // Update all fields
    if (title) reimbursement.title = title;
    if (expenseType) reimbursement.expenseType = expenseType;
    if (expenseDate) reimbursement.expenseDate = expenseDate;
    if (amount) reimbursement.amount = amount;
    if (description) reimbursement.description = description;
    if (receipt !== undefined) reimbursement.receipt = receipt;
    
    // Travel fields
    if (origin !== undefined) reimbursement.origin = origin;
    if (destination !== undefined) reimbursement.destination = destination;
    if (travelMode !== undefined) reimbursement.travelMode = travelMode;
    if (distance !== undefined) reimbursement.distance = distance;
    if (startDate !== undefined) reimbursement.startDate = startDate;
    if (endDate !== undefined) reimbursement.endDate = endDate;
    
    // Meal fields
    if (restaurantName !== undefined) reimbursement.restaurantName = restaurantName;
    if (mealType !== undefined) reimbursement.mealType = mealType;
    if (attendees !== undefined) reimbursement.attendees = attendees;
    if (perPersonCost !== undefined) reimbursement.perPersonCost = perPersonCost;
    
    // Accommodation fields
    if (hotelName !== undefined) reimbursement.hotelName = hotelName;
    if (location !== undefined) reimbursement.location = location;
    if (checkinDate !== undefined) reimbursement.checkinDate = checkinDate;
    if (checkoutDate !== undefined) reimbursement.checkoutDate = checkoutDate;
    if (nightsStayed !== undefined) reimbursement.nightsStayed = nightsStayed;
    
    // Office Supplies fields
    if (itemName !== undefined) reimbursement.itemName = itemName;
    if (quantity !== undefined) reimbursement.quantity = quantity;
    if (vendorName !== undefined) reimbursement.vendorName = vendorName;
    if (invoiceNumber !== undefined) reimbursement.invoiceNumber = invoiceNumber;
    
    // Misc fields
    if (customNotes !== undefined) reimbursement.customNotes = customNotes;
    
    // Set correct status based on request type
    if (reimbursement.facultySubmitterId) {
      reimbursement.status = 'Approved - Audit';
    } else {
      reimbursement.status = 'Pending - Faculty';
    }
    
    reimbursement.facultyRemarks = '';
    reimbursement.auditRemarks = '';
    reimbursement.financeRemarks = '';
    
    await reimbursement.save();
    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};