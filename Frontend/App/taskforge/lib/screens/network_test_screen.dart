import 'package:flutter/material.dart';  
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

class NetworkTestScreen extends StatefulWidget {
  const NetworkTestScreen({super.key});

  @override
  State<NetworkTestScreen> createState() => _NetworkTestScreenState();
}

class _NetworkTestScreenState extends State<NetworkTestScreen> {
  final List<String> _testResults = [];
  bool _isRunning = false;

  void _addResult(String message) {
    setState(() {
      _testResults.add('${DateTime.now().toString().substring(11, 19)} - $message');
    });
  }

  Future<void> _testConnection() async {
    setState(() {
      _isRunning = true;
      _testResults.clear();
    });

    _addResult('🔍 Starting network connectivity tests...');

    // Test 1: Basic REST API Health Check
    await _testRestHealth();
    
    // Test 2: GraphQL Endpoint
    await _testGraphQLHealth();
    
    // Test 3: Test Authentication Endpoint
    await _testAuthEndpoint();

    setState(() {
      _isRunning = false;
    });
    
    _addResult('✅ All tests completed!');
  }

  Future<void> _testRestHealth() async {
    try {
      _addResult('🔍 Testing REST API health...');
      
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/health'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        _addResult('✅ REST API: Connected (${response.statusCode})');
        _addResult('📋 Response: ${response.body}');
      } else {
        _addResult('⚠️ REST API: Status ${response.statusCode}');
      }
    } catch (e) {
      _addResult('❌ REST API: Failed - $e');
    }
  }

  Future<void> _testGraphQLHealth() async {
    try {
      _addResult('🔍 Testing GraphQL endpoint...');
      
      final response = await http.get(
        Uri.parse(ApiConstants.graphqlUrl),
        headers: {'Content-Type': 'application/json'},
      ).timeout(Duration(seconds: 10));
      
      if (response.statusCode == 200 || response.statusCode == 400) {
        _addResult('✅ GraphQL: Endpoint accessible (${response.statusCode})');
      } else {
        _addResult('⚠️ GraphQL: Status ${response.statusCode}');
      }
    } catch (e) {
      _addResult('❌ GraphQL: Failed - $e');
    }
  }

  Future<void> _testAuthEndpoint() async {
    try {
      _addResult('🔍 Testing auth endpoint...');
      
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': 'test@example.com',
          'password': 'test123'
        }),
      ).timeout(Duration(seconds: 10));
      
      if (response.statusCode == 400 || response.statusCode == 401) {
        _addResult('✅ Auth endpoint: Responding correctly (${response.statusCode})');
      } else if (response.statusCode == 200) {
        _addResult('✅ Auth endpoint: Connected (${response.statusCode})');
      } else {
        _addResult('⚠️ Auth endpoint: Status ${response.statusCode}');
      }
    } catch (e) {
      _addResult('❌ Auth endpoint: Failed - $e');
    }
  }

  void _clearResults() {
    setState(() {
      _testResults.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Network Test'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: _clearResults,
            tooltip: 'Clear Results',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Configuration Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Server Configuration',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('📡 REST API: ${ApiConstants.baseUrl}'),
                    Text('🔗 GraphQL: ${ApiConstants.graphqlUrl}'),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Mobile Testing Mode',
                        style: TextStyle(
                          color: Colors.blue[800],
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Test Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isRunning ? null : _testConnection,
                icon: _isRunning 
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.network_check),
                label: Text(_isRunning ? 'Running Tests...' : 'Run Network Tests'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Results
            Text(
              'Test Results:',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: _testResults.isEmpty
                    ? const Center(
                        child: Text(
                          'Tap "Run Network Tests" to start testing',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: _testResults.length,
                        itemBuilder: (context, index) {
                          final result = _testResults[index];
                          Color textColor = Colors.black87;
                          
                          if (result.contains('✅')) {
                            textColor = Colors.green[700]!;
                          } else if (result.contains('❌')) {
                            textColor = Colors.red[700]!;
                          } else if (result.contains('⚠️')) {
                            textColor = Colors.orange[700]!;
                          } else if (result.contains('🔍')) {
                            textColor = Colors.blue[700]!;
                          }
                          
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 2),
                            child: Text(
                              result,
                              style: TextStyle(
                                color: textColor,
                                fontFamily: 'monospace',
                                fontSize: 12,
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
