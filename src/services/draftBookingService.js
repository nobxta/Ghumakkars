// Service for saving and resuming draft bookings
const DRAFT_STORAGE_KEY = 'ghumakkars_draft_booking';

const draftBookingService = {
  // Save draft booking to localStorage
  saveDraft: (tripId, bookingData) => {
    try {
      const drafts = draftBookingService.getAllDrafts();
      const timestamp = new Date().toISOString();
      
      drafts[tripId] = {
        ...bookingData,
        savedAt: timestamp,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  },

  // Get draft for specific trip
  getDraft: (tripId) => {
    try {
      const drafts = draftBookingService.getAllDrafts();
      const draft = drafts[tripId];
      
      if (!draft) return null;
      
      // Check if draft has expired
      if (new Date(draft.expiresAt) < new Date()) {
        draftBookingService.deleteDraft(tripId);
        return null;
      }
      
      return draft;
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  },

  // Get all drafts
  getAllDrafts: () => {
    try {
      const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
      return drafts ? JSON.parse(drafts) : {};
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return {};
    }
  },

  // Delete specific draft
  deleteDraft: (tripId) => {
    try {
      const drafts = draftBookingService.getAllDrafts();
      delete drafts[tripId];
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  },

  // Clear all drafts
  clearAllDrafts: () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing drafts:', error);
      return false;
    }
  },

  // Clean expired drafts
  cleanExpiredDrafts: () => {
    try {
      const drafts = draftBookingService.getAllDrafts();
      const now = new Date();
      let hasChanges = false;
      
      Object.keys(drafts).forEach(tripId => {
        if (new Date(drafts[tripId].expiresAt) < now) {
          delete drafts[tripId];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning expired drafts:', error);
      return false;
    }
  },

  // Check if draft exists for trip
  hasDraft: (tripId) => {
    return draftBookingService.getDraft(tripId) !== null;
  }
};

// Clean expired drafts on module load
draftBookingService.cleanExpiredDrafts();

export default draftBookingService;

