import { Question, TestCase } from '../data/questions';

export interface ExecutionResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  description?: string;
  error?: string;
  executionTime?: number;
}

export interface LogEntry {
  type: 'log' | 'warn' | 'info' | 'debug' | 'error';
  message: string;
  source?: string;
  timestamp: string;
}

export interface CodeExecutionResult {
  testResults: ExecutionResult[];
  logs: LogEntry[];
  allPassed: boolean;
  output: string;
  testsPassed: number;
  totalTests: number;
  securityViolations: string[];
}

// ServiceNow Mock Classes and APIs
export class ServiceNowSandbox {
  private logs: LogEntry[] = [];
  private securityViolations: string[] = [];
  private mockData: any = {};

  constructor() {
    this.setupMockData();
  }

  private setupMockData() {
    // Mock incident data - Extended with more realistic data
    this.mockData.incident = [
      {
        sys_id: '1234567890abcdef',
        number: 'INC0000001',
        short_description: 'Server down',
        priority: '2',
        state: '1',
        category: 'Hardware',
        assignment_group: 'Network Team',
        caller_id: 'john.doe',
        sys_created_on: '2024-01-01 10:00:00',
        sys_updated_on: '2024-01-01 11:00:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: '0987654321fedcba',
        number: 'INC0000002',
        short_description: 'Login issues',
        priority: '3',
        state: '2',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'jane.smith',
        sys_created_on: '2024-01-02 09:00:00',
        sys_updated_on: '2024-01-02 10:00:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'abc123def456ghi7',
        number: 'INC0000003',
        short_description: 'Network connectivity issues',
        priority: '1',
        state: '1',
        category: 'Network',
        assignment_group: 'Network Team',
        caller_id: 'bob.wilson',
        sys_created_on: '2024-01-03 14:30:00',
        sys_updated_on: '2024-01-03 15:00:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'def456ghi789jkl0',
        number: 'INC0000004',
        short_description: 'Email server performance degradation',
        priority: '2',
        state: '6',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'alice.brown',
        sys_created_on: '2024-01-04 08:15:00',
        sys_updated_on: '2024-01-04 16:30:00',
        resolved_at: '2024-01-04 16:30:00',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'ghi789jkl012mno3',
        number: 'INC0000005',
        short_description: 'Printer not working in Building A',
        priority: '4',
        state: '3',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'charlie.davis',
        sys_created_on: '2024-01-05 11:45:00',
        sys_updated_on: '2024-01-05 12:00:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'jkl012mno345pqr6',
        number: 'INC0000006',
        short_description: 'Database connection timeout',
        priority: '1',
        state: '2',
        category: 'Database',
        assignment_group: 'Database Team',
        caller_id: 'diana.miller',
        sys_created_on: '2024-01-06 07:20:00',
        sys_updated_on: '2024-01-06 09:45:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'mno345pqr678stu9',
        number: 'INC0000007',
        short_description: 'VPN connection issues for remote users',
        priority: '2',
        state: '1',
        category: 'Network',
        assignment_group: 'Network Team',
        caller_id: 'frank.taylor',
        sys_created_on: '2024-01-07 13:10:00',
        sys_updated_on: '2024-01-07 13:25:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'pqr678stu901vwx2',
        number: 'INC0000008',
        short_description: 'Application crashing on startup',
        priority: '3',
        state: '6',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'grace.wilson',
        sys_created_on: '2024-01-08 16:00:00',
        sys_updated_on: '2024-01-08 17:30:00',
        resolved_at: '2024-01-08 17:30:00',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'stu901vwx234yza5',
        number: 'INC0000009',
        short_description: 'Monitor flickering in conference room',
        priority: '4',
        state: '2',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'henry.garcia',
        sys_created_on: '2024-01-09 10:30:00',
        sys_updated_on: '2024-01-09 11:15:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'vwx234yza567bcd8',
        number: 'INC0000010',
        short_description: 'Security certificate expired',
        priority: '2',
        state: '1',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'iris.martinez',
        sys_created_on: '2024-01-10 09:00:00',
        sys_updated_on: '2024-01-10 09:30:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'yza567bcd890efg1',
        number: 'INC0000011',
        short_description: 'Slow file server response times',
        priority: '3',
        state: '3',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'jack.rodriguez',
        sys_created_on: '2024-01-11 14:45:00',
        sys_updated_on: '2024-01-11 15:30:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'bcd890efg123hij4',
        number: 'INC0000012',
        short_description: 'Mobile app login failure',
        priority: '2',
        state: '6',
        category: 'Software',
        assignment_group: 'Mobile Team',
        caller_id: 'karen.lopez',
        sys_created_on: '2024-01-12 12:20:00',
        sys_updated_on: '2024-01-12 14:45:00',
        resolved_at: '2024-01-12 14:45:00',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'efg123hij456klm7',
        number: 'INC0000013',
        short_description: 'Backup job failed overnight',
        priority: '1',
        state: '2',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'luis.hernandez',
        sys_created_on: '2024-01-13 06:00:00',
        sys_updated_on: '2024-01-13 08:30:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'hij456klm789nop0',
        number: 'INC0000014',
        short_description: 'Keyboard keys sticking',
        priority: '4',
        state: '6',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'maria.gonzalez',
        sys_created_on: '2024-01-14 15:30:00',
        sys_updated_on: '2024-01-14 16:00:00',
        resolved_at: '2024-01-14 16:00:00',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'klm789nop012qrs3',
        number: 'INC0000015',
        short_description: 'Web portal timeout errors',
        priority: '2',
        state: '1',
        category: 'Software',
        assignment_group: 'Web Team',
        caller_id: 'nancy.white',
        sys_created_on: '2024-01-15 11:00:00',
        sys_updated_on: '2024-01-15 11:30:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'nop012qrs345tuv6',
        number: 'INC0000016',
        short_description: 'Shared drive access denied',
        priority: '3',
        state: '2',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'oscar.jones',
        sys_created_on: '2024-01-16 08:15:00',
        sys_updated_on: '2024-01-16 09:00:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'qrs345tuv678wxy9',
        number: 'INC0000017',
        short_description: 'Laptop overheating issue',
        priority: '4',
        state: '6',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'paula.adams',
        sys_created_on: '2024-01-17 14:20:00',
        sys_updated_on: '2024-01-17 16:45:00',
        resolved_at: '2024-01-17 16:45:00',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'tuv678wxy901zab2',
        number: 'INC0000018',
        short_description: 'Email synchronization failure',
        priority: '2',
        state: '1',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'quinn.baker',
        sys_created_on: '2024-01-18 07:30:00',
        sys_updated_on: '2024-01-18 08:00:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'wxy901zab234cde5',
        number: 'INC0000019',
        short_description: 'Firewall blocking legitimate traffic',
        priority: '1',
        state: '2',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'rachel.clark',
        sys_created_on: '2024-01-19 10:45:00',
        sys_updated_on: '2024-01-19 12:30:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'zab234cde567fgh8',
        number: 'INC0000020',
        short_description: 'Conference room projector not working',
        priority: '4',
        state: '3',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'sam.davis',
        sys_created_on: '2024-01-20 13:15:00',
        sys_updated_on: '2024-01-20 14:00:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'cde567fgh890ijk1',
        number: 'INC0000021',
        short_description: 'Database query performance degradation',
        priority: '2',
        state: '1',
        category: 'Database',
        assignment_group: 'Database Team',
        caller_id: 'tina.evans',
        sys_created_on: '2024-01-21 09:20:00',
        sys_updated_on: '2024-01-21 10:15:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'fgh890ijk123lmn4',
        number: 'INC0000022',
        short_description: 'Software installation failure',
        priority: '3',
        state: '6',
        category: 'Software',
        assignment_group: 'Desktop Support',
        caller_id: 'ursula.ford',
        sys_created_on: '2024-01-22 15:40:00',
        sys_updated_on: '2024-01-22 17:20:00',
        resolved_at: '2024-01-22 17:20:00',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'ijk123lmn456opq7',
        number: 'INC0000023',
        short_description: 'Network printer queue stuck',
        priority: '3',
        state: '2',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'victor.green',
        sys_created_on: '2024-01-23 11:55:00',
        sys_updated_on: '2024-01-23 12:30:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'lmn456opq789rst0',
        number: 'INC0000024',
        short_description: 'Mobile device not receiving emails',
        priority: '2',
        state: '1',
        category: 'Mobile',
        assignment_group: 'Mobile Team',
        caller_id: 'wendy.hall',
        sys_created_on: '2024-01-24 08:10:00',
        sys_updated_on: '2024-01-24 08:45:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'opq789rst012uvw3',
        number: 'INC0000025',
        short_description: 'Load balancer health check failing',
        priority: '1',
        state: '2',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'xavier.hill',
        sys_created_on: '2024-01-25 06:30:00',
        sys_updated_on: '2024-01-25 08:15:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'rst012uvw345xyz6',
        number: 'INC0000026',
        short_description: 'Browser crashes when opening specific website',
        priority: '4',
        state: '6',
        category: 'Software',
        assignment_group: 'Desktop Support',
        caller_id: 'yvonne.king',
        sys_created_on: '2024-01-26 16:25:00',
        sys_updated_on: '2024-01-26 17:00:00',
        resolved_at: '2024-01-26 17:00:00',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'uvw345xyz678abc9',
        number: 'INC0000027',
        short_description: 'Two-factor authentication not working',
        priority: '2',
        state: '1',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'zachary.lee',
        sys_created_on: '2024-01-27 12:40:00',
        sys_updated_on: '2024-01-27 13:15:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'xyz678abc901def2',
        number: 'INC0000028',
        short_description: 'File server running out of disk space',
        priority: '1',
        state: '2',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'anna.martin',
        sys_created_on: '2024-01-28 05:45:00',
        sys_updated_on: '2024-01-28 07:20:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'abc901def234ghi5',
        number: 'INC0000029',
        short_description: 'Headset microphone not working',
        priority: '4',
        state: '3',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'brad.nelson',
        sys_created_on: '2024-01-29 14:50:00',
        sys_updated_on: '2024-01-29 15:25:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'def234ghi567jkl8',
        number: 'INC0000030',
        short_description: 'API rate limiting causing application errors',
        priority: '2',
        state: '1',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'carol.parker',
        sys_created_on: '2024-01-30 10:05:00',
        sys_updated_on: '2024-01-30 10:40:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'ghi567jkl890mno1',
        number: 'INC0000031',
        short_description: 'Wireless network dropping connections',
        priority: '2',
        state: '2',
        category: 'Network',
        assignment_group: 'Network Team',
        caller_id: 'david.quinn',
        sys_created_on: '2024-01-31 09:30:00',
        sys_updated_on: '2024-01-31 11:00:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'jkl890mno123pqr4',
        number: 'INC0000032',
        short_description: 'Backup verification failed',
        priority: '1',
        state: '1',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'emma.roberts',
        sys_created_on: '2024-02-01 07:00:00',
        sys_updated_on: '2024-02-01 07:30:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'mno123pqr456stu7',
        number: 'INC0000033',
        short_description: 'Scanner not detected by computer',
        priority: '4',
        state: '6',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'frank.scott',
        sys_created_on: '2024-02-02 13:25:00',
        sys_updated_on: '2024-02-02 15:10:00',
        resolved_at: '2024-02-02 15:10:00',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'pqr456stu789vwx0',
        number: 'INC0000034',
        short_description: 'Database connection pool exhausted',
        priority: '1',
        state: '2',
        category: 'Database',
        assignment_group: 'Database Team',
        caller_id: 'grace.turner',
        sys_created_on: '2024-02-03 11:15:00',
        sys_updated_on: '2024-02-03 13:45:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'stu789vwx012yza3',
        number: 'INC0000035',
        short_description: 'Video conference audio echo',
        priority: '3',
        state: '2',
        category: 'Software',
        assignment_group: 'Desktop Support',
        caller_id: 'harry.walker',
        sys_created_on: '2024-02-04 14:40:00',
        sys_updated_on: '2024-02-04 15:20:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'vwx012yza345bcd6',
        number: 'INC0000036',
        short_description: 'SSL certificate renewal required',
        priority: '2',
        state: '1',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'iris.young',
        sys_created_on: '2024-02-05 08:50:00',
        sys_updated_on: '2024-02-05 09:25:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'yza345bcd678efg9',
        number: 'INC0000037',
        short_description: 'External hard drive not recognized',
        priority: '4',
        state: '3',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'jack.anderson',
        sys_created_on: '2024-02-06 16:05:00',
        sys_updated_on: '2024-02-06 16:40:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'bcd678efg901hij2',
        number: 'INC0000038',
        short_description: 'Memory leak in production application',
        priority: '1',
        state: '2',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'karen.brown',
        sys_created_on: '2024-02-07 04:30:00',
        sys_updated_on: '2024-02-07 06:15:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'efg901hij234klm5',
        number: 'INC0000039',
        short_description: 'Network switch port failure',
        priority: '2',
        state: '1',
        category: 'Network',
        assignment_group: 'Network Team',
        caller_id: 'liam.clark',
        sys_created_on: '2024-02-08 12:20:00',
        sys_updated_on: '2024-02-08 12:55:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'hij234klm567nop8',
        number: 'INC0000040',
        short_description: 'Antivirus software blocking legitimate application',
        priority: '3',
        state: '6',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'mia.davis',
        sys_created_on: '2024-02-09 10:35:00',
        sys_updated_on: '2024-02-09 12:20:00',
        resolved_at: '2024-02-09 12:20:00',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'klm567nop890qrs1',
        number: 'INC0000041',
        short_description: 'Report generation timing out',
        priority: '2',
        state: '2',
        category: 'Database',
        assignment_group: 'Database Team',
        caller_id: 'noah.evans',
        sys_created_on: '2024-02-10 15:10:00',
        sys_updated_on: '2024-02-10 16:30:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'nop890qrs123tuv4',
        number: 'INC0000042',
        short_description: 'Mouse cursor jumping erratically',
        priority: '4',
        state: '6',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'olivia.ford',
        sys_created_on: '2024-02-11 09:45:00',
        sys_updated_on: '2024-02-11 10:30:00',
        resolved_at: '2024-02-11 10:30:00',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'qrs123tuv456wxy7',
        number: 'INC0000043',
        short_description: 'Cloud storage sync errors',
        priority: '3',
        state: '1',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'peter.garcia',
        sys_created_on: '2024-02-12 13:00:00',
        sys_updated_on: '2024-02-12 13:35:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'tuv456wxy789zab0',
        number: 'INC0000044',
        short_description: 'DHCP lease exhaustion',
        priority: '1',
        state: '2',
        category: 'Network',
        assignment_group: 'Network Team',
        caller_id: 'quinn.harris',
        sys_created_on: '2024-02-13 06:45:00',
        sys_updated_on: '2024-02-13 08:20:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'wxy789zab012cde3',
        number: 'INC0000045',
        short_description: 'Webcam driver compatibility issue',
        priority: '4',
        state: '3',
        category: 'Hardware',
        assignment_group: 'Desktop Support',
        caller_id: 'ruby.johnson',
        sys_created_on: '2024-02-14 11:30:00',
        sys_updated_on: '2024-02-14 12:15:00',
        resolved_at: '',
        impact: '4',
        urgency: '4'
      },
      {
        sys_id: 'zab012cde345fgh6',
        number: 'INC0000046',
        short_description: 'Transaction log file growth issue',
        priority: '2',
        state: '1',
        category: 'Database',
        assignment_group: 'Database Team',
        caller_id: 'steve.kim',
        sys_created_on: '2024-02-15 14:55:00',
        sys_updated_on: '2024-02-15 15:30:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'cde345fgh678ijk9',
        number: 'INC0000047',
        short_description: 'Password complexity policy not enforced',
        priority: '3',
        state: '2',
        category: 'Security',
        assignment_group: 'Security Team',
        caller_id: 'tara.lee',
        sys_created_on: '2024-02-16 08:25:00',
        sys_updated_on: '2024-02-16 10:00:00',
        resolved_at: '',
        impact: '3',
        urgency: '3'
      },
      {
        sys_id: 'fgh678ijk901lmn2',
        number: 'INC0000048',
        short_description: 'Mobile app crashing on iOS devices',
        priority: '2',
        state: '1',
        category: 'Mobile',
        assignment_group: 'Mobile Team',
        caller_id: 'uma.martin',
        sys_created_on: '2024-02-17 12:10:00',
        sys_updated_on: '2024-02-17 12:45:00',
        resolved_at: '',
        impact: '2',
        urgency: '2'
      },
      {
        sys_id: 'ijk901lmn234opq5',
        number: 'INC0000049',
        short_description: 'Server CPU utilization at 100%',
        priority: '1',
        state: '2',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        caller_id: 'victor.nelson',
        sys_created_on: '2024-02-18 03:20:00',
        sys_updated_on: '2024-02-18 05:10:00',
        resolved_at: '',
        impact: '1',
        urgency: '1'
      },
      {
        sys_id: 'lmn234opq567rst8',
        number: 'INC0000050',
        short_description: 'Shared calendar permissions incorrect',
        priority: '3',
        state: '6',
        category: 'Software',
        assignment_group: 'Application Team',
        caller_id: 'wendy.parker',
        sys_created_on: '2024-02-19 16:40:00',
        sys_updated_on: '2024-02-19 18:15:00',
        resolved_at: '2024-02-19 18:15:00',
        impact: '3',
        urgency: '3'
      }
    ];

    // Mock user data - Extended to match incident callers and assignment groups
    this.mockData.sys_user = [
      {
        sys_id: 'user123',
        user_name: 'admin',
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@company.com',
        active: true,
        roles: 'admin,itil',
        title: 'System Administrator',
        department: 'IT',
        phone: '555-0001'
      },
      {
        sys_id: 'user456',
        user_name: 'john.doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        active: true,
        roles: 'itil',
        title: 'IT Analyst',
        department: 'IT',
        phone: '555-0002'
      },
      {
        sys_id: 'user789',
        user_name: 'jane.smith',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@company.com',
        active: true,
        roles: 'user',
        title: 'Marketing Manager',
        department: 'Marketing',
        phone: '555-0003'
      },
      {
        sys_id: 'user101',
        user_name: 'bob.wilson',
        first_name: 'Bob',
        last_name: 'Wilson',
        email: 'bob.wilson@company.com',
        active: true,
        roles: 'user',
        title: 'Sales Representative',
        department: 'Sales',
        phone: '555-0004'
      },
      {
        sys_id: 'user102',
        user_name: 'alice.brown',
        first_name: 'Alice',
        last_name: 'Brown',
        email: 'alice.brown@company.com',
        active: true,
        roles: 'user',
        title: 'HR Specialist',
        department: 'Human Resources',
        phone: '555-0005'
      },
      {
        sys_id: 'user103',
        user_name: 'charlie.davis',
        first_name: 'Charlie',
        last_name: 'Davis',
        email: 'charlie.davis@company.com',
        active: true,
        roles: 'user',
        title: 'Accountant',
        department: 'Finance',
        phone: '555-0006'
      },
      {
        sys_id: 'user104',
        user_name: 'diana.miller',
        first_name: 'Diana',
        last_name: 'Miller',
        email: 'diana.miller@company.com',
        active: true,
        roles: 'user',
        title: 'Project Manager',
        department: 'Operations',
        phone: '555-0007'
      },
      {
        sys_id: 'user105',
        user_name: 'frank.taylor',
        first_name: 'Frank',
        last_name: 'Taylor',
        email: 'frank.taylor@company.com',
        active: true,
        roles: 'user',
        title: 'Remote Developer',
        department: 'Engineering',
        phone: '555-0008'
      },
      {
        sys_id: 'user106',
        user_name: 'grace.wilson',
        first_name: 'Grace',
        last_name: 'Wilson',
        email: 'grace.wilson@company.com',
        active: true,
        roles: 'user',
        title: 'Business Analyst',
        department: 'Business',
        phone: '555-0009'
      },
      {
        sys_id: 'user107',
        user_name: 'henry.garcia',
        first_name: 'Henry',
        last_name: 'Garcia',
        email: 'henry.garcia@company.com',
        active: true,
        roles: 'user',
        title: 'Operations Specialist',
        department: 'Operations',
        phone: '555-0010'
      },
      {
        sys_id: 'user108',
        user_name: 'nancy.white',
        first_name: 'Nancy',
        last_name: 'White',
        email: 'nancy.white@company.com',
        active: true,
        roles: 'user',
        title: 'Content Manager',
        department: 'Marketing',
        phone: '555-0011'
      },
      {
        sys_id: 'user109',
        user_name: 'oscar.jones',
        first_name: 'Oscar',
        last_name: 'Jones',
        email: 'oscar.jones@company.com',
        active: true,
        roles: 'user',
        title: 'Research Analyst',
        department: 'Research',
        phone: '555-0012'
      },
      {
        sys_id: 'user110',
        user_name: 'paula.adams',
        first_name: 'Paula',
        last_name: 'Adams',
        email: 'paula.adams@company.com',
        active: true,
        roles: 'user',
        title: 'Training Coordinator',
        department: 'Human Resources',
        phone: '555-0013'
      },
      {
        sys_id: 'user111',
        user_name: 'quinn.baker',
        first_name: 'Quinn',
        last_name: 'Baker',
        email: 'quinn.baker@company.com',
        active: true,
        roles: 'user',
        title: 'Quality Assurance',
        department: 'Engineering',
        phone: '555-0014'
      },
      {
        sys_id: 'user112',
        user_name: 'rachel.clark',
        first_name: 'Rachel',
        last_name: 'Clark',
        email: 'rachel.clark@company.com',
        active: true,
        roles: 'user',
        title: 'Compliance Officer',
        department: 'Legal',
        phone: '555-0015'
      },
      {
        sys_id: 'user113',
        user_name: 'sam.davis',
        first_name: 'Sam',
        last_name: 'Davis',
        email: 'sam.davis@company.com',
        active: true,
        roles: 'user',
        title: 'Event Coordinator',
        department: 'Operations',
        phone: '555-0016'
      },
      {
        sys_id: 'user114',
        user_name: 'tina.evans',
        first_name: 'Tina',
        last_name: 'Evans',
        email: 'tina.evans@company.com',
        active: true,
        roles: 'user',
        title: 'Data Analyst',
        department: 'Analytics',
        phone: '555-0017'
      },
      {
        sys_id: 'user115',
        user_name: 'ursula.ford',
        first_name: 'Ursula',
        last_name: 'Ford',
        email: 'ursula.ford@company.com',
        active: true,
        roles: 'user',
        title: 'UX Designer',
        department: 'Design',
        phone: '555-0018'
      },
      {
        sys_id: 'user116',
        user_name: 'victor.green',
        first_name: 'Victor',
        last_name: 'Green',
        email: 'victor.green@company.com',
        active: true,
        roles: 'user',
        title: 'Procurement Specialist',
        department: 'Procurement',
        phone: '555-0019'
      },
      {
        sys_id: 'user117',
        user_name: 'wendy.hall',
        first_name: 'Wendy',
        last_name: 'Hall',
        email: 'wendy.hall@company.com',
        active: true,
        roles: 'user',
        title: 'Mobile App User',
        department: 'Sales',
        phone: '555-0020'
      },
      {
        sys_id: 'user118',
        user_name: 'xavier.hill',
        first_name: 'Xavier',
        last_name: 'Hill',
        email: 'xavier.hill@company.com',
        active: true,
        roles: 'user',
        title: 'Infrastructure Specialist',
        department: 'IT',
        phone: '555-0021'
      },
      {
        sys_id: 'user119',
        user_name: 'yvonne.king',
        first_name: 'Yvonne',
        last_name: 'King',
        email: 'yvonne.king@company.com',
        active: true,
        roles: 'user',
        title: 'Technical Writer',
        department: 'Documentation',
        phone: '555-0022'
      },
      {
        sys_id: 'user120',
        user_name: 'zachary.lee',
        first_name: 'Zachary',
        last_name: 'Lee',
        email: 'zachary.lee@company.com',
        active: true,
        roles: 'user',
        title: 'Security Analyst',
        department: 'Security',
        phone: '555-0023'
      },
      {
        sys_id: 'user121',
        user_name: 'anna.martin',
        first_name: 'Anna',
        last_name: 'Martin',
        email: 'anna.martin@company.com',
        active: true,
        roles: 'user',
        title: 'File Server Admin',
        department: 'IT',
        phone: '555-0024'
      },
      {
        sys_id: 'user122',
        user_name: 'brad.nelson',
        first_name: 'Brad',
        last_name: 'Nelson',
        email: 'brad.nelson@company.com',
        active: true,
        roles: 'user',
        title: 'Call Center Agent',
        department: 'Support',
        phone: '555-0025'
      },
      {
        sys_id: 'user123',
        user_name: 'carol.parker',
        first_name: 'Carol',
        last_name: 'Parker',
        email: 'carol.parker@company.com',
        active: true,
        roles: 'user',
        title: 'API Developer',
        department: 'Engineering',
        phone: '555-0026'
      },
      {
        sys_id: 'user124',
        user_name: 'david.quinn',
        first_name: 'David',
        last_name: 'Quinn',
        email: 'david.quinn@company.com',
        active: true,
        roles: 'user',
        title: 'Network Engineer',
        department: 'IT',
        phone: '555-0027'
      },
      {
        sys_id: 'user125',
        user_name: 'emma.roberts',
        first_name: 'Emma',
        last_name: 'Roberts',
        email: 'emma.roberts@company.com',
        active: true,
        roles: 'user',
        title: 'Backup Administrator',
        department: 'IT',
        phone: '555-0028'
      },
      {
        sys_id: 'user126',
        user_name: 'frank.scott',
        first_name: 'Frank',
        last_name: 'Scott',
        email: 'frank.scott@company.com',
        active: true,
        roles: 'user',
        title: 'Document Scanner User',
        department: 'Administration',
        phone: '555-0029'
      },
      {
        sys_id: 'user127',
        user_name: 'grace.turner',
        first_name: 'Grace',
        last_name: 'Turner',
        email: 'grace.turner@company.com',
        active: true,
        roles: 'user',
        title: 'Database User',
        department: 'Analytics',
        phone: '555-0030'
      },
      {
        sys_id: 'user128',
        user_name: 'harry.walker',
        first_name: 'Harry',
        last_name: 'Walker',
        email: 'harry.walker@company.com',
        active: true,
        roles: 'user',
        title: 'Remote Team Lead',
        department: 'Management',
        phone: '555-0031'
      },
      {
        sys_id: 'user129',
        user_name: 'iris.young',
        first_name: 'Iris',
        last_name: 'Young',
        email: 'iris.young@company.com',
        active: true,
        roles: 'user',
        title: 'SSL Certificate Manager',
        department: 'Security',
        phone: '555-0032'
      },
      {
        sys_id: 'user130',
        user_name: 'jack.anderson',
        first_name: 'Jack',
        last_name: 'Anderson',
        email: 'jack.anderson@company.com',
        active: true,
        roles: 'user',
        title: 'Field Technician',
        department: 'Field Services',
        phone: '555-0033'
      },
      {
        sys_id: 'user131',
        user_name: 'karen.brown',
        first_name: 'Karen',
        last_name: 'Brown',
        email: 'karen.brown@company.com',
        active: true,
        roles: 'user',
        title: 'Production Manager',
        department: 'Operations',
        phone: '555-0034'
      },
      {
        sys_id: 'user132',
        user_name: 'liam.clark',
        first_name: 'Liam',
        last_name: 'Clark',
        email: 'liam.clark@company.com',
        active: true,
        roles: 'user',
        title: 'Network Technician',
        department: 'IT',
        phone: '555-0035'
      },
      {
        sys_id: 'user133',
        user_name: 'mia.davis',
        first_name: 'Mia',
        last_name: 'Davis',
        email: 'mia.davis@company.com',
        active: true,
        roles: 'user',
        title: 'Software Tester',
        department: 'QA',
        phone: '555-0036'
      },
      {
        sys_id: 'user134',
        user_name: 'noah.evans',
        first_name: 'Noah',
        last_name: 'Evans',
        email: 'noah.evans@company.com',
        active: true,
        roles: 'user',
        title: 'Report Analyst',
        department: 'Business Intelligence',
        phone: '555-0037'
      },
      {
        sys_id: 'user135',
        user_name: 'olivia.ford',
        first_name: 'Olivia',
        last_name: 'Ford',
        email: 'olivia.ford@company.com',
        active: true,
        roles: 'user',
        title: 'Graphic Designer',
        department: 'Design',
        phone: '555-0038'
      },
      {
        sys_id: 'user136',
        user_name: 'peter.garcia',
        first_name: 'Peter',
        last_name: 'Garcia',
        email: 'peter.garcia@company.com',
        active: true,
        roles: 'user',
        title: 'Cloud Storage User',
        department: 'Engineering',
        phone: '555-0039'
      },
      {
        sys_id: 'user137',
        user_name: 'quinn.harris',
        first_name: 'Quinn',
        last_name: 'Harris',
        email: 'quinn.harris@company.com',
        active: true,
        roles: 'user',
        title: 'Network Administrator',
        department: 'IT',
        phone: '555-0040'
      },
      {
        sys_id: 'user138',
        user_name: 'ruby.johnson',
        first_name: 'Ruby',
        last_name: 'Johnson',
        email: 'ruby.johnson@company.com',
        active: true,
        roles: 'user',
        title: 'Video Conference User',
        department: 'Communications',
        phone: '555-0041'
      },
      {
        sys_id: 'user139',
        user_name: 'steve.kim',
        first_name: 'Steve',
        last_name: 'Kim',
        email: 'steve.kim@company.com',
        active: true,
        roles: 'user',
        title: 'Database Administrator',
        department: 'IT',
        phone: '555-0042'
      },
      {
        sys_id: 'user140',
        user_name: 'tara.lee',
        first_name: 'Tara',
        last_name: 'Lee',
        email: 'tara.lee@company.com',
        active: true,
        roles: 'user',
        title: 'Security Policy Manager',
        department: 'Security',
        phone: '555-0043'
      },
      {
        sys_id: 'user141',
        user_name: 'uma.martin',
        first_name: 'Uma',
        last_name: 'Martin',
        email: 'uma.martin@company.com',
        active: true,
        roles: 'user',
        title: 'Mobile App Developer',
        department: 'Mobile',
        phone: '555-0044'
      },
      {
        sys_id: 'user142',
        user_name: 'victor.nelson',
        first_name: 'Victor',
        last_name: 'Nelson',
        email: 'victor.nelson@company.com',
        active: true,
        roles: 'user',
        title: 'Server Administrator',
        department: 'Infrastructure',
        phone: '555-0045'
      },
      {
        sys_id: 'user143',
        user_name: 'wendy.parker',
        first_name: 'Wendy',
        last_name: 'Parker',
        email: 'wendy.parker@company.com',
        active: true,
        roles: 'user',
        title: 'Calendar Administrator',
        department: 'Administration',
        phone: '555-0046'
      }
    ];

    // Mock assignment group data
    this.mockData.sys_user_group = [
      {
        sys_id: 'group001',
        name: 'Network Team',
        description: 'Network infrastructure support team',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group002',
        name: 'Application Team',
        description: 'Application development and support team',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group003',
        name: 'Desktop Support',
        description: 'End user desktop and hardware support',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group004',
        name: 'Database Team',
        description: 'Database administration and support',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group005',
        name: 'Security Team',
        description: 'Information security and compliance',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group006',
        name: 'Infrastructure Team',
        description: 'Server and infrastructure management',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group007',
        name: 'Mobile Team',
        description: 'Mobile application development and support',
        active: true,
        type: 'itil_group'
      },
      {
        sys_id: 'group008',
        name: 'Web Team',
        description: 'Web application development and support',
        active: true,
        type: 'itil_group'
      }
    ];

    // Mock knowledge base articles
    this.mockData.kb_knowledge = [
      {
        sys_id: 'kb001',
        number: 'KB0000001',
        short_description: 'How to reset password',
        text: 'Steps to reset user password in the system...',
        category: 'User Account Management',
        article_type: 'how_to',
        valid_to: '2025-12-31',
        workflow_state: 'published'
      },
      {
        sys_id: 'kb002',
        number: 'KB0000002',
        short_description: 'Troubleshooting network connectivity',
        text: 'Common network connectivity issues and solutions...',
        category: 'Network',
        article_type: 'troubleshooting',
        valid_to: '2025-12-31',
        workflow_state: 'published'
      },
      {
        sys_id: 'kb003',
        number: 'KB0000003',
        short_description: 'VPN setup guide',
        text: 'Step by step guide for setting up VPN connection...',
        category: 'Network',
        article_type: 'how_to',
        valid_to: '2025-12-31',
        workflow_state: 'published'
      }
    ];

    // Mock change request data
    this.mockData.change_request = [
      {
        sys_id: 'chg001',
        number: 'CHG0000001',
        short_description: 'Server maintenance window',
        priority: '3',
        state: '1',
        category: 'Infrastructure',
        assignment_group: 'Infrastructure Team',
        requested_by: 'admin',
        sys_created_on: '2024-01-15 09:00:00',
        planned_start_date: '2024-01-20 02:00:00',
        planned_end_date: '2024-01-20 06:00:00'
      },
      {
        sys_id: 'chg002',
        number: 'CHG0000002',
        short_description: 'Application deployment',
        priority: '2',
        state: '2',
        category: 'Software',
        assignment_group: 'Application Team',
        requested_by: 'jane.smith',
        sys_created_on: '2024-01-16 14:30:00',
        planned_start_date: '2024-01-18 18:00:00',
        planned_end_date: '2024-01-18 20:00:00'
      }
    ];
  }

  // Mock GlideRecord class
  createGlideRecord(table: string) {
    return new MockGlideRecord(table, this.mockData[table] || [], this);
  }

  // Public method to get mock data
  getMockData(table?: string) {
    if (table) {
      return this.mockData[table] || [];
    }
    return this.mockData;
  }

  // Mock global functions
  createGlobalMocks() {
    const sandbox = this;
    
    return {
      // Mock gs (GlideSystem) object
      gs: {
        log: (message: string, source?: string) => {
          sandbox.addLog('log', message, source);
        },
        info: (message: string, source?: string) => {
          sandbox.addLog('info', message, source);
        },
        warn: (message: string, source?: string) => {
          sandbox.addLog('warn', message, source);
        },
        error: (message: string, source?: string) => {
          sandbox.addLog('error', message, source);
        },
        debug: (message: string, source?: string) => {
          sandbox.addLog('debug', message, source);
        },
        getUser: () => ({
          getID: () => 'user123',
          getName: () => 'admin',
          getFirstName: () => 'System',
          getLastName: () => 'Administrator',
          getEmail: () => 'admin@company.com'
        }),
        getUserID: () => 'user123',
        getUserName: () => 'admin',
        hasRole: (role: string) => ['admin', 'itil'].includes(role),
        nil: (value: any) => value === null || value === undefined || value === '',
        addInfoMessage: (message: string) => sandbox.addLog('info', message, 'UI'),
        addErrorMessage: (message: string) => sandbox.addLog('error', message, 'UI')
      },
      
      // Mock g_form object for client scripts
      g_form: {
        getValue: (field: string) => {
          // Return mock values based on field
          const mockValues: Record<string, any> = {
            category: 'Hardware',
            priority: '2',
            short_description: 'Test description',
            caller_id: 'john.doe'
          };
          return mockValues[field] || '';
        },
        setValue: (field: string, value: any) => {
          sandbox.addLog('info', `Set ${field} = ${value}`, 'g_form');
        },
        showFieldMsg: (field: string, message: string, type: string) => {
          sandbox.addLog('warn', `Field message: ${field} - ${message}`, 'g_form');
        },
        hideFieldMsg: (field: string) => {
          sandbox.addLog('info', `Cleared field message for: ${field}`, 'g_form');
        },
        addOption: (field: string, value: string, label: string) => {
          sandbox.addLog('info', `Added option to ${field}: ${value}=${label}`, 'g_form');
        },
        clearOptions: (field: string) => {
          sandbox.addLog('info', `Cleared options for: ${field}`, 'g_form');
        }
      },
      
      // Mock current object for business rules
      current: {
        getValue: (field: string) => {
          const mockRecord: Record<string, any> = {
            category: 'Hardware',
            priority: '2',
            assignment_group: '',
            state: '1',
            sys_id: '1234567890abcdef'
          };
          return mockRecord[field] || '';
        },
        setValue: (field: string, value: any) => {
          sandbox.addLog('info', `Current record: Set ${field} = ${value}`, 'BusinessRule');
        },
        update: () => {
          sandbox.addLog('info', 'Record updated', 'BusinessRule');
        }
      },
      
      // Mock sn_ws for REST API
      sn_ws: {
        RESTMessageV2: function(this: any, name: string, method: string) {
          this.name = name;
          this.method = method;
          this.endpoint = '';
          this.headers = {};
          this.body = '';
          
          this.setEndpoint = (url: string) => {
            this.endpoint = url;
            sandbox.addLog('info', `REST endpoint set: ${url}`, 'REST');
          };
          
          this.setRequestHeader = (name: string, value: string) => {
            this.headers[name] = value;
            sandbox.addLog('debug', `REST header: ${name}=${value}`, 'REST');
          };
          
          this.setRequestBody = (body: string) => {
            this.body = body;
            sandbox.addLog('debug', 'REST body set', 'REST');
          };
          
          this.execute = () => {
            sandbox.addLog('info', `REST request executed: ${this.method} ${this.endpoint}`, 'REST');
            return {
              getStatusCode: () => 200,
              getBody: () => JSON.stringify({
                result: 'success',
                data: { id: '12345', status: 'completed' }
              }),
              getHeaders: () => ({ 'Content-Type': 'application/json' })
            };
          };
          
          return this;
        }
      },
      
      // Mock Class for Script Includes
      Class: {
        create: function() {
          return function(this: any) {
            // Constructor function
            sandbox.addLog('info', 'Script Include initialized', 'ScriptInclude');
            
            // Add prototype methods
            this.initialize = function() {
              sandbox.addLog('debug', 'Script Include initialize called', 'ScriptInclude');
            };
            
            return this;
          };
        }
      },
      
      // Mock GlideRecord constructor
      GlideRecord: function(this: any, table: string) {
        return sandbox.createGlideRecord(table);
      },
      
      // Mock GlideAggregate
      GlideAggregate: function(this: any, table: string) {
        const mockAggregate = {
          addAggregate: (aggregate: string, field?: string) => {
            sandbox.addLog('info', `Aggregate added: ${aggregate} on ${field || 'count'}`, 'GlideAggregate');
          },
          addQuery: (field: string, operator?: string, value?: any) => {
            sandbox.addLog('info', `Aggregate query: ${field} ${operator} ${value}`, 'GlideAggregate');
          },
          query: () => {
            sandbox.addLog('info', 'Aggregate query executed', 'GlideAggregate');
          },
          next: () => true,
          getAggregate: (aggregate: string, field?: string) => {
            return Math.floor(Math.random() * 100); // Mock aggregate result
          }
        };
        return mockAggregate;
      },
      
      // Mock GlideDateTime
      GlideDateTime: function(this: any, dateString?: string) {
        const mockDateTime = {
          getValue: () => dateString || new Date().toISOString(),
          getDisplayValue: () => dateString || new Date().toLocaleDateString(),
          addDaysUTC: (days: number) => {
            sandbox.addLog('info', `Added ${days} days to date`, 'GlideDateTime');
          },
          addSeconds: (seconds: number) => {
            sandbox.addLog('info', `Added ${seconds} seconds to date`, 'GlideDateTime');
          }
        };
        return mockDateTime;
      },
      
      // Mock GlideDate
      GlideDate: function(this: any) {
        const mockDate = {
          getValue: () => new Date().toISOString().split('T')[0],
          getDisplayValue: () => new Date().toLocaleDateString(),
          setDisplayValue: (value: string) => {
            sandbox.addLog('info', `Date set to: ${value}`, 'GlideDate');
          }
        };
        return mockDate;
      },
      
      // Mock GlideModal
      GlideModal: function(this: any) {
        const mockModal = {
          setTitle: (title: string) => {
            sandbox.addLog('info', `Modal title: ${title}`, 'GlideModal');
          },
          setBody: (body: string) => {
            sandbox.addLog('info', 'Modal body set', 'GlideModal');
          },
          renderWithContent: (content: string) => {
            sandbox.addLog('info', 'Modal rendered with content', 'GlideModal');
          },
          render: () => {
            sandbox.addLog('info', 'Modal rendered', 'GlideModal');
          }
        };
        return mockModal;
      },
      
      // Mock GlideAjax
      GlideAjax: function(this: any, scriptInclude: string) {
        const mockAjax = {
          addParam: (name: string, value: string) => {
            sandbox.addLog('info', `Ajax param: ${name}=${value}`, 'GlideAjax');
          },
          getXMLWait: () => {
            sandbox.addLog('info', 'Ajax request executed (synchronous)', 'GlideAjax');
            return '<?xml version="1.0" ?><xml><result>success</result></xml>';
          },
          getXMLAnswer: () => {
            return 'success';
          }
        };
        return mockAjax;
      },
      
      // Security violation detection
      eval: () => {
        sandbox.addSecurityViolation('eval() is not allowed');
        throw new Error('Security violation: eval() is not allowed');
      },
      Function: () => {
        sandbox.addSecurityViolation('Function() constructor is not allowed');
        throw new Error('Security violation: Function() constructor is not allowed');
      }
    };
  }

  addLog(type: LogEntry['type'], message: string, source?: string) {
    this.logs.push({
      type,
      message,
      source: source || 'System',
      timestamp: new Date().toLocaleTimeString()
    });
  }

  addSecurityViolation(violation: string) {
    this.securityViolations.push(violation);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getSecurityViolations(): string[] {
    return [...this.securityViolations];
  }

  clearLogs() {
    this.logs = [];
  }

  clearSecurityViolations() {
    this.securityViolations = [];
  }
}

// Mock GlideRecord implementation
class MockGlideRecord {
  private table: string;
  private data: any[];
  private currentIndex: number = -1;
  private queryFilters: Array<{ field: string; operator: string; value: any }> = [];
  private sandbox: ServiceNowSandbox;
  private orderByFields: Array<{ field: string; descending: boolean }> = [];

  constructor(table: string, data: any[], sandbox: ServiceNowSandbox) {
    this.table = table;
    this.data = data || [];
    this.sandbox = sandbox;
    sandbox.addLog('info', `GlideRecord initialized for table: ${table}`, 'GlideRecord');
  }

  addQuery(field: string, operator?: string, value?: any) {
    if (arguments.length === 2) {
      // addQuery(field, value) format
      value = operator;
      operator = '=';
    } else if (arguments.length === 1) {
      // addQuery(encoded_query) format - simplified parsing
      const parts = field.split('=');
      if (parts.length === 2) {
        field = parts[0];
        operator = '=';
        value = parts[1];
      }
    }
    
    this.queryFilters.push({ field, operator: operator || '=', value });
    this.sandbox.addLog('debug', `Query filter added: ${field} ${operator} ${value}`, 'GlideRecord');
  }

  addEncodedQuery(encodedQuery: string) {
    // Simplified encoded query parsing
    const conditions = encodedQuery.split('^');
    conditions.forEach(condition => {
      const parts = condition.split('=');
      if (parts.length === 2) {
        this.addQuery(parts[0], '=', parts[1]);
      }
    });
  }

  query() {
    this.sandbox.addLog('info', `Database query executed on ${this.table}`, 'Database');
    
    // Apply filters to data
    let filteredData = [...this.data];
    
    this.queryFilters.forEach(filter => {
      filteredData = filteredData.filter(record => {
        const fieldValue = record[filter.field];
        
        switch (filter.operator) {
          case '=':
            return fieldValue === filter.value;
          case '!=':
            return fieldValue !== filter.value;
          case '>':
            return fieldValue > filter.value;
          case '>=':
            return fieldValue >= filter.value;
          case '<':
            return fieldValue < filter.value;
          case '<=':
            return fieldValue <= filter.value;
          case 'CONTAINS':
            return String(fieldValue).includes(String(filter.value));
          case 'STARTSWITH':
            return String(fieldValue).startsWith(String(filter.value));
          default:
            return fieldValue === filter.value;
        }
      });
    });

    // Apply ordering
    this.orderByFields.forEach(order => {
      filteredData.sort((a, b) => {
        const aVal = a[order.field];
        const bVal = b[order.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order.descending ? -comparison : comparison;
      });
    });

    this.data = filteredData;
    this.currentIndex = -1;
    
    this.sandbox.addLog('info', `Query returned ${this.data.length} records`, 'Database');
  }

  next(): boolean {
    this.currentIndex++;
    const hasNext = this.currentIndex < this.data.length;
    if (hasNext) {
      this.sandbox.addLog('debug', `Processing record ${this.currentIndex + 1} of ${this.data.length}`, 'GlideRecord');
    }
    return hasNext;
  }

  get(field?: string | number): boolean {
    if (typeof field === 'string') {
      // Get by field value
      const found = this.data.find(record => record.sys_id === field || record.number === field);
      if (found) {
        this.data = [found];
        this.currentIndex = 0;
        this.sandbox.addLog('info', `Record found: ${field}`, 'GlideRecord');
        return true;
      }
      return false;
    } else if (typeof field === 'number') {
      // Get by index
      if (field >= 0 && field < this.data.length) {
        this.currentIndex = field;
        return true;
      }
      return false;
    } else {
      // Get first record
      this.query();
      return this.next();
    }
  }

  getValue(field: string): any {
    if (this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      const value = this.data[this.currentIndex][field];
      this.sandbox.addLog('debug', `getValue(${field}) = ${value}`, 'GlideRecord');
      return value;
    }
    return '';
  }

  setValue(field: string, value: any) {
    if (this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      this.data[this.currentIndex][field] = value;
      this.sandbox.addLog('info', `setValue(${field}, ${value})`, 'GlideRecord');
    }
  }

  update(): string {
    if (this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      this.sandbox.addLog('info', 'Record updated in database', 'GlideRecord');
      return this.data[this.currentIndex].sys_id || 'mock_sys_id';
    }
    return '';
  }

  insert(): string {
    const newRecord = { sys_id: 'new_' + Date.now() };
    this.data.push(newRecord);
    this.currentIndex = this.data.length - 1;
    this.sandbox.addLog('info', 'New record inserted', 'GlideRecord');
    return newRecord.sys_id;
  }

  deleteRecord(): boolean {
    if (this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      this.data.splice(this.currentIndex, 1);
      this.sandbox.addLog('info', 'Record deleted', 'GlideRecord');
      return true;
    }
    return false;
  }

  getRowCount(): number {
    return this.data.length;
  }

  orderBy(field: string) {
    this.orderByFields.push({ field, descending: false });
  }

  orderByDesc(field: string) {
    this.orderByFields.push({ field, descending: true });
  }

  hasNext(): boolean {
    return this.currentIndex + 1 < this.data.length;
  }

  // Dynamic property access for field values
  [key: string]: any;
}

// Add property getters/setters to MockGlideRecord prototype
const mockGlideRecordHandler = {
  get(target: MockGlideRecord, prop: string) {
    if (prop in target) {
      return (target as any)[prop];
    }
    // If it's not a method, treat it as a field access
    if (typeof prop === 'string' && !prop.startsWith('_')) {
      return target.getValue(prop);
    }
    return undefined;
  },
  
  set(target: MockGlideRecord, prop: string, value: any) {
    if (prop in target) {
      (target as any)[prop] = value;
      return true;
    }
    // If it's not a method, treat it as a field assignment
    if (typeof prop === 'string' && !prop.startsWith('_')) {
      target.setValue(prop, value);
      return true;
    }
    return false;
  }
};

// Enhanced proxy for MockGlideRecord
function createProxiedGlideRecord(table: string, data: any[], sandbox: ServiceNowSandbox) {
  const mockRecord = new MockGlideRecord(table, data, sandbox);
  return new Proxy(mockRecord, mockGlideRecordHandler);
}

// Main sandbox executor
export class SandboxExecutor {
  private sandbox: ServiceNowSandbox;

  constructor() {
    this.sandbox = new ServiceNowSandbox();
  }

  async executeCode(code: string, question: Question): Promise<CodeExecutionResult> {
    const testResults: ExecutionResult[] = [];
    let allPassed = true;

    for (const testCase of question.testCases) {
      const result = await this.executeTestCase(code, testCase, question);
      testResults.push(result);
      if (!result.passed) {
        allPassed = false;
      }
    }

    const logs = this.sandbox.getLogs();
    const securityViolations = this.sandbox.getSecurityViolations();
    
    // Generate output string
    let output = 'Test Results:\n';
    testResults.forEach((result, index) => {
      output += `\nTest ${index + 1}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`;
      if (result.executionTime) {
        output += ` (${result.executionTime}ms)`;
      }
      output += `\nDescription: ${result.description}\n`;
      output += `Expected: ${JSON.stringify(result.expected)}\n`;
      output += `Actual: ${JSON.stringify(result.actual)}\n`;
      if (result.error) {
        output += `Error: ${result.error}\n`;
      }
    });

    if (logs.length > 0) {
      output += '\n\nLogs:\n';
      logs.forEach(log => {
        const icon = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️';
        output += `${icon} [${log.timestamp}] ${log.source}: ${log.message}\n`;
      });
    }

    if (securityViolations.length > 0) {
      output += '\n🚨 Security Violations:\n';
      securityViolations.forEach(violation => {
        output += `❌ ${violation}\n`;
      });
      allPassed = false;
    }

    if (allPassed) {
      output += '\n🎉 All tests passed! Great job!';
    }

    const testsPassed = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;

    // Clear sandbox for next execution
    this.sandbox.clearLogs();
    this.sandbox.clearSecurityViolations();

    return {
      testResults,
      logs,
      allPassed: allPassed && securityViolations.length === 0,
      output,
      testsPassed,
      totalTests,
      securityViolations
    };
  }

  private async executeTestCase(code: string, testCase: TestCase, question: Question): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Create isolated sandbox context
      const mocks = this.sandbox.createGlobalMocks();
      
      // Override GlideRecord constructor to return proxied version with proper sandbox reference
      const sandboxRef = this.sandbox;
      mocks.GlideRecord = function(table: string) {
        return createProxiedGlideRecord(table, sandboxRef.getMockData(table), sandboxRef);
      };

      // Create function context with mocks
      const context = {
        ...mocks,
        // Add test input to context
        ...testCase.input,
        // Common utilities
        JSON: JSON,
        Math: Math,
        Date: Date,
        String: String,
        Number: Number,
        Array: Array,
        Object: Object,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        console: {
          log: (msg: string) => this.sandbox.addLog('log', String(msg), 'console'),
          warn: (msg: string) => this.sandbox.addLog('warn', String(msg), 'console'),
          error: (msg: string) => this.sandbox.addLog('error', String(msg), 'console')
        }
      };

      // Security checks
      if (this.containsUnsafeCode(code)) {
        throw new Error('Security violation: Code contains unsafe operations');
      }

      // Execute the code in isolated context
      const result = this.executeInContext(code, context, testCase.input);
      const executionTime = Date.now() - startTime;

      // Compare result with expected output
      const passed = this.deepEqual(result, testCase.expected);

      return {
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual: result,
        description: testCase.description,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.sandbox.addLog('error', `Execution failed: ${errorMessage}`, 'Executor');

      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        description: testCase.description,
        error: errorMessage,
        executionTime
      };
    }
  }

  private executeInContext(code: string, context: any, input: any): any {
    // Extract function name from code (assume it's the first function declaration)
    const functionMatch = code.match(/function\s+(\w+)\s*\(/);
    if (!functionMatch) {
      throw new Error('No function declaration found in code');
    }

    const functionName = functionMatch[1];

    // Create a safe function execution environment
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);

    try {
      // Create function that returns the user's function
      const functionCode = `
        ${code}
        return ${functionName};
      `;

      // Execute in controlled context
      const userFunction = new Function(...contextKeys, functionCode)(...contextValues);

      if (typeof userFunction !== 'function') {
        throw new Error(`${functionName} is not a function`);
      }

      // Call the user's function with test input
      const inputValues = Object.values(input);
      return userFunction(...inputValues);

    } catch (error) {
      throw new Error(`Function execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private containsUnsafeCode(code: string): boolean {
    const unsafePatterns = [
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /\bsetTimeout\s*\(/,
      /\bsetInterval\s*\(/,
      /\bimport\s+/,
      /\brequire\s*\(/,
      /\bprocess\b/,
      /\b__proto__\b/,
      /\bconstructor\s*\.\s*constructor\b/,
      /\bdocument\b/,
      /\bwindow\b/,
      /\blocation\b/,
      /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/
    ];

    return unsafePatterns.some(pattern => pattern.test(code));
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
      return a === b;
    }
    
    if (a === null || a === undefined || b === null || b === undefined) {
      return false;
    }
    
    if (a.prototype !== b.prototype) return false;
    
    let keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }
    
    return keys.every(k => this.deepEqual(a[k], b[k]));
  }
}

// Export the main function for compatibility with existing code
export const executeCode = async (code: string, testCases: TestCase[]): Promise<CodeExecutionResult> => {
  const executor = new SandboxExecutor();
  
  // Create a mock question object with the test cases
  const mockQuestion: Question = {
    id: 'test',
    title: 'Test Question',
    description: 'Test',
    difficulty: 'Easy',
    category: 'Test',
    tags: [],
    starterCode: '',
    solution: '',
    testCases: testCases,
    hints: [],
    examples: [],
    constraints: [],
    estimatedTime: '5 min'
  };

  return executor.executeCode(code, mockQuestion);
};