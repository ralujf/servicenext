import { Question, TestCase } from '../data/questions';

export interface ExecutionResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  description?: string;
  error?: string;
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
}

export interface CodeAnalysis {
  hasGlideRecord: boolean;
  hasProperQueries: boolean;
  hasLooping: boolean;
  hasErrorHandling: boolean;
  usesCorrectMethods: boolean;
  returnStatement: boolean;
  syntaxValid: boolean;
}

export class ServiceNowCodeExecutor {
  
  static analyzeCode(code: string, questionId: string): CodeAnalysis {
    const cleanCode = code.toLowerCase().trim();
    
    return {
      hasGlideRecord: /new\s+gliderecord\s*\(/i.test(code),
      hasProperQueries: /addquery\s*\(/i.test(code) || /get\s*\(/i.test(code),
      hasLooping: /while\s*\(\s*\w+\.next\s*\(\s*\)\s*\)/i.test(code) || /for\s*\(/i.test(code),
      hasErrorHandling: /try\s*\{|catch\s*\(/i.test(code),
      usesCorrectMethods: this.checkCorrectMethods(code, questionId),
      returnStatement: /return\s+/i.test(code),
      syntaxValid: this.checkBasicSyntax(code)
    };
  }

  static checkCorrectMethods(code: string, questionId: string): boolean {
    switch (questionId) {
      case '1': // GlideRecord query
        return /addquery/i.test(code) && /getvalue/i.test(code);
      case '2': // Business rule
        return /setvalue/i.test(code) && /getvalue/i.test(code);
      case '3': // Script Include
        return /class\.create/i.test(code) && /prototype/i.test(code);
      case '4': // Client Script
        return /g_form\.(showfieldmsg|hidefieldmsg)/i.test(code);
      case '5': // REST API
        return /sn_ws\.restmessagev2/i.test(code) && /execute/i.test(code);
      default:
        return true;
    }
  }

  static checkBasicSyntax(code: string): boolean {
    // Basic syntax checks
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    
    return openBraces === closeBraces && openParens === closeParens;
  }

  static executeCode(code: string, question: Question): ExecutionResult[] {
    const analysis = this.analyzeCode(code, question.id);
    
    // If basic syntax is invalid, fail all tests
    if (!analysis.syntaxValid) {
      return question.testCases.map((testCase, index) => ({
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Syntax Error',
        description: testCase.description,
        error: 'Code has syntax errors (mismatched brackets or parentheses)'
      }));
    }

    // Question-specific validation
    switch (question.id) {
      case '1':
        return this.executeGlideRecordQuestion(code, question, analysis);
      case '2':
        return this.executeBusinessRuleQuestion(code, question, analysis);
      case '3':
        return this.executeScriptIncludeQuestion(code, question, analysis);
      case '4':
        return this.executeClientScriptQuestion(code, question, analysis);
      case '5':
        return this.executeRESTAPIQuestion(code, question, analysis);
      default:
        return this.executeGenericQuestion(code, question, analysis);
    }
  }

  static executeCodeWithLogs(code: string, question: Question): CodeExecutionResult {
    const testResults = this.executeCode(code, question);
    const logs = this.extractLogs(code, question);
    const allPassed = testResults.every(result => result.passed);
    
    // Generate output string
    let output = 'Test Results:\n';
    testResults.forEach((result, index) => {
      output += `\nTest ${index + 1}: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`;
      output += `Description: ${result.description}\n`;
      output += `Expected: ${result.expected}\n`;
      output += `Actual: ${result.actual}\n`;
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
    
    if (allPassed) {
      output += '\n🎉 All tests passed! Great job!';
    } else {
      const feedback = this.getCodeFeedback(code, question);
      if (feedback !== '✅ Your code structure looks good!') {
        output += '\n\nHints:\n' + feedback;
      }
    }
    
    const testsPassed = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;
    
    return {
      testResults,
      logs,
      allPassed,
      output,
      testsPassed,
      totalTests
    };
  }

  static extractLogs(code: string, question: Question): LogEntry[] {
    const logs: LogEntry[] = [];
    const now = new Date().toLocaleTimeString();

    // Extract gs.log statements
    const logMatches = code.match(/gs\.(log|warn|info|debug|error)\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*['"`]([^'"`]*?)['"`])?\s*\)/gi);
    
    if (logMatches) {
      logMatches.forEach((match, index) => {
        const logMatch = match.match(/gs\.(log|warn|info|debug|error)\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*['"`]([^'"`]*?)['"`])?\s*\)/i);
        if (logMatch) {
          const [, type, message, source] = logMatch;
          logs.push({
            type: type.toLowerCase() as LogEntry['type'],
            message: message,
            source: source || question.category,
            timestamp: now
          });
        }
      });
    }

    // Add simulated logs based on question execution
    switch (question.id) {
      case '1':
        if (/new\s+gliderecord/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'GlideRecord initialized for incident table',
            source: 'System',
            timestamp: now
          });
        }
        if (/addquery/i.test(code)) {
          logs.push({
            type: 'debug',
            message: 'Query filters applied successfully',
            source: 'GlideRecord',
            timestamp: now
          });
        }
        if (/\.query\(\)/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'Database query executed - 2 records found',
            source: 'Database',
            timestamp: now
          });
        }
        break;
        
      case '2':
        if (/getvalue.*category/i.test(code)) {
          logs.push({
            type: 'debug',
            message: 'Retrieved category value: Hardware',
            source: 'BusinessRule',
            timestamp: now
          });
        }
        if (/setvalue.*assignment_group/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'Assignment group updated successfully',
            source: 'BusinessRule',
            timestamp: now
          });
        }
        break;
        
      case '3':
        if (/class\.create/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'UserUtils Script Include initialized',
            source: 'ScriptInclude',
            timestamp: now
          });
        }
        if (/getfullname/i.test(code)) {
          logs.push({
            type: 'debug',
            message: 'getFullName method called for user: admin',
            source: 'UserUtils',
            timestamp: now
          });
        }
        break;
        
      case '4':
        if (/g_form\.showfieldmsg/i.test(code)) {
          logs.push({
            type: 'warn',
            message: 'Field validation failed - displaying error message',
            source: 'ClientScript',
            timestamp: now
          });
        }
        if (/g_form\.hidefieldmsg/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'Field validation passed - clearing error message',
            source: 'ClientScript',
            timestamp: now
          });
        }
        break;
        
      case '5':
        if (/restmessagev2/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'REST Message initialized',
            source: 'Integration',
            timestamp: now
          });
        }
        if (/execute/i.test(code)) {
          logs.push({
            type: 'info',
            message: 'HTTP request executed - Status: 200 OK',
            source: 'REST',
            timestamp: now
          });
        }
        if (/json\.parse/i.test(code)) {
          logs.push({
            type: 'debug',
            message: 'JSON response parsed successfully',
            source: 'Integration',
            timestamp: now
          });
        }
        break;
    }

    // Add error logs for syntax issues
    if (!this.checkBasicSyntax(code)) {
      logs.push({
        type: 'error',
        message: 'Syntax error detected in code',
        source: 'Parser',
        timestamp: now
      });
    }

    return logs;
  }

  static executeGlideRecordQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    // Check for required GlideRecord patterns
    const hasDateQuery = /addquery.*sys_created_on/i.test(code) || /addquery.*created/i.test(code);
    const hasPriorityQuery = /addquery.*priority/i.test(code);
    const hasLoop = analysis.hasLooping;
    const hasReturn = analysis.returnStatement;
    
    let score = 0;
    if (analysis.hasGlideRecord) score += 25;
    if (hasDateQuery) score += 25;
    if (hasPriorityQuery) score += 25;
    if (hasLoop && hasReturn) score += 25;

    // Simulate test results based on implementation quality
    question.testCases.forEach((testCase, index) => {
      const passed = score >= 75;
      let actual = testCase.expected;
      
      if (!passed) {
        if (!analysis.hasGlideRecord) {
          actual = 'Error: GlideRecord not found';
        } else if (!hasDateQuery) {
          actual = 'Error: Date filtering missing';
        } else if (!hasPriorityQuery) {
          actual = 'Error: Priority filtering missing';
        } else {
          actual = 'Error: Incomplete implementation';
        }
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description
      });
    });

    return results;
  }

  static executeBusinessRuleQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    const hasSwitch = /switch\s*\(/i.test(code);
    const hasIfElse = /if\s*\(.*\).*else/i.test(code);
    const hasGetValue = /getvalue\s*\(\s*['"]?category['"]?\s*\)/i.test(code);
    const hasSetValue = /setvalue\s*\(\s*['"]?assignment_group['"]?\s*\)/i.test(code);
    const hasLogging = /gs\.log/i.test(code);
    
    let score = 0;
    if (hasGetValue) score += 20;
    if (hasSetValue) score += 20;
    if (hasSwitch || hasIfElse) score += 30;
    if (hasLogging) score += 15;
    if (analysis.syntaxValid) score += 15;

    question.testCases.forEach((testCase, index) => {
      const passed = score >= 70;
      let actual = testCase.expected;
      
      if (!passed) {
        if (!hasGetValue) {
          actual = 'Error: Category not retrieved';
        } else if (!hasSetValue) {
          actual = 'Error: Assignment group not set';
        } else if (!hasSwitch && !hasIfElse) {
          actual = 'Error: Conditional logic missing';
        } else {
          actual = 'Error: Logic incomplete';
        }
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description
      });
    });

    return results;
  }

  static executeScriptIncludeQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    const hasClassCreate = /class\.create/i.test(code);
    const hasPrototype = /prototype\s*=/i.test(code);
    const hasInitialize = /initialize\s*:/i.test(code);
    const hasRequiredMethods = /getfullname/i.test(code) && /isuseractive/i.test(code) && /getuserroles/i.test(code);
    const hasErrorHandling = /if\s*\(.*\.get\s*\(/i.test(code);
    
    let score = 0;
    if (hasClassCreate) score += 20;
    if (hasPrototype) score += 20;
    if (hasRequiredMethods) score += 30;
    if (hasErrorHandling) score += 20;
    if (analysis.syntaxValid) score += 10;

    question.testCases.forEach((testCase, index) => {
      const passed = score >= 80;
      let actual = testCase.expected;
      
      if (!passed) {
        if (!hasClassCreate) {
          actual = 'Error: Class.create not found';
        } else if (!hasPrototype) {
          actual = 'Error: Prototype not defined';
        } else if (!hasRequiredMethods) {
          actual = 'Error: Required methods missing';
        } else {
          actual = 'Error: Implementation incomplete';
        }
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description
      });
    });

    return results;
  }

  static executeClientScriptQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    const hasLengthCheck = /\.length\s*[<>]=?\s*\d+/i.test(code);
    const hasNumberRegex = /\/.*\d.*\/\.test/i.test(code) || /isnan/i.test(code);
    const hasGFormMsg = /g_form\.(showfieldmsg|hidefieldmsg)/i.test(code);
    const hasValidation = /isvalid|valid\s*=/i.test(code);
    
    let score = 0;
    if (hasLengthCheck) score += 25;
    if (hasNumberRegex) score += 25;
    if (hasGFormMsg) score += 30;
    if (hasValidation) score += 20;

    question.testCases.forEach((testCase, index) => {
      const passed = score >= 70;
      let actual = testCase.expected;
      
      if (!passed) {
        if (!hasLengthCheck) {
          actual = 'Error: Length validation missing';
        } else if (!hasNumberRegex) {
          actual = 'Error: Number validation missing';
        } else if (!hasGFormMsg) {
          actual = 'Error: Form message methods missing';
        } else {
          actual = 'Error: Validation logic incomplete';
        }
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description
      });
    });

    return results;
  }

  static executeRESTAPIQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    const hasRESTMessage = /sn_ws\.restmessagev2/i.test(code);
    const hasEndpoint = /setendpoint/i.test(code);
    const hasExecute = /\.execute\s*\(\s*\)/i.test(code);
    const hasStatusCheck = /getstatuscode/i.test(code);
    const hasJSONParse = /json\.parse/i.test(code);
    const hasTryCatch = analysis.hasErrorHandling;
    
    let score = 0;
    if (hasRESTMessage) score += 20;
    if (hasEndpoint) score += 15;
    if (hasExecute) score += 20;
    if (hasStatusCheck) score += 15;
    if (hasJSONParse) score += 15;
    if (hasTryCatch) score += 15;

    question.testCases.forEach((testCase, index) => {
      const passed = score >= 75;
      let actual = testCase.expected;
      
      if (!passed) {
        if (!hasRESTMessage) {
          actual = 'Error: RESTMessageV2 not found';
        } else if (!hasEndpoint) {
          actual = 'Error: Endpoint not set';
        } else if (!hasExecute) {
          actual = 'Error: Execute method missing';
        } else if (!hasTryCatch) {
          actual = 'Error: Error handling missing';
        } else {
          actual = 'Error: Implementation incomplete';
        }
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description
      });
    });

    return results;
  }

  static executeGenericQuestion(code: string, question: Question, analysis: CodeAnalysis): ExecutionResult[] {
    // Fallback for other questions
    const hasBasicStructure = analysis.returnStatement && analysis.syntaxValid;
    const passed = hasBasicStructure;

    return question.testCases.map(testCase => ({
      passed,
      input: testCase.input,
      expected: testCase.expected,
      actual: passed ? testCase.expected : 'Implementation needed',
      description: testCase.description
    }));
  }

  static getCodeFeedback(code: string, question: Question): string {
    const analysis = this.analyzeCode(code, question.id);
    const feedback: string[] = [];

    if (!analysis.syntaxValid) {
      feedback.push('⚠️ Check your syntax - there may be mismatched brackets or parentheses.');
    }

    switch (question.id) {
      case '1':
        if (!analysis.hasGlideRecord) feedback.push('💡 You need to create a GlideRecord object.');
        if (!/addquery.*sys_created_on/i.test(code)) feedback.push('💡 Add a query for the creation date.');
        if (!/addquery.*priority/i.test(code)) feedback.push('💡 Add a query for priority filtering.');
        if (!analysis.hasLooping) feedback.push('💡 You need to loop through the results.');
        break;
      
      case '2':
        if (!/getvalue.*category/i.test(code)) feedback.push('💡 Get the category value from the current record.');
        if (!/setvalue.*assignment_group/i.test(code)) feedback.push('💡 Set the assignment_group field.');
        if (!/switch|if.*else/i.test(code)) feedback.push('💡 Use conditional logic to map categories to groups.');
        break;
      
      case '3':
        if (!/class\.create/i.test(code)) feedback.push('💡 Use Class.create() to define your Script Include.');
        if (!/prototype/i.test(code)) feedback.push('💡 Define methods on the prototype.');
        if (!/getfullname|isuseractive|getuserroles/i.test(code)) feedback.push('💡 Implement all required utility methods.');
        break;

      case '4':
        if (!/\.length/i.test(code)) feedback.push('💡 Check the string length for validation.');
        if (!/\/.*\d.*\/|isnan/i.test(code)) feedback.push('💡 Use regular expressions or isNaN to check for numbers.');
        if (!/g_form\.showfieldmsg/i.test(code)) feedback.push('💡 Use g_form.showFieldMsg() to display error messages.');
        if (!/g_form\.hidefieldmsg/i.test(code)) feedback.push('💡 Use g_form.hideFieldMsg() to clear error messages.');
        break;

      case '5':
        if (!/sn_ws\.restmessagev2/i.test(code)) feedback.push('💡 Use sn_ws.RESTMessageV2() for REST calls.');
        if (!/setendpoint/i.test(code)) feedback.push('💡 Set the endpoint URL for your API call.');
        if (!/execute/i.test(code)) feedback.push('💡 Execute the REST request.');
        if (!/getstatuscode/i.test(code)) feedback.push('💡 Check the HTTP status code.');
        if (!analysis.hasErrorHandling) feedback.push('💡 Add try-catch for error handling.');
        break;
    }

    if (!analysis.returnStatement && ['1', '3', '4', '5'].includes(question.id)) {
      feedback.push('💡 Make sure your function returns the expected value.');
    }

    return feedback.length > 0 ? feedback.join('\n') : '✅ Your code structure looks good!';
  }
}

// Legacy code executor - redirects to new sandbox executor for compatibility
import { executeCode as sandboxExecuteCode } from './sandboxExecutor';

// Export the main function that QuestionDetail expects
export const executeCode = async (code: string, testCases: TestCase[]): Promise<CodeExecutionResult> => {
  // Redirect to the new sandbox executor
  return sandboxExecuteCode(code, testCases);
};