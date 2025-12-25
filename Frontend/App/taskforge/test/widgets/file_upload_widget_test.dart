// test/widgets/file_upload_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskforge/widgets/file_upload_widget.dart';
import 'dart:io';

void main() {
  group('FileUploadWidget', () {
    testWidgets('displays upload button with default label',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FileUploadWidget(
              onFileSelected: (file) {},
            ),
          ),
        ),
      );

      expect(find.text('Choose File'), findsOneWidget);
      expect(find.byIcon(Icons.upload_file), findsOneWidget);
    });

    testWidgets('displays custom button label', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FileUploadWidget(
              onFileSelected: (file) {},
              buttonLabel: 'Upload Document',
            ),
          ),
        ),
      );

      expect(find.text('Upload Document'), findsOneWidget);
    });

    testWidgets('displays custom icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FileUploadWidget(
              onFileSelected: (file) {},
              buttonIcon: Icons.attach_file,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.attach_file), findsOneWidget);
    });

    testWidgets('renders ElevatedButton.icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FileUploadWidget(
              onFileSelected: (file) {},
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('initially shows no selected file', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FileUploadWidget(
              onFileSelected: (file) {},
            ),
          ),
        ),
      );

      // Should not show file info container
      expect(find.byIcon(Icons.insert_drive_file), findsNothing);
      expect(find.byIcon(Icons.close), findsNothing);
    });
  });

  group('ImageUploadWidget', () {
    testWidgets('displays upload button with default label',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImageUploadWidget(
              onImageSelected: (file) {},
            ),
          ),
        ),
      );

      expect(find.text('Choose Image'), findsOneWidget);
      expect(find.byIcon(Icons.image), findsOneWidget);
    });

    testWidgets('displays custom button label', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImageUploadWidget(
              onImageSelected: (file) {},
              buttonLabel: 'Select Photo',
            ),
          ),
        ),
      );

      expect(find.text('Select Photo'), findsOneWidget);
    });

    testWidgets('renders ElevatedButton.icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImageUploadWidget(
              onImageSelected: (file) {},
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('initially shows no selected image',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ImageUploadWidget(
              onImageSelected: (file) {},
            ),
          ),
        ),
      );

      // Should not show image preview
      expect(find.byType(ClipRRect), findsNothing);
      expect(find.byType(Image), findsNothing);
    });
  });
}
