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
    // Mock incident data
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
        sys_updated_on: '2024-01-01 11:00:00'
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
        sys_updated_on: '2024-01-02 10:00:00'
      }
    ];

    // Mock user data
    this.mockData.sys_user = [
      {
        sys_id: 'user123',
        user_name: 'admin',
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@company.com',
        active: true,
        roles: 'admin,itil',
        title: 'System Administrator'
      },
      {
        sys_id: 'user456',
        user_name: 'john.doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        active: true,
        roles: 'itil',
        title: 'IT Analyst'
      }
    ];
  }

  // Mock GlideRecord class
  createGlideRecord(table: string) {
    return new MockGlideRecord(table, this.mockData[table] || [], this);
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
  private orderBy: Array<{ field: string; descending: boolean }> = [];

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
    this.orderBy.forEach(order => {
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
    this.orderBy.push({ field, descending: false });
  }

  orderByDesc(field: string) {
    this.orderBy.push({ field, descending: true });
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
      
      // Override GlideRecord constructor to return proxied version
      mocks.GlideRecord = function(table: string) {
        return createProxiedGlideRecord(table, this.sandbox.mockData[table] || [], this.sandbox);
      }.bind(this);

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