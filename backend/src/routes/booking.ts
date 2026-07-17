import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../lib/trpc';
import { bookingService } from '../services/bookingService';

export const bookingRouter = router({
  /**
   * Create a new booking
   */
  create: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
        userName: z.string().optional(),
        userRole: z.enum(['resident', 'caseworker', 'admin', 'agency-partner']),
        bookingPurpose: z.enum(['product-demo', 'speak-caseworker', 'intake', 'training', 'integration']),
        selectedAgency: z.string().optional(),
        caseworkerId: z.string().optional(),
        caseworkerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return bookingService.createBooking(input);
    }),

  /**
   * Get a booking by ID
   */
  getById: publicProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ input }) => {
      return bookingService.getBooking(input.bookingId);
    }),

  /**
   * Get user's bookings (requires auth)
   */
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.user?.email;
    if (!userEmail) {
      throw new Error('User email not found');
    }
    return bookingService.getUserBookings(userEmail);
  }),

  /**
   * Update booking status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(['pending', 'scheduled', 'joined', 'completed', 'cancelled']),
        joinedAt: z.date().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return bookingService.updateBookingStatus(input.bookingId, input.status, {
        joinedAt: input.joinedAt,
        duration: input.duration,
      });
    }),

  /**
   * Get available caseworkers by agency
   */
  getCaseworkers: publicProcedure
    .input(z.object({ agency: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return bookingService.getCaseworkersByAgency(input?.agency);
    }),

  /**
   * Get all available agencies
   */
  getAgencies: publicProcedure.query(async () => {
    return bookingService.getAvailableAgencies();
  }),
});
