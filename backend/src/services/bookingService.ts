import { prisma } from '../lib/prisma';

// Mock Zoom credentials - in production, use Zoom API
const ZOOM_MEETINGS = {
  architect: {
    meetingId: 'ARCH-001',
    hostName: 'Architect',
    hostEmail: 'architect@haven.demo',
    joinUrl: 'https://zoom.us/j/architect-demo',
    startUrl: 'https://zoom.us/s/architect-demo',
    password: 'haven2026',
  },
};

// Mock caseworker Zoom links - in production, fetch from API/database
const CASEWORKER_ZOOM = (caseworkerId: string) => ({
  meetingId: `CW-${caseworkerId}`,
  hostName: `Caseworker ${caseworkerId}`,
  hostEmail: `caseworker-${caseworkerId}@haven.demo`,
  joinUrl: `https://zoom.us/j/caseworker-${caseworkerId}`,
  startUrl: `https://zoom.us/s/caseworker-${caseworkerId}`,
  password: 'haven2026',
});

export const bookingService = {
  /**
   * Create a new booking and return the Zoom join URL
   */
  async createBooking(input: {
    userEmail: string;
    userName?: string;
    userRole: string;
    bookingPurpose: string;
    selectedAgency?: string;
    caseworkerId?: string;
    caseworkerName?: string;
  }) {
    try {
      // Determine which Zoom meeting to use
      let zoomData: any;

      if (input.bookingPurpose === 'product-demo' || !input.caseworkerId) {
        // Default to Architect
        zoomData = ZOOM_MEETINGS.architect;
      } else {
        // Use specific caseworker's meeting
        zoomData = CASEWORKER_ZOOM(input.caseworkerId);
      }

      // Get or create the Zoom meeting record
      let zoomMeeting = await prisma.zoomMeeting.findUnique({
        where: { meetingId: zoomData.meetingId },
      });

      if (!zoomMeeting) {
        zoomMeeting = await prisma.zoomMeeting.create({
          data: {
            meetingId: zoomData.meetingId,
            hostName: zoomData.hostName,
            hostEmail: zoomData.hostEmail,
            joinUrl: zoomData.joinUrl,
            startUrl: zoomData.startUrl,
            password: zoomData.password,
          },
        });
      }

      // Create the booking record
      const booking = await prisma.booking.create({
        data: {
          userEmail: input.userEmail,
          userName: input.userName,
          userRole: input.userRole,
          bookingPurpose: input.bookingPurpose,
          selectedAgency: input.selectedAgency,
          caseworkerId: input.caseworkerId,
          caseworkerName: input.caseworkerName,
          zoomMeetingId: zoomMeeting.id,
          joinUrl: zoomMeeting.joinUrl,
          status: 'scheduled',
        },
      });

      return {
        bookingId: booking.id,
        joinUrl: booking.joinUrl,
        meetingId: zoomData.meetingId,
        hostName: zoomData.hostName,
        password: zoomData.password,
        status: 'success',
      };
    } catch (error) {
      console.error('[BookingService] Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  },

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        zoomMeeting: true,
      },
    });
  },

  /**
   * Get user's bookings
   */
  async getUserBookings(userEmail: string) {
    return prisma.booking.findMany({
      where: { userEmail },
      include: {
        zoomMeeting: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Update booking status (e.g., when user joins)
   */
  async updateBookingStatus(
    bookingId: string,
    status: string,
    additionalData?: { joinedAt?: Date; duration?: number }
  ) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(additionalData?.joinedAt && { joinedAt: additionalData.joinedAt }),
        ...(additionalData?.duration && { duration: additionalData.duration }),
      },
    });
  },

  /**
   * Get available caseworkers by agency
   */
  async getCaseworkersByAgency(agency?: string) {
    // In production, fetch from actual caseworker database
    const caseworkers = [
      { id: 'cw-001', name: 'Maria Santos', agency: 'SFHSA' },
      { id: 'cw-002', name: 'James Chen', agency: 'SFHSA' },
      { id: 'cw-003', name: 'Dr. Patricia Williams', agency: 'DPH' },
      { id: 'cw-004', name: 'Luis Morales', agency: 'DPH' },
      { id: 'cw-005', name: 'Rachel Kim', agency: 'ARC' },
    ];

    if (agency) {
      return caseworkers.filter((cw) => cw.agency === agency);
    }

    return caseworkers;
  },

  /**
   * Get all available agencies
   */
  async getAvailableAgencies() {
    return [
      { code: 'sfhsa', name: 'SFHSA' },
      { code: 'dph', name: 'DPH' },
      { code: 'arc', name: 'ARC' },
    ];
  },
};
