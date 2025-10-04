import { testSupabaseConnection } from '../src/modules/debug/startup';
import { databaseService } from '../src/database';

// Mock the database service
jest.mock('../src/database', () => ({
  databaseService: {
    createUser: jest.fn()
  }
}));

const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

describe('Debug Startup', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('testSupabaseConnection', () => {
    it('should successfully test Supabase connection', async () => {
      // Mock successful user creation
      mockDatabaseService.createUser.mockResolvedValue(undefined);

      await testSupabaseConnection();

      expect(consoleSpy).toHaveBeenCalledWith('🧪 Testing Supabase connection...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Supabase connection test successful!');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/📝 Test user created with ID: startup-test-/));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/📧 Test user email: startup-test-.*@example\.com/));
      expect(consoleSpy).toHaveBeenCalledWith('🔍 You can verify this user in your Supabase dashboard');
      
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^startup-test-/),
          firstName: 'Startup',
          lastName: 'Test',
          email: expect.stringMatching(/^startup-test-.*@example\.com$/),
          phone: expect.stringMatching(/^\+1234567890\d+$/)
        })
      );
    });

    it('should handle connection test failure', async () => {
      // Mock database error
      const errorMessage = 'Connection failed';
      mockDatabaseService.createUser.mockRejectedValue(new Error(errorMessage));

      await testSupabaseConnection();

      expect(consoleSpy).toHaveBeenCalledWith('🧪 Testing Supabase connection...');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Supabase connection test failed:', errorMessage);
      
      expect(mockDatabaseService.createUser).toHaveBeenCalled();
    });

    it('should create user with unique timestamp-based ID', async () => {
      mockDatabaseService.createUser.mockResolvedValue(undefined);

      const startTime = Date.now();
      await testSupabaseConnection();
      const endTime = Date.now();

      const createUserCall = mockDatabaseService.createUser.mock.calls[0]?.[0];
      
      expect(createUserCall).toBeDefined();
      expect(createUserCall!.id).toMatch(/^startup-test-\d+$/);
      expect(createUserCall!.email).toMatch(/^startup-test-\d+@example\.com$/);
      expect(createUserCall!.phone).toMatch(/^\+1234567890\d+$/);
      
      // Verify the timestamp is within the expected range
      const timestamp = parseInt(createUserCall!.id.replace('startup-test-', ''));
      expect(timestamp).toBeGreaterThanOrEqual(startTime);
      expect(timestamp).toBeLessThanOrEqual(endTime);
    });

    it('should not clean up the test user', async () => {
      mockDatabaseService.createUser.mockResolvedValue(undefined);

      await testSupabaseConnection();

      // Should only call createUser, not deleteUser
      expect(mockDatabaseService.createUser).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('🔍 You can verify this user in your Supabase dashboard');
    });
  });
});
