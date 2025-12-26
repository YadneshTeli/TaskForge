import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class QuickTestButton extends StatelessWidget {
  const QuickTestButton({super.key});

  Future<void> _quickTest(BuildContext context) async {
    // Show loading
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(
              height: 16,
              width: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            ),
            SizedBox(width: 16),
            Text('🔍 Testing server connection...'),
          ],
        ),
        duration: Duration(seconds: 2),
      ),
    );

    try {
      print('🔍 Quick test: Testing server connection...');
      print('📡 Trying: ${ApiConstants.baseUrl}/health');
      
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/health'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));
      
      print('✅ Response status: ${response.statusCode}');
      print('📋 Response body: ${response.body}');
      
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Server connected! Status: ${response.statusCode}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('⚠️ Server responded with status: ${response.statusCode}'),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      debugPrint('Connection error: $e');
      final errorType = e.runtimeType.toString();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Cannot reach server ($errorType). Please check your connection.'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () => _quickTest(context),
      icon: const Icon(Icons.network_check),
      label: const Text('Test'),
      backgroundColor: Colors.blue[600],
      foregroundColor: Colors.white,
      heroTag: "network_test", // Unique hero tag
    );
  }
}
